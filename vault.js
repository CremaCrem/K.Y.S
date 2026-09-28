const fs = require('fs').promises;
const crypto = require('crypto');

// Vault file (v2): a random 32-byte vault key encrypts the entries with
// AES-256-GCM. The vault key itself is stored twice, each copy encrypted with
// a key derived (scrypt) from one secret: the master password or the recovery
// code. Either secret unlocks the vault; changing one only re-wraps the key.
//
// { format: 'kys-vault', version: 2,
//   keys: { password: Box+salt, recovery: Box+salt },
//   vault: Box }            Box = { iv, tag, data } (base64)

const FORMAT = 'kys-vault';
const VERSION = 2;
// ~128 MB and a few hundred ms per derivation: slow for brute force, fine for one unlock.
const SCRYPT = { N: 2 ** 17, r: 8, p: 1, maxmem: 256 * 1024 * 1024 };
// Crockford base32: no I, L, O, U, so the code survives being read aloud or handwritten.
const CODE_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

const b64 = buf => buf.toString('base64');
const unb64 = str => Buffer.from(str, 'base64');

function unreadable(filePath, reason) {
  return new Error(
    `The vault file is unreadable (${reason}): ${filePath}. ` +
    `The previous version is kept at ${filePath}.bak.`
  );
}

function deriveKey(secret, salt) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(secret.normalize('NFKC'), salt, 32, SCRYPT, (err, key) => (err ? reject(err) : resolve(key)));
  });
}

function seal(key, plaintext) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const data = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return { iv: b64(iv), tag: b64(cipher.getAuthTag()), data: b64(data) };
}

// Throws if the key is wrong or the data was tampered with (GCM authentication).
function open(key, box) {
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, unb64(box.iv));
  decipher.setAuthTag(unb64(box.tag));
  return Buffer.concat([decipher.update(unb64(box.data)), decipher.final()]);
}

async function wrapKey(secret, vaultKey) {
  const salt = crypto.randomBytes(16);
  return { salt: b64(salt), ...seal(await deriveKey(secret, salt), vaultKey) };
}

// Returns the vault key, or null if the secret is wrong.
async function unwrapKey(secret, wrapped) {
  const key = await deriveKey(secret, unb64(wrapped.salt));
  try {
    return open(key, wrapped);
  } catch {
    return null;
  }
}

// 24 characters = 120 random bits, shown as XXXX-XXXX-XXXX-XXXX-XXXX-XXXX.
function generateRecoveryCode() {
  const chars = Array.from({ length: 24 }, () => CODE_ALPHABET[crypto.randomInt(CODE_ALPHABET.length)]);
  return chars.join('').match(/.{4}/g).join('-');
}

// Accepts the code in any case, with or without dashes/spaces, and with the
// usual handwriting mix-ups (O for 0, I or L for 1).
function normalizeRecoveryCode(code) {
  return code.toUpperCase().replace(/[^0-9A-Z]/g, '').replace(/O/g, '0').replace(/[IL]/g, '1');
}

async function readJson(filePath) {
  let data;
  try {
    data = await fs.readFile(filePath, 'utf-8');
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
  try {
    return JSON.parse(data);
  } catch (err) {
    throw unreadable(filePath, err.message);
  }
}

async function readEncrypted(filePath) {
  const file = await readJson(filePath);
  if (!file || file.format !== FORMAT) throw unreadable(filePath, 'not an encrypted vault');
  if (file.version !== VERSION) throw unreadable(filePath, `unsupported version ${file.version}`);
  return file;
}

// Writes to a temp file, keeps the current file as .bak, then renames the temp
// file into place, so a crash mid-write can't leave a half-written vault.
async function writeAtomic(filePath, file) {
  const tmpPath = `${filePath}.tmp`;
  await fs.writeFile(tmpPath, JSON.stringify(file, null, 2));
  try {
    await fs.copyFile(filePath, `${filePath}.bak`);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
  await fs.rename(tmpPath, filePath);
}

// 'new' (no file), 'plaintext' (pre-1.0 vault), or 'encrypted'.
// Throws on anything unreadable, so it is never mistaken for an empty vault.
async function vaultStatus(filePath) {
  const file = await readJson(filePath);
  if (file === null) return 'new';
  if (Array.isArray(file)) return 'plaintext';
  if (file.format === FORMAT) return 'encrypted';
  throw unreadable(filePath, 'unknown format');
}

// Creates the encrypted vault, carrying over the entries of a pre-1.0
// plaintext vault if there is one, and removes the plaintext backup.
async function createVault(filePath, password) {
  const status = await vaultStatus(filePath);
  if (status === 'encrypted') throw new Error('The vault is already encrypted.');

  let entries = status === 'plaintext' ? await readJson(filePath) : [];
  entries = entries.map(entry => (entry.id ? entry : { ...entry, id: crypto.randomUUID() }));

  const key = crypto.randomBytes(32);
  const recoveryCode = generateRecoveryCode();
  await writeAtomic(filePath, {
    format: FORMAT,
    version: VERSION,
    keys: {
      password: await wrapKey(password, key),
      recovery: await wrapKey(normalizeRecoveryCode(recoveryCode), key),
    },
    vault: seal(key, JSON.stringify(entries)),
  });
  await fs.rm(`${filePath}.bak`, { force: true });
  return { key, recoveryCode };
}

async function unlockWithPassword(filePath, password) {
  const file = await readEncrypted(filePath);
  return unwrapKey(password, file.keys.password);
}

async function unlockWithRecoveryCode(filePath, code) {
  const file = await readEncrypted(filePath);
  return unwrapKey(normalizeRecoveryCode(code), file.keys.recovery);
}

async function setPassword(filePath, key, newPassword) {
  const file = await readEncrypted(filePath);
  file.keys.password = await wrapKey(newPassword, key);
  await writeAtomic(filePath, file);
}

// Replaces the recovery code. The old one stops working.
async function newRecoveryCode(filePath, key) {
  const file = await readEncrypted(filePath);
  const recoveryCode = generateRecoveryCode();
  file.keys.recovery = await wrapKey(normalizeRecoveryCode(recoveryCode), key);
  await writeAtomic(filePath, file);
  return recoveryCode;
}

async function readVault(filePath, key) {
  const file = await readEncrypted(filePath);
  try {
    return JSON.parse(open(key, file.vault).toString('utf-8'));
  } catch {
    throw unreadable(filePath, 'entries could not be decrypted');
  }
}

async function writeVault(filePath, key, entries) {
  const file = await readEncrypted(filePath);
  file.vault = seal(key, JSON.stringify(entries));
  await writeAtomic(filePath, file);
}

// Export file: the entries encrypted with a key derived (scrypt) from a
// password the user picks, often their master password. It doesn't depend on
// the vault key, so it can be imported into KYS on another computer.
//
// { format: 'kys-export', version: 1, salt, iv, tag, data } (base64)
const EXPORT_FORMAT = 'kys-export';
const EXPORT_VERSION = 1;

async function sealExport(entries, password) {
  const salt = crypto.randomBytes(16);
  const key = await deriveKey(password, salt);
  return { format: EXPORT_FORMAT, version: EXPORT_VERSION, salt: b64(salt), ...seal(key, JSON.stringify(entries)) };
}

// 'encrypted' (KYS export) or 'plain' (JSON array from KYS before 1.3); throws otherwise.
function exportKind(file) {
  if (Array.isArray(file)) return 'plain';
  if (file && file.format === EXPORT_FORMAT && file.version === EXPORT_VERSION) return 'encrypted';
  throw new Error('This is not a KYS export file.');
}

// Returns the entries, or null if the password is wrong (or the file was altered).
async function openExport(file, password) {
  const key = await deriveKey(password, unb64(file.salt));
  try {
    return JSON.parse(open(key, file).toString('utf-8'));
  } catch {
    return null;
  }
}

module.exports = {
  sealExport,
  exportKind,
  openExport,
  vaultStatus,
  createVault,
  unlockWithPassword,
  unlockWithRecoveryCode,
  setPassword,
  newRecoveryCode,
  readVault,
  writeVault,
};

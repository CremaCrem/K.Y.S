const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const vault = require('./vault');

const tmpVault = () => path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'kys-')), 'passwords.json');
const entry = { id: '1', site: 'Example', username: 'test@example.com', password: 'not-real-secret' };
const PASSWORD = 'correct horse battery';

test('status: missing file is new, array is plaintext, garbage throws', async () => {
  const file = tmpVault();
  assert.strictEqual(await vault.vaultStatus(file), 'new');
  fs.writeFileSync(file, JSON.stringify([entry]));
  assert.strictEqual(await vault.vaultStatus(file), 'plaintext');
  fs.writeFileSync(file, '{ not json');
  await assert.rejects(vault.vaultStatus(file), /unreadable/);
  fs.writeFileSync(file, '{}');
  await assert.rejects(vault.vaultStatus(file), /unreadable/);
});

test('setup encrypts a plaintext vault, keeps entries, removes the plaintext backup', async () => {
  const file = tmpVault();
  const { id, ...noId } = entry;
  fs.writeFileSync(file, JSON.stringify([entry, noId]));
  fs.writeFileSync(`${file}.bak`, JSON.stringify([entry]));

  const { key, recoveryCode } = await vault.createVault(file, PASSWORD);

  assert.match(recoveryCode, /^([0-9A-Z]{4}-){5}[0-9A-Z]{4}$/);
  assert.strictEqual(await vault.vaultStatus(file), 'encrypted');
  assert.ok(!fs.readFileSync(file, 'utf-8').includes('not-real-secret'));
  assert.ok(!fs.existsSync(`${file}.bak`));
  const entries = await vault.readVault(file, key);
  assert.strictEqual(entries.length, 2);
  assert.deepStrictEqual(entries[0], entry);
  assert.ok(entries[1].id);
});

test('setup refuses to overwrite an encrypted vault', async () => {
  const file = tmpVault();
  await vault.createVault(file, PASSWORD);
  await assert.rejects(vault.createVault(file, 'other password'), /already encrypted/);
});

test('password unlocks; wrong password returns null', async () => {
  const file = tmpVault();
  const { key } = await vault.createVault(file, PASSWORD);
  assert.ok(key.equals(await vault.unlockWithPassword(file, PASSWORD)));
  assert.strictEqual(await vault.unlockWithPassword(file, 'wrong password'), null);
});

test('recovery code unlocks, forgiving case, dashes, and O/I/L mix-ups', async () => {
  const file = tmpVault();
  const { key, recoveryCode } = await vault.createVault(file, PASSWORD);
  const sloppy = recoveryCode.toLowerCase().replace(/-/g, ' ').replace(/0/g, 'o').replace(/1/g, 'l');
  assert.ok(key.equals(await vault.unlockWithRecoveryCode(file, sloppy)));
  assert.strictEqual(await vault.unlockWithRecoveryCode(file, 'AAAA-AAAA-AAAA-AAAA-AAAA-AAAA'), null);
});

test('forgot password: recovery code + new password keeps entries', async () => {
  const file = tmpVault();
  const { key, recoveryCode } = await vault.createVault(file, PASSWORD);
  await vault.writeVault(file, key, [entry]);

  const recovered = await vault.unlockWithRecoveryCode(file, recoveryCode);
  await vault.setPassword(file, recovered, 'brand new password');

  assert.strictEqual(await vault.unlockWithPassword(file, PASSWORD), null);
  const newKey = await vault.unlockWithPassword(file, 'brand new password');
  assert.deepStrictEqual(await vault.readVault(file, newKey), [entry]);
  assert.ok(await vault.unlockWithRecoveryCode(file, recoveryCode), 'recovery code still works');
});

test('new recovery code replaces the old one', async () => {
  const file = tmpVault();
  const { key, recoveryCode } = await vault.createVault(file, PASSWORD);
  const next = await vault.newRecoveryCode(file, key);
  assert.strictEqual(await vault.unlockWithRecoveryCode(file, recoveryCode), null);
  assert.ok(key.equals(await vault.unlockWithRecoveryCode(file, next)));
});

test('writes round-trip, are atomic, and keep the previous version as .bak', async () => {
  const file = tmpVault();
  const { key } = await vault.createVault(file, PASSWORD);
  await vault.writeVault(file, key, [entry]);
  await vault.writeVault(file, key, []);
  assert.deepStrictEqual(await vault.readVault(file, key), []);
  assert.deepStrictEqual(await vault.readVault(`${file}.bak`, key), [entry]);
  assert.ok(!fs.existsSync(`${file}.tmp`));
});

test('tampered entries fail to decrypt instead of returning garbage', async () => {
  const file = tmpVault();
  const { key } = await vault.createVault(file, PASSWORD);
  const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
  data.vault.data = Buffer.from('tampered').toString('base64');
  fs.writeFileSync(file, JSON.stringify(data));
  await assert.rejects(vault.readVault(file, key), /unreadable/);
});

test('export: round-trips with its password, wrong password returns null', async () => {
  const file = await vault.sealExport([entry], PASSWORD);
  assert.strictEqual(vault.exportKind(file), 'encrypted');
  assert.ok(!JSON.stringify(file).includes('not-real-secret'));
  assert.deepStrictEqual(await vault.openExport(file, PASSWORD), [entry]);
  assert.strictEqual(await vault.openExport(file, 'wrong password'), null);
});

test('export: a changed file fails instead of importing garbage', async () => {
  const file = await vault.sealExport([entry], PASSWORD);
  file.data = Buffer.from('tampered').toString('base64');
  assert.strictEqual(await vault.openExport(file, PASSWORD), null);
});

test('export: recognizes old plain exports and rejects anything else', () => {
  assert.strictEqual(vault.exportKind([entry]), 'plain');
  assert.throws(() => vault.exportKind({ format: 'kys-vault' }), /not a KYS export/);
  assert.throws(() => vault.exportKind(null), /not a KYS export/);
});

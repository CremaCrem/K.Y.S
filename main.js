const { app, BrowserWindow, ipcMain, dialog, powerMonitor, protocol, net, clipboard, ClipboardItem, safeStorage } = require('electron');
const fs = require('fs').promises;
const path = require('path');
const { pathToFileURL } = require('url');
const crypto = require('crypto');
const {
  vaultStatus,
  createVault,
  unlockWithPassword,
  unlockWithRecoveryCode,
  setPassword,
  newRecoveryCode,
  readVault,
  writeVault,
  sealExport,
  exportKind,
  openExport,
} = require('./vault');
const { createProfileStore } = require('./profiles');

let mainWindow;

// The built UI is served from app://kys/ instead of file://, so the page gets
// no file:// privileges (the grantFileProtocolExtraPrivileges fuse is off) and
// can only reach files inside build/.
const APP_URL = 'app://kys/index.html';
const BUILD_DIR = path.join(__dirname, 'build');
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } },
]);

function serveBuild(request) {
  const filePath = path.join(BUILD_DIR, decodeURIComponent(new URL(request.url).pathname));
  if (!filePath.startsWith(BUILD_DIR + path.sep)) {
    return new Response('Not found', { status: 404 });
  }
  return net.fetch(pathToFileURL(filePath).toString());
}

// Each person's vault lives in their profile's folder under userData
// (persists across updates). See profiles.js.
let profileStore;
let currentProfileId = null;

function requireProfile() {
  if (!currentProfileId) throw new Error('No profile selected.');
  return currentProfileId;
}

const getPasswordsFilePath = () => profileStore.vaultPath(requireProfile());

// Old file path (for migration from old versions)
const getOldPasswordsFilePath = () => path.join(__dirname, 'passwords.json');

// Migrate passwords from the v0.1 location into userData (profiles.js then
// moves them into a first profile).
async function migrateOldPasswords() {
  const oldPath = getOldPasswordsFilePath();
  const newPath = path.join(app.getPath('userData'), 'passwords.json');
  
  try {
    await fs.access(oldPath);
    try {
      await fs.access(newPath);
      console.log('Migration skipped: new passwords file already exists');
    } catch {
      const data = await fs.readFile(oldPath, 'utf-8');
      await fs.writeFile(newPath, data);
      console.log('Successfully migrated passwords to:', newPath);
    }
  } catch {
    // Old file doesn't exist, nothing to migrate
  }
}

function createWindow() {
  // In development we load the icon directly from the project,
  // in production from the packaged resources folder.
  const isDev = !app.isPackaged;
  const iconPath = isDev
    ? path.join(__dirname, 'assets', 'KYS.ico')
    : path.join(process.resourcesPath, 'assets', 'KYS.ico');

  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    minWidth: 1024,
    minHeight: 768,
    frame: false,
    autoHideMenuBar: true,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  // In development we load the React dev server (ELECTRON_START_URL),
  // in production the built React files from /build via app://
  const startUrl = isDev && process.env.ELECTRON_START_URL
    ? process.env.ELECTRON_START_URL
    : APP_URL;
  
  console.log('Loading URL:', startUrl);

  // The window only ever shows KYS itself: no pop-ups, no navigating away.
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (new URL(url).origin !== new URL(startUrl).origin) event.preventDefault();
  });

  mainWindow.loadURL(startUrl).catch(err => {
    console.error('Failed to load URL:', err);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    vaultKey = null;
  });
  
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

app.on('ready', async () => {
  profileStore = createProfileStore(app.getPath('userData'));
  await migrateOldPasswords();
  await profileStore.migrateLegacy('Me');
  protocol.handle('app', serveBuild);
  createWindow();
  startAutoLock();
});
app.on('before-quit', (event) => {
  if (copiedPassword === null) return;
  event.preventDefault();
  clearCopiedPassword().finally(() => app.quit());
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Window control handlers
ipcMain.on('minimize-window', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('maximize-window', () => {
  if (mainWindow) {
    mainWindow.isMaximized() ? mainWindow.restore() : mainWindow.maximize();
  }
});

ipcMain.on('close-window', () => {
  if (mainWindow) mainWindow.close();
});

// The vault key lives only here, in memory, while the vault is unlocked.
// The UI never receives it.
let vaultKey = null;
const AUTO_LOCK_IDLE_SECONDS = 5 * 60;
const MIN_PASSWORD_LENGTH = 8;

// With more than one profile, locking also goes back to the profile picker,
// so whoever uses the computer next can pick themselves.
let profileCount = 0;

function lockVault() {
  clearCopiedPassword();
  pendingImport = null;
  if (!vaultKey) return;
  vaultKey = null;
  if (profileCount > 1) currentProfileId = null;
  if (mainWindow) mainWindow.webContents.send('vault-locked');
}

// Copied passwords are cleared after 30 s, on lock, and on quit, but only if
// the clipboard still holds that password (never wipe something copied since).
const CLIPBOARD_CLEAR_MS = 30 * 1000;
let copiedPassword = null;
let clipboardTimer = null;

// On Windows these clipboard formats keep the copy out of clipboard history
// (Win+V) and cloud clipboard sync. Other platforms don't need them.
const WINDOWS_NO_HISTORY = {
  'electron application/osclipboard;format="ExcludeClipboardContentFromMonitorProcessing"': new Blob([new Uint32Array([0])]),
  'electron application/osclipboard;format="CanIncludeInClipboardHistory"': new Blob([new Uint32Array([0])]),
  'electron application/osclipboard;format="CanUploadToCloudClipboard"': new Blob([new Uint32Array([0])]),
};

async function copySecret(text) {
  if (process.platform === 'win32') {
    try {
      await clipboard.write([new ClipboardItem({ 'text/plain': text, ...WINDOWS_NO_HISTORY })]);
      return;
    } catch (err) {
      console.error('Could not exclude the copy from clipboard history, copying normally:', err);
    }
  }
  await clipboard.writeText(text);
}

async function clearCopiedPassword() {
  clearTimeout(clipboardTimer);
  if (copiedPassword === null) return;
  const stillThere = (await clipboard.readText()) === copiedPassword;
  copiedPassword = null;
  if (stillThere) clipboard.clear();
}

function startAutoLock() {
  powerMonitor.on('lock-screen', lockVault);
  powerMonitor.on('suspend', lockVault);
  setInterval(() => {
    if (powerMonitor.getSystemIdleTime() >= AUTO_LOCK_IDLE_SECONDS) lockVault();
  }, 15 * 1000);
}

function requireUnlocked() {
  if (!vaultKey) throw new Error('The vault is locked.');
  return vaultKey;
}

function requireNewPassword(password) {
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`The master password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
}

const readPasswords = () => readVault(getPasswordsFilePath(), requireUnlocked());
const writePasswords = (passwords) => writeVault(getPasswordsFilePath(), requireUnlocked(), passwords);

// 'setup' (no vault yet, or a pre-1.0 plaintext one), 'locked', 'unlocked',
// or 'error' (unreadable file; the UI must not offer setup, which would overwrite it).
// "Remember on this computer": a copy of the vault key encrypted by the OS
// (safeStorage: DPAPI on Windows, Keychain on macOS), so only this OS account
// on this computer can use it. Kept in its own file, not in the vault, so a
// copied vault doesn't carry it along.
const getDeviceUnlockPath = () => profileStore.deviceUnlockPath(requireProfile());

// Uses the async safeStorage API; the sync one is removed in Electron 46.
async function canRemember() {
  // On Linux without a keyring, safeStorage falls back to a hardcoded key.
  if (process.platform === 'linux' && safeStorage.getSelectedStorageBackend() === 'basic_text') return false;
  return safeStorage.isAsyncEncryptionAvailable();
}

async function rememberKey(key) {
  await fs.writeFile(getDeviceUnlockPath(), await safeStorage.encryptStringAsync(key.toString('base64')));
}

async function isRemembered() {
  try {
    await fs.access(getDeviceUnlockPath());
    return true;
  } catch {
    return false;
  }
}

const forgetDevice = () => fs.rm(getDeviceUnlockPath(), { force: true });

// Returns the vault key, or null. A stored key that no longer opens this vault
// (other account or computer, vault set up again) is deleted.
async function readRememberedKey() {
  let encrypted;
  try {
    encrypted = await fs.readFile(getDeviceUnlockPath());
  } catch {
    return null;
  }
  try {
    const { result, shouldReEncrypt } = await safeStorage.decryptStringAsync(encrypted);
    const key = Buffer.from(result, 'base64');
    await readVault(getPasswordsFilePath(), key);
    if (shouldReEncrypt) await rememberKey(key); // the OS rotated its key
    return key;
  } catch {
    await forgetDevice();
    return null;
  }
}

// Switches to a profile (locked). A remembered profile opens right away:
// picking it is the one click.
async function selectProfile(id) {
  await profileStore.find(id);
  clearCopiedPassword();
  pendingImport = null;
  vaultKey = null;
  currentProfileId = id;
  vaultKey = await readRememberedKey();
}

let autoSelected = false;

// 'pick' (choose or create a profile), 'setup' (no vault yet, or a pre-1.0
// plaintext one), 'locked', 'unlocked', or 'error' (unreadable file; the UI
// must not offer setup, which would overwrite it).
ipcMain.handle('vault-status', async () => {
  const profiles = (await profileStore.list()).map(({ id, name }) => ({ id, name }));
  profileCount = profiles.length;
  // With a single profile there's nothing to pick: open it directly at launch.
  if (!currentProfileId && profiles.length === 1 && !autoSelected) {
    autoSelected = true;
    await selectProfile(profiles[0].id);
  }
  const profile = profiles.find(p => p.id === currentProfileId);
  if (!profile) return { status: 'pick', profiles };

  try {
    const status = await vaultStatus(getPasswordsFilePath());
    if (status !== 'encrypted') return { status: 'setup', profile, hasExistingPasswords: status === 'plaintext' };
    if (vaultKey) return { status: 'unlocked', profile };
    return { status: 'locked', profile, remembered: await isRemembered() };
  } catch (err) {
    return { status: 'error', profile, message: err.message };
  }
});

ipcMain.handle('select-profile', (event, id) => selectProfile(id));

// Back to the profile picker from a locked profile (or to add a person).
ipcMain.handle('switch-profile', () => {
  lockVault();
  vaultKey = null;
  currentProfileId = null;
  autoSelected = true;
});

// Name errors come back as { ok: false, error } so the UI can translate them.
async function withNameErrors(action) {
  try {
    return { ok: true, ...(await action()) };
  } catch (err) {
    if (err.key) return { ok: false, error: err.key };
    throw err;
  }
}

// New person: profile + master password in one step, so no half-made profiles.
ipcMain.handle('create-profile', (event, { name, password }) => withNameErrors(async () => {
  requireNewPassword(password);
  const profile = await profileStore.create(name);
  lockVault();
  currentProfileId = profile.id;
  const { key, recoveryCode } = await createVault(profileStore.vaultPath(profile.id), password);
  vaultKey = key;
  return { recoveryCode };
}));

ipcMain.handle('rename-profile', (event, name) => withNameErrors(async () => {
  requireUnlocked();
  const { id, name: saved } = await profileStore.rename(requireProfile(), name);
  return { profile: { id, name: saved } };
}));

// Deleting a profile (its vault and everything in it) needs its master password.
ipcMain.handle('delete-profile', async (event, password) => {
  requireUnlocked();
  if (!(await unlockWithPassword(getPasswordsFilePath(), password))) return { ok: false, error: 'wrongPassword' };
  const id = requireProfile();
  await profileStore.remove(id);
  lockVault();
  currentProfileId = null;
  return { ok: true };
});

ipcMain.handle('setup-vault', async (event, password) => {
  requireNewPassword(password);
  const { key, recoveryCode } = await createVault(getPasswordsFilePath(), password);
  await forgetDevice();
  vaultKey = key;
  return { recoveryCode };
});

ipcMain.handle('unlock', async (event, password) => {
  const key = await unlockWithPassword(getPasswordsFilePath(), password);
  if (!key) return { ok: false };
  vaultKey = key;
  return { ok: true };
});

// Forgot password: the recovery code unlocks the vault and sets a new password.
ipcMain.handle('recover', async (event, { recoveryCode, newPassword }) => {
  requireNewPassword(newPassword);
  const key = await unlockWithRecoveryCode(getPasswordsFilePath(), recoveryCode);
  if (!key) return { ok: false };
  await setPassword(getPasswordsFilePath(), key, newPassword);
  vaultKey = key;
  return { ok: true };
});

ipcMain.handle('lock', () => lockVault());

ipcMain.handle('change-password', async (event, { currentPassword, newPassword }) => {
  requireUnlocked();
  requireNewPassword(newPassword);
  const key = await unlockWithPassword(getPasswordsFilePath(), currentPassword);
  if (!key) return { ok: false };
  await setPassword(getPasswordsFilePath(), key, newPassword);
  return { ok: true };
});

ipcMain.handle('unlock-remembered', async () => {
  const key = await readRememberedKey();
  if (!key) return { ok: false };
  vaultKey = key;
  return { ok: true };
});

ipcMain.handle('get-remember', async () => ({ available: await canRemember(), remembered: await isRemembered() }));

ipcMain.handle('set-remember', async (event, enabled) => {
  const key = requireUnlocked();
  if (!enabled) return forgetDevice();
  if (!(await canRemember())) throw new Error('This computer cannot store the key securely.');
  await rememberKey(key);
});

ipcMain.handle('new-recovery-code', async () => {
  return { recoveryCode: await newRecoveryCode(getPasswordsFilePath(), requireUnlocked()) };
});

// Generate unique ID for entries
function generateId() {
  return crypto.randomUUID();
}

// Get all passwords
// The UI gets entries without passwords. It asks for one password at a time
// (reveal, edit), and copying happens here so the password never reaches it.
const withoutPassword = ({ password, ...entry }) => entry;

async function findPassword(id) {
  const entry = (await readPasswords()).find(p => p.id === id);
  if (!entry) throw new Error('Password entry not found');
  return entry.password;
}

ipcMain.handle('get-passwords', async () => {
  return (await readPasswords()).map(withoutPassword);
});

ipcMain.handle('get-password', (event, id) => findPassword(id));

ipcMain.handle('copy-password', async (event, id) => {
  const password = await findPassword(id);
  clearTimeout(clipboardTimer);
  await copySecret(password);
  copiedPassword = password;
  clipboardTimer = setTimeout(clearCopiedPassword, CLIPBOARD_CLEAR_MS);
});

// Check for duplicates
ipcMain.handle('check-duplicate', async (event, { site, username }) => {
  const passwords = await readPasswords();
  const duplicate = passwords.find(p => 
    p.site?.toLowerCase() === site?.toLowerCase() && 
    p.username?.toLowerCase() === username?.toLowerCase()
  );
  return { isDuplicate: !!duplicate, existing: duplicate && withoutPassword(duplicate) };
});

// Save a new password
ipcMain.handle('save-password', async (event, data) => {
  const { site, username, password, category, notes } = data;

  if (!site || !username || !password) {
    throw new Error('Site, username, and password are required!');
  }

  const passwords = await readPasswords();
  
  const newEntry = {
    id: generateId(),
    site,
    username,
    password,
    createdAt: new Date().toISOString()
  };
  
  if (category) newEntry.category = category;
  if (notes) newEntry.notes = notes;
  
  passwords.push(newEntry);
  await writePasswords(passwords);
  
  return { success: true, message: 'Password saved successfully!' };
});

// Update a single password by ID
ipcMain.handle('update-password', async (event, { id, updates }) => {
  const passwords = await readPasswords();
  const index = passwords.findIndex(p => p.id === id);
  
  if (index === -1) {
    throw new Error('Password entry not found');
  }
  
  const now = new Date().toISOString();
  const previous = passwords[index];
  // "Old" in the dashboard counts from the last password change, not any edit.
  // Entries from before 1.3 have no passwordChangedAt; their last edit is the best guess.
  const passwordChanged = updates.password !== undefined && updates.password !== previous.password;
  const passwordChangedAt = passwordChanged ? now : previous.passwordChangedAt || previous.updatedAt || previous.createdAt;
  passwords[index] = { ...previous, ...updates, updatedAt: now };
  if (passwordChangedAt) passwords[index].passwordChangedAt = passwordChangedAt;
  await writePasswords(passwords);
  
  return { success: true, message: 'Password updated successfully!' };
});

// Star/unstar. Not an edit: leaves updatedAt and passwordChangedAt alone.
ipcMain.handle('set-favorite', async (event, { id, favorite }) => {
  const passwords = await readPasswords();
  const entry = passwords.find(p => p.id === id);
  if (!entry) throw new Error('Password entry not found');
  if (favorite) entry.favorite = true;
  else delete entry.favorite;
  await writePasswords(passwords);
});

// Delete a password by ID
ipcMain.handle('delete-password', async (event, id) => {
  const passwords = await readPasswords();
  const filtered = passwords.filter(p => p.id !== id);
  
  if (filtered.length === passwords.length) {
    throw new Error('Password entry not found');
  }
  
  await writePasswords(filtered);
  return { success: true, message: 'Password deleted successfully!' };
});

// Export: a password-protected .kys file for moving passwords to KYS on
// another computer. Asks for the master password first, so an unlocked (or
// remembered) KYS can't be exported by whoever is at the keyboard.
ipcMain.handle('export-passwords', async (event, { masterPassword, filePassword }) => {
  requireUnlocked();
  if (!(await unlockWithPassword(getPasswordsFilePath(), masterPassword))) {
    return { ok: false, error: 'wrongPassword' };
  }
  const password = filePassword || masterPassword;
  requireNewPassword(password);

  const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
    title: 'Export passwords',
    defaultPath: `kys-export-${new Date().toISOString().split('T')[0]}.kys`,
    filters: [{ name: 'KYS export', extensions: ['kys'] }],
  });
  if (canceled || !filePath) return { ok: false, cancelled: true };

  const entries = (await readPasswords()).map(({ id, ...rest }) => rest);
  await fs.writeFile(filePath, JSON.stringify(await sealExport(entries, password)));
  return { ok: true, count: entries.length };
});

// Import: the chosen file stays here. An encrypted export waits in
// pendingImport until the UI sends its password; the UI never sees the contents.
let pendingImport = null;

// Only known fields with the right types come in from an import file.
const IMPORT_TEXT_FIELDS = ['site', 'username', 'password', 'category', 'notes', 'createdAt', 'updatedAt', 'passwordChangedAt'];

function cleanImported(entry) {
  if (!entry || typeof entry !== 'object') return null;
  const clean = {};
  for (const field of IMPORT_TEXT_FIELDS) {
    if (typeof entry[field] === 'string' && entry[field]) clean[field] = entry[field];
  }
  if (!clean.site && typeof entry.website === 'string') clean.site = entry.website; // pre-0.2 exports
  if (entry.favorite === true) clean.favorite = true;
  return clean.site && clean.username && clean.password ? clean : null;
}

// Adds entries not already saved (same site + username), skips the rest.
async function importEntries(incoming) {
  const passwords = await readPasswords();
  const now = new Date().toISOString();
  let imported = 0;
  let skipped = 0;
  for (const raw of incoming) {
    const entry = cleanImported(raw);
    const duplicate = entry && passwords.some(p =>
      p.site?.toLowerCase() === entry.site.toLowerCase() &&
      p.username?.toLowerCase() === entry.username.toLowerCase()
    );
    if (!entry || duplicate) {
      skipped++;
      continue;
    }
    passwords.push({ ...entry, id: generateId(), importedAt: now });
    imported++;
  }
  await writePasswords(passwords);
  return { ok: true, imported, skipped };
}

ipcMain.handle('import-passwords', async () => {
  requireUnlocked();
  const { filePaths, canceled } = await dialog.showOpenDialog(mainWindow, {
    title: 'Import passwords',
    filters: [{ name: 'KYS export', extensions: ['kys', 'json'] }],
    properties: ['openFile'],
  });
  if (canceled || !filePaths.length) return { ok: false, cancelled: true };

  let file;
  let kind;
  try {
    file = JSON.parse(await fs.readFile(filePaths[0], 'utf-8'));
    kind = exportKind(file);
  } catch {
    return { ok: false, error: 'notExportFile' };
  }
  if (kind === 'encrypted') {
    pendingImport = file;
    return { ok: false, needsPassword: true, fileName: path.basename(filePaths[0]) };
  }
  return importEntries(file);
});

ipcMain.handle('import-with-password', async (event, password) => {
  requireUnlocked();
  if (!pendingImport) throw new Error('Choose a file to import first.');
  const entries = await openExport(pendingImport, password);
  if (!entries) return { ok: false, error: 'wrongPassword' };
  pendingImport = null;
  return importEntries(Array.isArray(entries) ? entries : []);
});

// Password health for the dashboard: which entries are weak, reused, or old.
// Runs here because the UI doesn't hold passwords. Uses the same strength
// rules as the UI's meter (src/utils/passwordStrength.mjs).
const OLD_AFTER_DAYS = 90;

ipcMain.handle('get-stats', async () => {
  const { passwordStrength } = await import('./src/utils/passwordStrength.mjs');
  const passwords = await readPasswords();

  const uses = {};
  for (const p of passwords) uses[p.password] = (uses[p.password] || 0) + 1;
  const cutoff = Date.now() - OLD_AFTER_DAYS * 24 * 60 * 60 * 1000;

  const issues = {};
  for (const p of passwords) {
    const found = [];
    if (passwordStrength(p.password) === 'weak') found.push('weak');
    if (uses[p.password] > 1) found.push('reused');
    if (Date.parse(p.passwordChangedAt || p.updatedAt || p.createdAt) < cutoff) found.push('old');
    if (found.length) issues[p.id] = found;
  }
  const count = (issue) => Object.values(issues).filter(found => found.includes(issue)).length;

  return { total: passwords.length, weak: count('weak'), reused: count('reused'), old: count('old'), issues };
});

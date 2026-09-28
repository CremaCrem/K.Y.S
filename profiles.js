const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Profiles let several people use KYS on one Windows account. Each profile
// has its own folder with its own vault, backup, and remembered key.
//
// <root>/profiles.json              { profiles: [{ id, name, createdAt }] }  (names aren't secret)
// <root>/profiles/<id>/passwords.json   (+ .bak, device-unlock.bin)
const MAX_NAME_LENGTH = 30;
// Files that lived directly in <root> before profiles (KYS 1.3 and earlier).
const LEGACY_FILES = ['passwords.json', 'passwords.json.bak', 'device-unlock.bin'];

// Errors the UI shows as a translated message (`key`).
function nameError(key, message) {
  return Object.assign(new Error(message), { key });
}

function createProfileStore(root) {
  const listPath = path.join(root, 'profiles.json');
  const dirOf = (id) => path.join(root, 'profiles', id);

  async function list() {
    try {
      return JSON.parse(await fs.readFile(listPath, 'utf-8')).profiles;
    } catch (err) {
      if (err.code === 'ENOENT') return [];
      throw err;
    }
  }

  async function save(profiles) {
    await fs.writeFile(`${listPath}.tmp`, JSON.stringify({ profiles }, null, 2));
    await fs.rename(`${listPath}.tmp`, listPath);
  }

  function cleanName(name, profiles, exceptId) {
    const clean = typeof name === 'string' ? name.trim() : '';
    if (!clean || clean.length > MAX_NAME_LENGTH) throw nameError('nameInvalid', 'Enter a name of up to 30 characters.');
    const taken = profiles.some(p => p.id !== exceptId && p.name.toLowerCase() === clean.toLowerCase());
    if (taken) throw nameError('nameTaken', 'Another profile already uses that name.');
    return clean;
  }

  async function find(id) {
    const profile = (await list()).find(p => p.id === id);
    if (!profile) throw new Error('Profile not found');
    return profile;
  }

  async function create(name) {
    const profiles = await list();
    const profile = { id: crypto.randomUUID(), name: cleanName(name, profiles), createdAt: new Date().toISOString() };
    await fs.mkdir(dirOf(profile.id), { recursive: true });
    await save([...profiles, profile]);
    return profile;
  }

  async function rename(id, name) {
    const profiles = await list();
    const profile = profiles.find(p => p.id === id);
    if (!profile) throw new Error('Profile not found');
    profile.name = cleanName(name, profiles, id);
    await save(profiles);
    return profile;
  }

  // Only ids from the list are ever turned into paths.
  async function remove(id) {
    await find(id);
    await fs.rm(dirOf(id), { recursive: true, force: true });
    await save((await list()).filter(p => p.id !== id));
  }

  // Moves a pre-profiles vault into a first profile. The files move before the
  // list is saved, so an interrupted move is simply retried on the next launch.
  async function migrateLegacy(defaultName) {
    if ((await list()).length) return null;
    try {
      await fs.access(path.join(root, 'passwords.json'));
    } catch {
      return null;
    }
    const profile = { id: crypto.randomUUID(), name: defaultName, createdAt: new Date().toISOString() };
    await fs.mkdir(dirOf(profile.id), { recursive: true });
    for (const file of LEGACY_FILES) {
      try {
        await fs.rename(path.join(root, file), path.join(dirOf(profile.id), file));
      } catch (err) {
        if (err.code !== 'ENOENT') throw err;
      }
    }
    await save([profile]);
    return profile;
  }

  return {
    list,
    find,
    create,
    rename,
    remove,
    migrateLegacy,
    vaultPath: (id) => path.join(dirOf(id), 'passwords.json'),
    deviceUnlockPath: (id) => path.join(dirOf(id), 'device-unlock.bin'),
  };
}

module.exports = { createProfileStore };

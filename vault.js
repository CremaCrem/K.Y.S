const fs = require('fs').promises;
const crypto = require('crypto');

// A missing file is an empty vault. Any other problem throws, so a corrupted
// vault is never mistaken for an empty one and overwritten on the next save.
async function readVault(filePath) {
  let data;
  try {
    data = await fs.readFile(filePath, 'utf-8');
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }

  let entries;
  try {
    entries = JSON.parse(data);
    if (!Array.isArray(entries)) throw new Error('expected a list of entries');
  } catch (err) {
    throw new Error(
      `The vault file is unreadable (${err.message}): ${filePath}. ` +
      `The previous version is kept at ${filePath}.bak.`
    );
  }

  // Entries from before v0.2.0 have no id.
  if (entries.some(entry => !entry.id)) {
    entries = entries.map(entry => (entry.id ? entry : { ...entry, id: crypto.randomUUID() }));
    await writeVault(filePath, entries);
  }

  return entries;
}

// Writes to a temp file, keeps the current file as .bak, then renames the temp
// file into place, so a crash mid-write can't leave a half-written vault.
async function writeVault(filePath, entries) {
  const tmpPath = `${filePath}.tmp`;
  await fs.writeFile(tmpPath, JSON.stringify(entries, null, 2));
  try {
    await fs.copyFile(filePath, `${filePath}.bak`);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
  await fs.rename(tmpPath, filePath);
}

module.exports = { readVault, writeVault };

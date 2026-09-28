const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { readVault, writeVault } = require('./vault');

const tmpVault = () => path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'kys-')), 'passwords.json');
const entry = { id: '1', site: 'Example', username: 'test@example.com', password: 'not-real' };

test('missing file reads as an empty vault', async () => {
  assert.deepStrictEqual(await readVault(tmpVault()), []);
});

test('write then read round-trips and leaves no temp file', async () => {
  const file = tmpVault();
  await writeVault(file, [entry]);
  assert.deepStrictEqual(await readVault(file), [entry]);
  assert.ok(!fs.existsSync(`${file}.tmp`));
});

test('each write keeps the previous version as .bak', async () => {
  const file = tmpVault();
  await writeVault(file, [entry]);
  await writeVault(file, []);
  assert.deepStrictEqual(JSON.parse(fs.readFileSync(`${file}.bak`, 'utf-8')), [entry]);
});

test('corrupted file throws and is left untouched', async () => {
  const file = tmpVault();
  fs.writeFileSync(file, '{ not json');
  await assert.rejects(readVault(file), /unreadable/);
  assert.strictEqual(fs.readFileSync(file, 'utf-8'), '{ not json');
});

test('non-array JSON throws', async () => {
  const file = tmpVault();
  fs.writeFileSync(file, '{}');
  await assert.rejects(readVault(file), /unreadable/);
});

test('entries without an id get one', async () => {
  const file = tmpVault();
  const { id, ...noId } = entry;
  fs.writeFileSync(file, JSON.stringify([noId]));
  const [read] = await readVault(file);
  assert.ok(read.id);
  assert.strictEqual(JSON.parse(fs.readFileSync(file, 'utf-8'))[0].id, read.id);
});

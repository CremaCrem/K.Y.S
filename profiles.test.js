const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { createProfileStore } = require('./profiles');

const tmpRoot = () => fs.mkdtempSync(path.join(os.tmpdir(), 'kys-profiles-'));

test('no profiles on a fresh install', async () => {
  assert.deepStrictEqual(await createProfileStore(tmpRoot()).list(), []);
});

test('create gives each profile its own folder and vault path', async () => {
  const store = createProfileStore(tmpRoot());
  const mom = await store.create('  Mom ');
  const dad = await store.create('Dad');
  assert.strictEqual(mom.name, 'Mom');
  assert.notStrictEqual(store.vaultPath(mom.id), store.vaultPath(dad.id));
  assert.ok(fs.existsSync(path.dirname(store.vaultPath(mom.id))));
  assert.deepStrictEqual((await store.list()).map(p => p.name), ['Mom', 'Dad']);
});

test('names must be 1-30 characters and unique (ignoring case)', async () => {
  const store = createProfileStore(tmpRoot());
  await store.create('Mom');
  await assert.rejects(store.create('mom'), e => e.key === 'nameTaken');
  await assert.rejects(store.create('   '), e => e.key === 'nameInvalid');
  await assert.rejects(store.create('x'.repeat(31)), e => e.key === 'nameInvalid');
  await assert.rejects(store.create(42), e => e.key === 'nameInvalid');
});

test('rename keeps the id, allows re-casing its own name, rejects taken names', async () => {
  const store = createProfileStore(tmpRoot());
  const mom = await store.create('Mom');
  await store.create('Dad');
  assert.strictEqual((await store.rename(mom.id, 'MOM')).name, 'MOM');
  await assert.rejects(store.rename(mom.id, 'dad'), e => e.key === 'nameTaken');
  assert.strictEqual((await store.find(mom.id)).name, 'MOM');
});

test('remove deletes only that profile and its files', async () => {
  const store = createProfileStore(tmpRoot());
  const mom = await store.create('Mom');
  const dad = await store.create('Dad');
  fs.writeFileSync(store.vaultPath(mom.id), 'mom vault');
  fs.writeFileSync(store.vaultPath(dad.id), 'dad vault');
  await store.remove(mom.id);
  assert.ok(!fs.existsSync(store.vaultPath(mom.id)));
  assert.strictEqual(fs.readFileSync(store.vaultPath(dad.id), 'utf-8'), 'dad vault');
  assert.deepStrictEqual((await store.list()).map(p => p.name), ['Dad']);
});

test('remove refuses ids that are not in the list', async () => {
  const store = createProfileStore(tmpRoot());
  await assert.rejects(store.remove('../../somewhere'), /Profile not found/);
});

test('migrateLegacy moves a pre-profiles vault into a first profile', async () => {
  const root = tmpRoot();
  fs.writeFileSync(path.join(root, 'passwords.json'), 'old vault');
  fs.writeFileSync(path.join(root, 'passwords.json.bak'), 'old backup');
  fs.writeFileSync(path.join(root, 'device-unlock.bin'), 'old key');
  const store = createProfileStore(root);

  const profile = await store.migrateLegacy('Me');

  assert.strictEqual(profile.name, 'Me');
  assert.strictEqual(fs.readFileSync(store.vaultPath(profile.id), 'utf-8'), 'old vault');
  assert.strictEqual(fs.readFileSync(`${store.vaultPath(profile.id)}.bak`, 'utf-8'), 'old backup');
  assert.strictEqual(fs.readFileSync(store.deviceUnlockPath(profile.id), 'utf-8'), 'old key');
  assert.ok(!fs.existsSync(path.join(root, 'passwords.json')));
  assert.strictEqual(await store.migrateLegacy('Me'), null, 'runs only once');
});

test('migrateLegacy does nothing without an old vault', async () => {
  const store = createProfileStore(tmpRoot());
  assert.strictEqual(await store.migrateLegacy('Me'), null);
  assert.deepStrictEqual(await store.list(), []);
});

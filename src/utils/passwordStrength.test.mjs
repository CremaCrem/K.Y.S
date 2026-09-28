import { test } from 'node:test';
import assert from 'node:assert';
import { passwordStrength } from './passwordStrength.mjs';
import { generatePassword } from './generatePassword.mjs';

const expect = (password, strength) => assert.strictEqual(passwordStrength(password), strength, password);

test('common passwords and patterns are weak, whatever their character types', () => {
  expect('Password1!', 'weak');
  expect('Qwerty123!', 'weak');
  expect('12345678', 'weak');
  expect('aaaaaaaa', 'weak');
  expect('abcdefgh', 'weak');
  expect('iloveyou2', 'weak');
});

test('short human passwords are fair at best', () => {
  expect('Simcity5', 'fair');
  expect('Tr0ub4dor', 'fair');
});

test('long passwords are strong even without symbols', () => {
  expect(generatePassword({ length: 32, symbols: false }), 'strong');
  expect('correct horse battery staple', 'strong');
});

test('every generated password is strong at the default length', () => {
  for (let i = 0; i < 200; i++) expect(generatePassword(), 'strong');
});

test('empty password is weak', () => {
  expect('', 'weak');
});

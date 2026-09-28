import { test } from 'node:test';
import assert from 'node:assert';
import { generatePassword, randomIndex, MIN_LENGTH, MAX_LENGTH, DEFAULT_LENGTH } from './generatePassword.mjs';

test('default length, and length is clamped to the allowed range', () => {
  assert.strictEqual(generatePassword().length, DEFAULT_LENGTH);
  assert.strictEqual(generatePassword({ length: 25 }).length, 25);
  assert.strictEqual(generatePassword({ length: 4 }).length, MIN_LENGTH);
  assert.strictEqual(generatePassword({ length: 999 }).length, MAX_LENGTH);
});

test('always contains every enabled character type, and nothing else', () => {
  for (let i = 0; i < 500; i++) {
    const pw = generatePassword({ length: MIN_LENGTH });
    assert.match(pw, /[a-z]/);
    assert.match(pw, /[A-Z]/);
    assert.match(pw, /[0-9]/);
    assert.match(pw, /[!@#$%^&*]/);
    assert.match(pw, /^[A-Za-z0-9!@#$%^&*]+$/);
  }
});

test('symbols off means no symbols', () => {
  for (let i = 0; i < 500; i++) {
    const pw = generatePassword({ symbols: false });
    assert.match(pw, /^[A-Za-z0-9]+$/);
    assert.match(pw, /[a-z]/);
    assert.match(pw, /[A-Z]/);
    assert.match(pw, /[0-9]/);
  }
});

test('randomIndex is uniform (no modulo bias)', () => {
  const n = 7;
  const draws = 70000;
  const counts = new Array(n).fill(0);
  for (let i = 0; i < draws; i++) counts[randomIndex(n)]++;
  for (const c of counts) assert.ok(Math.abs(c - draws / n) < draws / n * 0.05, `count ${c} too far from ${draws / n}`);
});

test('passwords do not repeat', () => {
  const seen = new Set(Array.from({ length: 1000 }, () => generatePassword()));
  assert.strictEqual(seen.size, 1000);
});

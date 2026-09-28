const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*';

export const MIN_LENGTH = 12;
export const MAX_LENGTH = 32;
export const DEFAULT_LENGTH = 20;

// Uniform random integer in [0, n) from the OS's secure random source.
// Values from the top, incomplete range are redrawn so small numbers
// aren't slightly more likely (modulo bias).
export function randomIndex(n) {
  const limit = 2 ** 32 - (2 ** 32 % n);
  const buf = new Uint32Array(1);
  do {
    crypto.getRandomValues(buf);
  } while (buf[0] >= limit);
  return buf[0] % n;
}

// At least one character from each enabled set, the rest from all of them,
// then shuffled so the guaranteed ones aren't always at the front.
export function generatePassword({ length = DEFAULT_LENGTH, symbols = true } = {}) {
  const size = Math.min(MAX_LENGTH, Math.max(MIN_LENGTH, length));
  const sets = symbols ? [LOWER, UPPER, DIGITS, SYMBOLS] : [LOWER, UPPER, DIGITS];
  const all = sets.join('');

  const chars = sets.map(set => set[randomIndex(set.length)]);
  while (chars.length < size) chars.push(all[randomIndex(all.length)]);

  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

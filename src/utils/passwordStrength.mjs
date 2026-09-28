// A rough strength estimate in bits: effective length × log2(character pool).
// Length counts most. Patterns people actually use (common passwords,
// repeated characters, runs like "1234" or "abcd") count as almost nothing,
// because they're the first things an attacker tries.

const COMMON = [
  'password', 'passw0rd', 'qwerty', 'asdf', '123456', 'iloveyou', 'admin', 'welcome',
  'letmein', 'monkey', 'dragon', 'football', 'baseball', 'sunshine', 'princess',
  'master', 'login', 'abc123', '111111',
];

function poolSize(password) {
  let pool = 0;
  if (/[a-z]/.test(password)) pool += 26;
  if (/[A-Z]/.test(password)) pool += 26;
  if (/[0-9]/.test(password)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(password)) pool += 33;
  return pool;
}

// Length after collapsing each common word to one character, and not
// counting the 3rd+ character of a repeat ("aaa") or a run ("abc", "321").
function effectiveLength(password) {
  let s = password.toLowerCase();
  for (const word of COMMON) s = s.split(word).join('\u0000');

  let length = 0;
  for (let i = 0; i < s.length; i++) {
    const [a, b, c] = [s.charCodeAt(i - 2), s.charCodeAt(i - 1), s.charCodeAt(i)];
    const repeat = c === b && b === a;
    const run = c - b === b - a && Math.abs(c - b) === 1;
    if (!repeat && !run) length++;
  }
  return length;
}

export function passwordBits(password) {
  if (!password) return 0;
  return effectiveLength(password) * Math.log2(poolSize(password));
}

export function passwordStrength(password) {
  const bits = passwordBits(password);
  if (bits < 40) return 'weak';
  if (bits < 60) return 'fair';
  if (bits < 75) return 'good';
  return 'strong';
}

const { SanitizePipe } = require('../dist/src/common/pipes/sanitize.pipe');
const { SpamGuard } = require('../dist/src/common/guards/spam-guard');

console.log('====================================================');
console.log('       ORANGE GLOBAL SECURITY VERIFICATION TEST     ');
console.log('====================================================\n');

let totalTests = 0;
let passedTests = 0;

function assert(description, condition) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${description}`);
  } else {
    console.error(`  ❌ [FAIL] ${description}`);
  }
}

// ─────────────────────────────────────────────────────────────
// TEST 1: SQL INJECTION DEFENSE (SanitizePipe)
// ─────────────────────────────────────────────────────────────
console.log('🛡️  TEST SUITE 1: SQL Injection Detection');
const pipe = new SanitizePipe();

const sqlAttacks = [
  { field: 'subject', payload: "' OR 1=1 --" },
  { field: 'message', payload: "SELECT * FROM users WHERE 'a'='a'" },
  { field: 'fullName', payload: "Admin'; DROP TABLE contact_messages; --" },
  { field: 'subject', payload: "UNION SELECT null, username, password FROM users" },
  { field: 'subject', payload: "WAITFOR DELAY '0:0:5'" },
];

for (const attack of sqlAttacks) {
  let blocked = false;
  try {
    pipe.transform({ [attack.field]: attack.payload }, { type: 'body' });
  } catch (err) {
    blocked = err.status === 400 || err.message === 'Invalid input detected';
  }
  assert(`Blocks SQL injection payload: "${attack.payload.substring(0, 35)}..."`, blocked);
}

// ─────────────────────────────────────────────────────────────
// TEST 2: STORED XSS & HTML STRIPPING (SanitizePipe)
// ─────────────────────────────────────────────────────────────
console.log('\n🛡️  TEST SUITE 2: Stored XSS & HTML Tag Stripping');

const xssPayloads = [
  { input: '<script>alert("hacked")</script>Hello', expected: 'Hello' },
  { input: '<img src="x" onerror="stealCookies()">Inquiry Details', expected: 'Inquiry Details' },
  { input: '<iframe src="malicious.site"></iframe>Legit text', expected: 'Legit text' },
];

for (const test of xssPayloads) {
  const result = pipe.transform({ message: test.input }, { type: 'body' });
  assert(`Strips HTML/XSS tag from "${test.input}" -> "${result.message}"`, result.message === test.expected);
}

// ─────────────────────────────────────────────────────────────
// TEST 3: PASSWORD & TOKEN PRESERVATION (SanitizePipe)
// ─────────────────────────────────────────────────────────────
console.log('\n🛡️  TEST SUITE 3: Password & Auth Token Integrity');

const rawPassword = 'P@ss<word>123! -- ';
const passwordResult = pipe.transform({ password: rawPassword }, { type: 'body' });
assert('Preserves exact characters in password (does not break bcrypt)', passwordResult.password === rawPassword);

// ─────────────────────────────────────────────────────────────
// TEST 4: HONEYPOT BOT TRAP (SpamGuard)
// ─────────────────────────────────────────────────────────────
console.log('\n🛡️  TEST SUITE 4: Honeypot Bot Trap (SpamGuard)');
const spamGuard = new SpamGuard();

function mockContext(body) {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        body,
        ip: '127.0.0.1',
      }),
    }),
  };
}

let honeypotBlocked = false;
try {
  spamGuard.canActivate(mockContext({
    fullName: 'Bot Crawler',
    email: 'bot@spam.com',
    message: 'Buy our products now',
    website: 'http://spam-link.com', // Bot auto-filled honeypot
    _formLoadedAt: Date.now() - 10000,
  }));
} catch (err) {
  honeypotBlocked = err.status === 403 || err.message === 'Request rejected';
}
assert('Rejects bot submission when hidden honeypot "website" is populated (403 Forbidden)', honeypotBlocked);

// ─────────────────────────────────────────────────────────────
// TEST 5: SPEED TRAP / TIMING CHECK (SpamGuard)
// ─────────────────────────────────────────────────────────────
console.log('\n🛡️  TEST SUITE 5: Speed Trap / Instant Bot Submission Detection');

let fastBotBlocked = false;
try {
  spamGuard.canActivate(mockContext({
    fullName: 'Lightning Bot',
    email: 'fast@bot.com',
    message: 'Submitted in 400 milliseconds by automation',
    _formLoadedAt: Date.now() - 400, // Only 400ms old -> BOT!
  }));
} catch (err) {
  fastBotBlocked = err.status === 403 || err.message === 'Request rejected';
}
assert('Rejects instant submission submitted in < 3 seconds (403 Forbidden)', fastBotBlocked);

// ─────────────────────────────────────────────────────────────
// TEST 6: LEGITIMATE HUMAN FLOW (SpamGuard)
// ─────────────────────────────────────────────────────────────
console.log('\n🛡️  TEST SUITE 6: Legitimate Human Submission');

let humanAllowed = false;
try {
  humanAllowed = spamGuard.canActivate(mockContext({
    fullName: 'Sarah Jenkins',
    email: 'sarah@example.com',
    message: 'I would like to inquire about software engineering opportunities in Australia.',
    _formLoadedAt: Date.now() - 12000, // 12 seconds old -> HUMAN!
  }));
} catch (err) {
  humanAllowed = false;
}
assert('Allows clean human submission with normal elapsed time (200/201 OK)', humanAllowed === true);

// ─────────────────────────────────────────────────────────────
// SUMMARY
// ─────────────────────────────────────────────────────────────
console.log('\n====================================================');
console.log(`SUMMARY: ${passedTests}/${totalTests} Tests Passed (${Math.round((passedTests/totalTests)*100)}%)`);
console.log('====================================================\n');

if (passedTests === totalTests) {
  console.log('🎉 ALL SECURITY FEATURES ARE FULLY OPERATIONAL AND VERIFIED!');
  process.exit(0);
} else {
  console.error('❌ SOME SECURITY TESTS FAILED.');
  process.exit(1);
}

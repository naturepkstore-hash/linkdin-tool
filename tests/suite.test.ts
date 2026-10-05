import { hashPassword, verifyPassword, signSessionToken, verifySessionToken } from '../src/lib/auth';
import { analyzeContentQuality } from '../src/lib/quality';
import { encrypt, decrypt } from '../src/lib/encryption';

async function runTests() {
  console.log('--------------------------------------------------');
  console.log('🧪 Starting PostFlow AI Automated Test Suite');
  console.log('--------------------------------------------------');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Password Hashing Test
  const testPass = 'SuperSecret123!';
  const hash = await hashPassword(testPass);
  assert(await verifyPassword(testPass, hash), 'Password hashing and verification with bcrypt');
  assert(!(await verifyPassword('WrongPassword', hash)), 'Rejection of invalid password');

  // 2. Encryption / Decryption Test (AES-256-GCM)
  const token = 'AQV...simulated_linkedin_oauth_token_982341';
  const encrypted = encrypt(token);
  assert(encrypted !== token && encrypted.includes(':'), 'Token encryption produces formatted ciphertext');
  const decrypted = decrypt(encrypted);
  assert(decrypted === token, 'Token decryption restores original sensitive secret');

  // 3. JWT Session Signing Test
  const sessionData = {
    userId: 'user_123',
    email: 'creator@example.com',
    name: 'Creator',
    role: 'USER',
    timezone: 'America/New_York',
  };
  const jwt = signSessionToken(sessionData);
  const verified = verifySessionToken(jwt);
  assert(verified?.userId === 'user_123' && verified?.email === 'creator@example.com', 'JWT session token signs and verifies claims accurately');

  // 4. Content Quality Analyzer Test
  const goodPost = `90% of LinkedIn creators fail at SEO because of this 1 mistake.\n\nHere is what you must do instead:\n\n1. Target long tail keywords.\n2. Write for intent.\n\nWhat is your biggest SEO challenge? Drop it below 👇\n\n#SEO #Growth #Marketing`;
  const analysis = analyzeContentQuality(goodPost);
  assert(analysis.hookScore === 'Excellent' || analysis.hookScore === 'Good', 'Quality analyzer identifies punchy hook');
  assert(analysis.ctaScore === 'Present', 'Quality analyzer recognizes CTA question');
  assert(analysis.hashtagCount === 3, 'Quality analyzer counts hashtags correctly');
  assert(analysis.overallScore >= 70, 'Quality score calculates high rating for structured content');

  // 5. Short/Poor post check
  const poorPost = `Hello`;
  const poorAnalysis = analyzeContentQuality(poorPost);
  assert(poorAnalysis.ctaScore === 'Missing', 'Quality analyzer flags missing CTA');
  assert(poorAnalysis.overallScore < 50, 'Quality analyzer flags low score for inadequate content');

  console.log('--------------------------------------------------');
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
  console.log('--------------------------------------------------');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});

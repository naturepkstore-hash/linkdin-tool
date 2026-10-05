import { hashPassword, verifyPassword, signSessionToken, verifySessionToken } from '../src/lib/auth';
import { analyzeContentQuality } from '../src/lib/quality';
import { encrypt, decrypt } from '../src/lib/encryption';
import { generateKeyPairSync, sign as signBytes } from 'node:crypto';
import { isValidGitHubActionsToken } from '../src/lib/github-actions-auth';
import { SEO_365_PLAN } from '../src/data/seo365Plan';
import { generateBrandedDailyImage } from '../src/lib/brand-image';
import { isCanonicalSeo365Series } from '../src/lib/seo365';
import { getLocalDayBounds, getLocalDateParts, zonedDateTimeToUtc } from '../src/lib/timezone';

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

  // 4. Scheduled worker authorization via GitHub Actions OIDC
  const originalFetch = globalThis.fetch;
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'test-key', alg: 'RS256', use: 'sig' };
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ keys: [jwk] }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });

  function createActionsToken(repository: string) {
    const header = Buffer.from(JSON.stringify({ alg: 'RS256', kid: 'test-key' })).toString('base64url');
    const claims = Buffer.from(
      JSON.stringify({
        iss: 'https://token.actions.githubusercontent.com',
        aud: 'postflow-scheduled-publishing',
        exp: Math.floor(Date.now() / 1000) + 60,
        repository,
        ref: 'refs/heads/main',
        workflow_ref:
          'naturepkstore-hash/linkdin-tool/.github/workflows/linkedin-scheduled-publishing.yml@refs/heads/main',
      }),
    ).toString('base64url');
    const signingInput = `${header}.${claims}`;
    const signature = signBytes('RSA-SHA256', Buffer.from(signingInput), privateKey).toString('base64url');
    return `${signingInput}.${signature}`;
  }

  try {
    const actionsToken = createActionsToken('naturepkstore-hash/linkdin-tool');
    assert(
      await isValidGitHubActionsToken(actionsToken),
      'GitHub Actions OIDC accepts the scheduled workflow from the production repository',
    );
    assert(
      !(await isValidGitHubActionsToken(createActionsToken('attacker/untrusted-repository'))),
      'GitHub Actions OIDC rejects tokens from other repositories',
    );
    const tokenParts = actionsToken.split('.');
    const tamperedSignature = Buffer.from(tokenParts[2] ?? '', 'base64url');
    tamperedSignature[0] ^= 0x01;
    tokenParts[2] = tamperedSignature.toString('base64url');
    const tamperedToken = tokenParts.join('.');
    assert(
      !(await isValidGitHubActionsToken(tamperedToken)),
      'GitHub Actions OIDC rejects tokens with an invalid signature',
    );
  } finally {
    globalThis.fetch = originalFetch;
  }

  // 5. Daily publishing plan and timezone tests
  assert(
    isCanonicalSeo365Series(SEO_365_PLAN.map(({ dayNumber, topic }) => ({ dayNumber, topic }))),
    'Canonical SEO series matches all 365 curated topics',
  );
  assert(
    !isCanonicalSeo365Series(SEO_365_PLAN.slice(0, 364).map(({ dayNumber, topic }) => ({ dayNumber, topic }))),
    'Incomplete series is not treated as the canonical 365-day plan',
  );

  const pktSchedule = zonedDateTimeToUtc(
    { year: 2026, month: 10, day: 5 },
    19,
    15,
    'Asia/Karachi',
  );
  assert(
    pktSchedule.toISOString() === '2026-10-05T14:15:00.000Z',
    'Pakistan 19:15 posting time is converted to the correct UTC instant',
  );
  const pktDayBounds = getLocalDayBounds(new Date('2026-10-05T17:00:00.000Z'), 'Asia/Karachi');
  assert(
    pktDayBounds.start.toISOString() === '2026-10-04T19:00:00.000Z' &&
      pktDayBounds.end.toISOString() === '2026-10-05T19:00:00.000Z',
    'Pakistan local-day boundaries do not cross into adjacent posting days',
  );
  assert(
    getLocalDateParts(pktSchedule, 'Asia/Karachi').hour === 19,
    'UTC conversion round-trips to the intended Pakistan local hour',
  );

  // 6. Branded image generation test
  const brandedImage = await generateBrandedDailyImage({
    dayNumber: 3,
    topic: 'Search intent before keyword volume',
    takeaways: ['Understand what searchers need.', 'Match pages to intent.', 'Measure qualified results.'],
  });
  assert(
    brandedImage.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) &&
      brandedImage.readUInt32BE(16) === 1080 &&
      brandedImage.readUInt32BE(20) === 1080,
    'Free local brand renderer creates a valid 1080x1080 PNG',
  );

  // 7. Content Quality Analyzer Test
  const goodPost = `90% of LinkedIn creators fail at SEO because of this 1 mistake.\n\nHere is what you must do instead:\n\n1. Target long tail keywords.\n2. Write for intent.\n\nWhat is your biggest SEO challenge? Drop it below 👇\n\n#SEO #Growth #Marketing`;
  const analysis = analyzeContentQuality(goodPost);
  assert(analysis.hookScore === 'Excellent' || analysis.hookScore === 'Good', 'Quality analyzer identifies punchy hook');
  assert(analysis.ctaScore === 'Present', 'Quality analyzer recognizes CTA question');
  assert(analysis.hashtagCount === 3, 'Quality analyzer counts hashtags correctly');
  assert(analysis.overallScore >= 70, 'Quality score calculates high rating for structured content');

  // 8. Short/Poor post check
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

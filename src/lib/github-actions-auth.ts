import { createPublicKey, verify } from 'node:crypto';

const GITHUB_ACTIONS_ISSUER = 'https://token.actions.githubusercontent.com';
const GITHUB_ACTIONS_AUDIENCE = 'postflow-scheduled-publishing';
const SCHEDULED_WORKFLOW_REF =
  'naturepkstore-hash/linkdin-tool/.github/workflows/linkedin-scheduled-publishing.yml@refs/heads/main';
const GITHUB_ACTIONS_JWKS_URL =
  'https://token.actions.githubusercontent.com/.well-known/jwks';
const JWKS_CACHE_DURATION_MS = 5 * 60 * 1000;

type GitHubActionsJwk = JsonWebKey & {
  kid: string;
  alg?: string;
  use?: string;
};

interface GitHubActionsClaims {
  iss?: unknown;
  aud?: unknown;
  exp?: unknown;
  nbf?: unknown;
  repository?: unknown;
  ref?: unknown;
  workflow_ref?: unknown;
}

interface GitHubActionsHeader {
  alg?: unknown;
  kid?: unknown;
}

let cachedJwks: { keys: GitHubActionsJwk[]; expiresAt: number } | undefined;

function decodeJsonSegment<T>(segment: string): T | null {
  if (!/^[A-Za-z0-9_-]+$/.test(segment)) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(segment, 'base64url').toString('utf8')) as T;
  } catch {
    return null;
  }
}

async function getSigningKey(keyId: string): Promise<GitHubActionsJwk | null> {
  if (!cachedJwks || cachedJwks.expiresAt <= Date.now()) {
    const response = await fetch(GITHUB_ACTIONS_JWKS_URL, {
      headers: { accept: 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error(`GitHub Actions signing-key request failed (${response.status}).`);
    }

    const jwks = (await response.json()) as { keys?: GitHubActionsJwk[] };
    if (!Array.isArray(jwks.keys)) {
      throw new Error('GitHub Actions signing-key response was invalid.');
    }

    cachedJwks = {
      keys: jwks.keys,
      expiresAt: Date.now() + JWKS_CACHE_DURATION_MS,
    };
  }

  const key = cachedJwks.keys.find((candidate) => candidate.kid === keyId);
  if (!key) {
    return null;
  }

  return key;
}

export async function isValidGitHubActionsToken(token: string): Promise<boolean> {
  const [encodedHeader, encodedClaims, encodedSignature, extraSegment] = token.split('.');
  if (!encodedHeader || !encodedClaims || !encodedSignature || extraSegment !== undefined) {
    return false;
  }

  const header = decodeJsonSegment<GitHubActionsHeader>(encodedHeader);
  const claims = decodeJsonSegment<GitHubActionsClaims>(encodedClaims);
  if (
    header?.alg !== 'RS256' ||
    typeof header.kid !== 'string' ||
    claims?.iss !== GITHUB_ACTIONS_ISSUER ||
    claims.repository !== 'naturepkstore-hash/linkdin-tool' ||
    claims.ref !== 'refs/heads/main' ||
    claims.workflow_ref !== SCHEDULED_WORKFLOW_REF ||
    (claims.aud !== GITHUB_ACTIONS_AUDIENCE &&
      !(Array.isArray(claims.aud) && claims.aud.includes(GITHUB_ACTIONS_AUDIENCE))) ||
    typeof claims.exp !== 'number' ||
    claims.exp <= Math.floor(Date.now() / 1000) ||
    (typeof claims.nbf === 'number' && claims.nbf > Math.floor(Date.now() / 1000))
  ) {
    return false;
  }

  const signingKey = await getSigningKey(header.kid);
  if (
    !signingKey ||
    signingKey.kty !== 'RSA' ||
    typeof signingKey.n !== 'string' ||
    typeof signingKey.e !== 'string' ||
    (signingKey.alg && signingKey.alg !== 'RS256') ||
    signingKey.use === 'enc'
  ) {
    return false;
  }

  const publicKey = createPublicKey({
    key: { kty: signingKey.kty, n: signingKey.n, e: signingKey.e },
    format: 'jwk',
  });
  return verify(
    'RSA-SHA256',
    Buffer.from(`${encodedHeader}.${encodedClaims}`),
    publicKey,
    Buffer.from(encodedSignature, 'base64url'),
  );
}

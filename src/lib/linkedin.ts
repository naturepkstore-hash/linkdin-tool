import { decrypt } from './encryption';

export interface LinkedInProfile {
  sub: string;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email?: string;
}

export interface LinkedInPublishResult {
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: {
    code: string;
    message: string;
    status?: number;
    details?: unknown;
  };
}

const LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
const LINKEDIN_USERINFO_URL = 'https://api.linkedin.com/v2/userinfo';
const LINKEDIN_UGC_POST_URL = 'https://api.linkedin.com/v2/ugcPosts';
const LINKEDIN_ASSETS_URL = 'https://api.linkedin.com/v2/assets?action=registerUpload';

function isPlaceholder(value: string | undefined): boolean {
  return (
    !value ||
    value.startsWith('your_') ||
    value === 'MOCK_CLIENT_ID' ||
    value.includes('yourdomain.com')
  );
}

/**
 * Generate official LinkedIn OAuth 2.0 Authorization URL
 */
export function getLinkedInAuthUrl(state: string): string {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI;

  if (process.env.NODE_ENV === 'production' && (isPlaceholder(clientId) || isPlaceholder(redirectUri))) {
    throw new Error('LINKEDIN_CLIENT_ID and LINKEDIN_REDIRECT_URI must be configured in production.');
  }
  
  // Standard scopes for LinkedIn Sign In with OpenID Connect + Share on LinkedIn
  const scopes = ['openid', 'profile', 'email', 'w_member_social'].join(' ');
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId || 'MOCK_CLIENT_ID',
    redirect_uri: redirectUri || 'http://localhost:3000/api/linkedin/callback',
    state: state,
    scope: scopes,
  });

  return `${LINKEDIN_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange Authorization Code for Access Token
 */
export async function exchangeLinkedInCode(code: string): Promise<{
  accessToken: string;
  expiresIn: number;
  refreshToken?: string;
  refreshTokenExpiresIn?: number;
  scope?: string;
}> {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI;

  // If running in development without live LinkedIn app credentials, provide simulated dev handshake
  if (isPlaceholder(clientId) || isPlaceholder(clientSecret) || isPlaceholder(redirectUri)) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, and LINKEDIN_REDIRECT_URI must be configured in production.');
    }
    return {
      accessToken: 'simulated_li_access_token_' + Date.now(),
      expiresIn: 5184000, // 60 days
      scope: 'openid profile email w_member_social',
    };
  }

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Configure valid LinkedIn OAuth credentials and redirect URI.');
  }

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch(LINKEDIN_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error_description || errorData.message || `LinkedIn Token Exchange Failed (${response.status})`
    );
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
    refreshToken: data.refresh_token,
    refreshTokenExpiresIn: data.refresh_token_expires_in,
    scope: data.scope,
  };
}

/**
 * Fetch authenticated user's LinkedIn profile using UserInfo endpoint
 */
export async function getLinkedInUserProfile(accessToken: string): Promise<LinkedInProfile> {
  // Simulated fallback if mock token
  if (accessToken.startsWith('simulated_li_access_token_')) {
    return {
      sub: 'li_user_dev_982341',
      name: 'Alex Rivera (Demo)',
      given_name: 'Alex',
      family_name: 'Rivera',
      picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      email: 'alex.rivera@example.com',
    };
  }

  const response = await fetch(LINKEDIN_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('LINKEDIN_AUTH_EXPIRED');
    }
    const errText = await response.text();
    throw new Error(`Failed to fetch LinkedIn profile: ${errText}`);
  }

  return response.json();
}

/**
 * Upload Image to LinkedIn Media Asset Storage using official 2-step register + upload flow
 */
export async function uploadLinkedInImage(
  accessToken: string,
  personUrn: string,
  imageBuffer: Buffer,
  mimeType: string
): Promise<string> {
  if (accessToken.startsWith('simulated_li_access_token_')) {
    return `urn:li:digitalmediaAsset:simulated_${Date.now()}`;
  }

  // Step 1: Register upload with LinkedIn
  const registerPayload = {
    registerUploadRequest: {
      recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
      owner: personUrn.startsWith('urn:li:person:') ? personUrn : `urn:li:person:${personUrn}`,
      supportedUploadMechanism: ['SYNCHRONOUS_UPLOAD'],
    },
  };

  const registerRes = await fetch(LINKEDIN_ASSETS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(registerPayload),
  });

  if (!registerRes.ok) {
    const err = await registerRes.json().catch(() => ({}));
    throw new Error(`LinkedIn Image Register Failed: ${JSON.stringify(err)}`);
  }

  const registerData = await registerRes.json();
  const uploadUrl = registerData.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
  const assetUrn = registerData.value.asset;

  // Step 2: Binary upload to LinkedIn provided URL
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': mimeType || 'image/jpeg',
    },
    body: new Uint8Array(imageBuffer),
  });

  if (!uploadRes.ok) {
    throw new Error(`LinkedIn Binary Upload Failed with status ${uploadRes.status}`);
  }

  return assetUrn;
}

/**
 * Publish post to LinkedIn using official UGC Posts API
 */
export async function publishToLinkedIn({
  encryptedToken,
  authorUrn,
  text,
  mediaAssetUrns = [],
}: {
  encryptedToken: string;
  authorUrn: string;
  text: string;
  mediaAssetUrns?: string[];
}): Promise<LinkedInPublishResult> {
  const token = decrypt(encryptedToken);

  if (!token) {
    return {
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Could not decrypt LinkedIn access token. Please reconnect your account.',
      },
    };
  }

  // If simulation mode
  if (token.startsWith('simulated_li_access_token_')) {
    const mockPostId = `urn:li:ugcPost:${Date.now()}`;
    return {
      success: true,
      postId: mockPostId,
      postUrl: `https://www.linkedin.com/feed/update/${mockPostId}`,
    };
  }

  const formattedAuthor = authorUrn.startsWith('urn:li:person:') || authorUrn.startsWith('urn:li:organization:')
    ? authorUrn
    : `urn:li:person:${authorUrn}`;

  // Build UGC Post Payload
  let shareMediaCategory = 'NONE';
  const mediaObjects: Array<Record<string, unknown>> = [];

  if (mediaAssetUrns.length > 0) {
    shareMediaCategory = 'IMAGE';
    for (const asset of mediaAssetUrns) {
      mediaObjects.push({
        status: 'READY',
        description: {
          text: 'Post Image',
        },
        media: asset,
        title: {
          text: 'Shared Image',
        },
      });
    }
  }

  const ugcPayload = {
    author: formattedAuthor,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: text,
        },
        shareMediaCategory: shareMediaCategory,
        ...(mediaObjects.length > 0 ? { media: mediaObjects } : {}),
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
    },
  };

  try {
    const response = await fetch(LINKEDIN_UGC_POST_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(ugcPayload),
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      
      if (response.status === 401) {
        return {
          success: false,
          error: {
            code: 'LINKEDIN_AUTH_EXPIRED',
            message: 'LinkedIn authorization expired or revoked. Please reconnect your account.',
            status: 401,
            details: errorJson,
          },
        };
      }

      if (response.status === 403) {
        return {
          success: false,
          error: {
            code: 'LINKEDIN_PERMISSION_DENIED',
            message: 'Insufficient LinkedIn permissions. Ensure w_member_social scope is granted.',
            status: 403,
            details: errorJson,
          },
        };
      }

      if (response.status === 429) {
        return {
          success: false,
          error: {
            code: 'LINKEDIN_RATE_LIMITED',
            message: 'LinkedIn API rate limit reached. The system will retry automatically.',
            status: 429,
            details: errorJson,
          },
        };
      }

      return {
        success: false,
        error: {
          code: 'LINKEDIN_API_ERROR',
          message: errorJson.message || `LinkedIn API error (${response.status})`,
          status: response.status,
          details: errorJson,
        },
      };
    }

    const resData = await response.json().catch(() => ({}));
    const returnedId = resData.id || response.headers.get('x-restli-id') || `urn:li:ugcPost:${Date.now()}`;
    
    return {
      success: true,
      postId: returnedId,
      postUrl: `https://www.linkedin.com/feed/update/${returnedId}`,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown network failure';
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: errorMessage,
      },
    };
  }
}

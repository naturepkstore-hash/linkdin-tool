import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { exchangeLinkedInCode, getLinkedInUserProfile } from '@/lib/linkedin';
import { encrypt } from '@/lib/encryption';
import { createAuditLog } from '@/lib/audit';
import { createNotification } from '@/lib/notifications';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const state = searchParams.get('state');

  const appUrl =
    process.env.APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

  if (error) {
    console.error('LinkedIn OAuth returned error:', error, errorDescription);
    return NextResponse.redirect(
      new URL(`/dashboard/linkedin?error=${encodeURIComponent(errorDescription || error)}`, appUrl)
    );
  }

  if (!code) {
    return NextResponse.redirect(new URL('/dashboard/linkedin?error=Missing+Authorization+Code', appUrl));
  }

  try {
    let targetUserId: string | null = null;
    if (state) {
      try {
        const decoded = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
        targetUserId = decoded.userId;
      } catch {
        console.warn('Could not parse state parameter');
      }
    }

    if (!targetUserId) {
      const currentUser = await getCurrentUser();
      targetUserId = currentUser?.userId || null;
    }

    if (!targetUserId) {
      return NextResponse.redirect(new URL('/login?error=Session+Expired', appUrl));
    }

    // Exchange code for tokens
    const tokenData = await exchangeLinkedInCode(code);
    const profile = await getLinkedInUserProfile(tokenData.accessToken);

    const encryptedToken = encrypt(tokenData.accessToken);
    const encryptedRefresh = tokenData.refreshToken ? encrypt(tokenData.refreshToken) : null;
    const expiresAt = new Date(Date.now() + (tokenData.expiresIn || 5184000) * 1000);

    // Upsert SocialAccount
    const socialAccount = await prisma.socialAccount.upsert({
      where: {
        userId_provider_providerAccountId: {
          userId: targetUserId,
          provider: 'linkedin',
          providerAccountId: profile.sub,
        },
      },
      update: {
        displayName: profile.name,
        avatarUrl: profile.picture || null,
        accessTokenEncrypted: encryptedToken,
        refreshTokenEncrypted: encryptedRefresh,
        tokenExpiresAt: expiresAt,
        scopes: tokenData.scope || 'openid profile email w_member_social',
        status: 'CONNECTED',
      },
      create: {
        userId: targetUserId,
        provider: 'linkedin',
        providerAccountId: profile.sub,
        displayName: profile.name,
        headline: 'LinkedIn Creator',
        avatarUrl: profile.picture || null,
        profileUrl: `https://www.linkedin.com/in/${profile.sub}`,
        accessTokenEncrypted: encryptedToken,
        refreshTokenEncrypted: encryptedRefresh,
        tokenExpiresAt: expiresAt,
        scopes: tokenData.scope || 'openid profile email w_member_social',
        status: 'CONNECTED',
      },
    });

    await createAuditLog({
      userId: targetUserId,
      action: 'LINKEDIN_CONNECTED',
      entityType: 'SOCIAL_ACCOUNT',
      entityId: socialAccount.id,
      details: { accountName: profile.name, providerAccountId: profile.sub },
    });

    await createNotification({
      userId: targetUserId,
      title: 'LinkedIn Connected Successfully',
      message: `Account "${profile.name}" is now connected for auto-publishing.`,
      type: 'SUCCESS',
      link: '/dashboard/linkedin',
    });

    return NextResponse.redirect(new URL('/dashboard/linkedin?connected=true', appUrl));
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown OAuth error';
    console.error('LinkedIn OAuth callback handling failed:', err);
    return NextResponse.redirect(
      new URL(`/dashboard/linkedin?error=${encodeURIComponent(errorMsg)}`, appUrl)
    );
  }
}

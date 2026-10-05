import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 });
    }

    const accounts = await prisma.socialAccount.findMany({
      where: { userId: user.userId, provider: 'linkedin' },
      select: {
        id: true,
        provider: true,
        providerAccountId: true,
        displayName: true,
        headline: true,
        avatarUrl: true,
        profileUrl: true,
        scopes: true,
        status: true,
        tokenExpiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      connected: accounts.length > 0 && accounts[0].status === 'CONNECTED',
      accounts,
      account: accounts[0] || null,
    });
  } catch (error) {
    console.error('LinkedIn profile fetch error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to fetch LinkedIn profile' } },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';
import { createNotification } from '@/lib/notifications';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 });
    }

    const { accountId } = await request.json().catch(() => ({}));

    if (accountId) {
      await prisma.socialAccount.deleteMany({
        where: { id: accountId, userId: user.userId },
      });
    } else {
      // Disconnect all LinkedIn accounts for this user
      await prisma.socialAccount.deleteMany({
        where: { userId: user.userId, provider: 'linkedin' },
      });
    }

    await createAuditLog({
      userId: user.userId,
      action: 'LINKEDIN_DISCONNECTED',
      entityType: 'SOCIAL_ACCOUNT',
      entityId: accountId || 'ALL',
    });

    await createNotification({
      userId: user.userId,
      title: 'LinkedIn Account Disconnected',
      message: 'Your LinkedIn account has been disconnected.',
      type: 'INFO',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('LinkedIn disconnect error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to disconnect LinkedIn account' } },
      { status: 500 }
    );
  }
}

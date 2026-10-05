import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 });
    }

    const { id } = await params;
    const post = await prisma.post.findFirst({
      where: { id, userId: user.userId },
    });

    if (!post) {
      return NextResponse.json({ success: false, error: { message: 'Post not found' } }, { status: 404 });
    }

    if (post.status === 'PUBLISHED') {
      return NextResponse.json(
        { success: false, error: { message: 'Cannot cancel an already published post' } },
        { status: 400 }
      );
    }

    const updated = await prisma.post.update({
      where: { id },
      data: {
        status: 'DRAFT',
        scheduledAt: null,
      },
    });

    await createAuditLog({
      userId: user.userId,
      action: 'POST_SCHEDULE_CANCELLED',
      entityType: 'POST',
      entityId: id,
    });

    return NextResponse.json({ success: true, post: updated });
  } catch (error) {
    console.error('Cancel schedule error:', error);
    return NextResponse.json({ success: false, error: { message: 'Failed to cancel schedule' } }, { status: 500 });
  }
}

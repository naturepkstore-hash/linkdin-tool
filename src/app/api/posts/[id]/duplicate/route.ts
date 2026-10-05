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
      include: { media: true },
    });

    if (!post) {
      return NextResponse.json({ success: false, error: { message: 'Post not found' } }, { status: 404 });
    }

    const duplicated = await prisma.post.create({
      data: {
        userId: user.userId,
        socialAccountId: post.socialAccountId,
        content: post.content,
        contentType: post.contentType,
        status: 'DRAFT',
        timezone: post.timezone,
        media: post.media.length > 0 ? {
          connect: post.media.map(m => ({ id: m.id })),
        } : undefined,
      },
    });

    await createAuditLog({
      userId: user.userId,
      action: 'POST_DUPLICATED',
      entityType: 'POST',
      entityId: duplicated.id,
      details: { originalPostId: id },
    });

    return NextResponse.json({ success: true, post: duplicated });
  } catch (error) {
    console.error('Duplicate post error:', error);
    return NextResponse.json({ success: false, error: { message: 'Failed to duplicate post' } }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';

export async function GET(
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
      include: {
        socialAccount: true,
        media: true,
        analytics: true,
      },
    });

    if (!post) {
      return NextResponse.json({ success: false, error: { message: 'Post not found' } }, { status: 404 });
    }

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error('Fetch post error:', error);
    return NextResponse.json({ success: false, error: { message: 'Failed to fetch post' } }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.post.findFirst({
      where: { id, userId: user.userId },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: { message: 'Post not found' } }, { status: 404 });
    }

    // Do not allow editing already published posts directly
    if (existing.status === 'PUBLISHED') {
      return NextResponse.json(
        { success: false, error: { message: 'Cannot edit already published posts' } },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { content, contentType, status, scheduledAt, timezone } = body;

    const updated = await prisma.post.update({
      where: { id },
      data: {
        ...(content !== undefined ? { content: content.trim() } : {}),
        ...(contentType !== undefined ? { contentType } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(scheduledAt !== undefined ? { scheduledAt: scheduledAt ? new Date(scheduledAt) : null } : {}),
        ...(timezone !== undefined ? { timezone } : {}),
      },
      include: {
        socialAccount: true,
        media: true,
        analytics: true,
      },
    });

    await createAuditLog({
      userId: user.userId,
      action: 'POST_UPDATED',
      entityType: 'POST',
      entityId: id,
    });

    return NextResponse.json({ success: true, post: updated });
  } catch (error) {
    console.error('Update post error:', error);
    return NextResponse.json({ success: false, error: { message: 'Failed to update post' } }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.post.findFirst({
      where: { id, userId: user.userId },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: { message: 'Post not found' } }, { status: 404 });
    }

    await prisma.post.delete({
      where: { id },
    });

    await createAuditLog({
      userId: user.userId,
      action: 'POST_DELETED',
      entityType: 'POST',
      entityId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete post error:', error);
    return NextResponse.json({ success: false, error: { message: 'Failed to delete post' } }, { status: 500 });
  }
}

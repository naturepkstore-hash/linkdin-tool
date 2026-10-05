import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { processPublishJob } from '@/lib/scheduler';

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
      include: { socialAccount: true },
    });

    if (!post) {
      return NextResponse.json({ success: false, error: { message: 'Post not found' } }, { status: 404 });
    }

    // Associate active LinkedIn account if not associated
    if (!post.socialAccountId) {
      const activeAccount = await prisma.socialAccount.findFirst({
        where: { userId: user.userId, provider: 'linkedin', status: 'CONNECTED' },
      });
      if (activeAccount) {
        await prisma.post.update({
          where: { id },
          data: { socialAccountId: activeAccount.id },
        });
      }
    }

    // Trigger publishing worker
    const result = await processPublishJob(id);

    const updatedPost = await prisma.post.findUnique({
      where: { id },
      include: { socialAccount: true, media: true, analytics: true },
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          post: updatedPost,
          error: { message: result.error || 'Publishing failed. Please check your LinkedIn connection.' },
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      post: updatedPost,
    });
  } catch (error) {
    console.error('Immediate publish error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Publishing execution failed' } },
      { status: 500 }
    );
  }
}

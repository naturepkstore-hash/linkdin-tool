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
    const series = await prisma.contentSeries.findFirst({
      where: { id, userId: user.userId },
      include: {
        seriesPosts: {
          where: { status: 'READY' },
        },
      },
    });

    if (!series) {
      return NextResponse.json({ success: false, error: { message: 'Series not found' } }, { status: 404 });
    }

    const socialAccount = await prisma.socialAccount.findFirst({
      where: { userId: user.userId, provider: 'linkedin', status: 'CONNECTED' },
    });

    let scheduledCount = 0;

    for (const seriesPost of series.seriesPosts) {
      if (!seriesPost.content) continue;

      // Construct target scheduled DateTime
      const date = seriesPost.scheduledDate || new Date();
      const [hours, minutes] = (seriesPost.scheduledTime || series.postingTime || '09:00').split(':').map(Number);
      
      const targetTime = new Date(date);
      targetTime.setHours(hours || 9, minutes || 0, 0, 0);

      // Create linked Post record
      const post = await prisma.post.create({
        data: {
          userId: user.userId,
          socialAccountId: socialAccount?.id || null,
          content: seriesPost.content,
          contentType: 'TEXT',
          status: 'SCHEDULED',
          scheduledAt: targetTime,
          timezone: series.timezone,
        },
      });

      // Update series post
      await prisma.seriesPost.update({
        where: { id: seriesPost.id },
        data: {
          status: 'SCHEDULED',
          postId: post.id,
        },
      });

      scheduledCount++;
    }

    await createAuditLog({
      userId: user.userId,
      action: 'SERIES_POSTS_SCHEDULED',
      entityType: 'SERIES',
      entityId: id,
      details: { scheduledCount },
    });

    return NextResponse.json({
      success: true,
      scheduledCount,
    });
  } catch (error) {
    console.error('Schedule series posts error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to schedule series posts' } },
      { status: 500 }
    );
  }
}

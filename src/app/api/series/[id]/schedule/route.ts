import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';
import { isCanonicalSeo365Series } from '@/lib/seo365';
import { getLocalDateParts, zonedDateTimeToUtc } from '@/lib/timezone';

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
          orderBy: { dayNumber: 'asc' },
        },
      },
    });

    if (!series) {
      return NextResponse.json({ success: false, error: { message: 'Series not found' } }, { status: 404 });
    }

    if (series.totalDays === 365 && isCanonicalSeo365Series(series.seriesPosts)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'The 365-day SEO plan is scheduled automatically one post at a time; bulk scheduling is disabled to prevent a backlog.',
          },
        },
        { status: 409 }
      );
    }

    const socialAccount = await prisma.socialAccount.findFirst({
      where: { userId: user.userId, provider: 'linkedin', status: 'CONNECTED' },
    });

    let scheduledCount = 0;
    let skippedPastCount = 0;
    const now = new Date();

    for (const seriesPost of series.seriesPosts) {
      if (
        seriesPost.status !== 'READY' ||
        seriesPost.postId ||
        !seriesPost.content
      ) continue;

      const date = seriesPost.scheduledDate || now;
      const [hours, minutes] = (seriesPost.scheduledTime || series.postingTime || '09:00').split(':').map(Number);
      const localDate = seriesPost.scheduledDate
        ? {
            year: date.getUTCFullYear(),
            month: date.getUTCMonth() + 1,
            day: date.getUTCDate(),
          }
        : getLocalDateParts(date, series.timezone);
      const targetTime = zonedDateTimeToUtc(localDate, hours || 9, minutes || 0, series.timezone);
      if (targetTime <= now) {
        skippedPastCount++;
        continue;
      }

      // Create linked Post record
      const created = await prisma.$transaction(async (transaction) => {
        const claimed = await transaction.seriesPost.updateMany({
          where: { id: seriesPost.id, status: 'READY', postId: null },
          data: { status: 'SCHEDULED' },
        });
        if (claimed.count !== 1) return false;

        const post = await transaction.post.create({
          data: {
            userId: user.userId,
            socialAccountId: socialAccount?.id || null,
            content: seriesPost.content!,
            contentType: 'TEXT',
            status: 'SCHEDULED',
            scheduledAt: targetTime,
            timezone: series.timezone,
          },
        });

        await transaction.seriesPost.update({
          where: { id: seriesPost.id },
          data: { postId: post.id },
        });
        return true;
      });

      if (created) scheduledCount++;
    }

    await createAuditLog({
      userId: user.userId,
      action: 'SERIES_POSTS_SCHEDULED',
      entityType: 'SERIES',
      entityId: id,
      details: { scheduledCount, skippedPastCount },
    });

    return NextResponse.json({
      success: true,
      scheduledCount,
      skippedPastCount,
    });
  } catch (error) {
    console.error('Schedule series posts error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to schedule series posts' } },
      { status: 500 }
    );
  }
}

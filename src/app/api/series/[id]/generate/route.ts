import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateLinkedInPost } from '@/lib/ai';
import { SEO_365_PLAN } from '@/data/seo365Plan';
import { isCanonicalSeo365Series } from '@/lib/seo365';

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
    const body = await request.json().catch(() => ({}));
    const { startDay = 1, endDay = 10, tone = 'Expert', goal = 'Educational' } = body;

    const series = await prisma.contentSeries.findFirst({
      where: { id, userId: user.userId },
    });

    if (!series) {
      return NextResponse.json({ success: false, error: { message: 'Series not found' } }, { status: 404 });
    }

    const existingSeriesPosts = await prisma.seriesPost.findMany({
      where: { seriesId: id },
      select: { dayNumber: true, topic: true, status: true, postId: true },
    });
    const canonicalSeoSeries =
      series.totalDays === SEO_365_PLAN.length && isCanonicalSeo365Series(existingSeriesPosts);
    const existingByDay = new Map(existingSeriesPosts.map((post) => [post.dayNumber, post]));
    const generatedDays = [];
    const maxDay = Math.min(endDay, series.totalDays || 365);

    for (let day = startDay; day <= maxDay; day++) {
      const existing = existingByDay.get(day);
      if (existing?.postId || existing?.status === 'SCHEDULED' || existing?.status === 'PUBLISHED') {
        continue;
      }

      const topic =
        existing?.topic ||
        (canonicalSeoSeries ? SEO_365_PLAN[day - 1]?.topic : undefined) ||
        `Day ${day}: Key insight on ${series.name}`;
      const aiResult = await generateLinkedInPost({
        topic,
        goal,
        tone,
        audience: 'LinkedIn Creators & Professionals',
        length: 'Medium',
      });

      const updatedOrCreated = await prisma.seriesPost.upsert({
        where: {
          seriesId_dayNumber: {
            seriesId: id,
            dayNumber: day,
          },
        },
        update: {
          content: aiResult.content,
          status: 'READY',
          scheduledTime: series.postingTime,
        },
        create: {
          seriesId: id,
          dayNumber: day,
          topic,
          content: aiResult.content,
          status: 'READY',
          scheduledTime: series.postingTime,
        },
      });

      generatedDays.push(updatedOrCreated);
    }

    return NextResponse.json({
      success: true,
      count: generatedDays.length,
      posts: generatedDays,
    });
  } catch (error) {
    console.error('Batch series generation error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to generate series posts' } },
      { status: 500 }
    );
  }
}

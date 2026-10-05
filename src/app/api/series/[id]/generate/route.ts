import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateLinkedInPost } from '@/lib/ai';

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

    const generatedDays = [];
    const maxDay = Math.min(endDay, series.totalDays || 365);

    for (let day = startDay; day <= maxDay; day++) {
      const topic = `Day ${day}: Strategic deep-dive into ${series.name}`;
      const aiResult = await generateLinkedInPost({
        topic: `${series.name} - Day ${day} Lesson`,
        goal,
        tone,
        audience: 'LinkedIn Creators & Professionals',
        length: 'Medium',
      });

      const scheduledDate = new Date(series.startDate);
      scheduledDate.setDate(series.startDate.getDate() + (day - 1));

      const updatedOrCreated = await prisma.seriesPost.upsert({
        where: {
          seriesId_dayNumber: {
            seriesId: id,
            dayNumber: day,
          },
        },
        update: {
          topic,
          content: aiResult.content,
          status: 'READY',
          scheduledDate,
          scheduledTime: series.postingTime,
        },
        create: {
          seriesId: id,
          dayNumber: day,
          topic,
          content: aiResult.content,
          status: 'READY',
          scheduledDate,
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

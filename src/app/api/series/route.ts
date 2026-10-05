import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 });
    }

    const seriesList = await prisma.contentSeries.findMany({
      where: { userId: user.userId },
      include: {
        _count: {
          select: { seriesPosts: true },
        },
        seriesPosts: {
          select: { status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const seriesWithStats = seriesList.map(s => {
      const posts = s.seriesPosts;
      const published = posts.filter(p => p.status === 'PUBLISHED').length;
      const scheduled = posts.filter(p => p.status === 'SCHEDULED').length;
      const ready = posts.filter(p => p.status === 'READY').length;
      const draft = posts.filter(p => p.status === 'DRAFT').length;
      const idea = posts.filter(p => p.status === 'IDEA').length;

      return {
        ...s,
        stats: {
          total: s.totalDays,
          generated: posts.length,
          published,
          scheduled,
          ready,
          draft,
          idea,
        },
      };
    });

    return NextResponse.json({ success: true, series: seriesWithStats });
  } catch (error) {
    console.error('Fetch series error:', error);
    return NextResponse.json({ success: false, error: { message: 'Failed to fetch series' } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      startDate,
      frequency = 'DAILY',
      postingTime = '09:00',
      timezone = 'UTC',
      totalDays = 30,
      initialTopic,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: { message: 'Series name is required' } }, { status: 400 });
    }

    const series = await prisma.contentSeries.create({
      data: {
        userId: user.userId,
        name: name.trim(),
        description: description || null,
        startDate: startDate ? new Date(startDate) : new Date(),
        frequency,
        postingTime,
        timezone,
        totalDays: parseInt(totalDays, 10) || 30,
      },
    });

    // Generate starter slots for days
    const defaultDaysCount = Math.min(parseInt(totalDays, 10) || 30, 365);
    const start = startDate ? new Date(startDate) : new Date();

    const topicBase = initialTopic || name;
    const seriesPostsData = [];

    for (let i = 1; i <= Math.min(defaultDaysCount, 15); i++) {
      const scheduledDay = new Date(start);
      scheduledDay.setDate(start.getDate() + (i - 1));

      seriesPostsData.push({
        seriesId: series.id,
        dayNumber: i,
        topic: `Day ${i}: Key insight on ${topicBase}`,
        content: `Day ${i} of ${defaultDaysCount} in our ${name} journey.\n\nToday's Focus: Fundamental strategies for ${topicBase}.\n\n1. Consistent daily action beats sporadic bursts.\n2. Document your wins.\n3. Iterate based on real metrics.\n\nWhat is your biggest goal this week? Let me know below 👇\n\n#${name.replace(/[^a-zA-Z0-9]/g, '')} #Growth #Leadership`,
        status: i === 1 ? 'READY' : 'IDEA',
        scheduledDate: scheduledDay,
        scheduledTime: postingTime,
      });
    }

    for (const p of seriesPostsData) {
      await prisma.seriesPost.create({ data: p });
    }

    await createAuditLog({
      userId: user.userId,
      action: 'SERIES_CREATED',
      entityType: 'SERIES',
      entityId: series.id,
      details: { name, totalDays: defaultDaysCount },
    });

    return NextResponse.json({ success: true, series });
  } catch (error) {
    console.error('Create series error:', error);
    return NextResponse.json({ success: false, error: { message: 'Failed to create series' } }, { status: 500 });
  }
}

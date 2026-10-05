import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString(), 10);
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString(), 10); // 1-indexed

    // Range for current month +/- 7 days for padding
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    startDate.setDate(startDate.getDate() - 7);

    const endDate = new Date(Date.UTC(year, month, 0));
    endDate.setDate(endDate.getDate() + 7);

    const posts = await prisma.post.findMany({
      where: {
        userId: user.userId,
        OR: [
          {
            scheduledAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            publishedAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        ],
      },
      include: {
        socialAccount: {
          select: { displayName: true, avatarUrl: true },
        },
        media: true,
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      posts,
      range: {
        year,
        month,
        startDate,
        endDate,
      },
    });
  } catch (error) {
    console.error('Fetch calendar posts error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to fetch calendar data' } },
      { status: 500 }
    );
  }
}

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
    const range = searchParams.get('range') || '30d'; // '7d', '30d', '90d'

    let days = 30;
    if (range === '7d') days = 7;
    if (range === '90d') days = 90;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch published posts with analytics
    const publishedPosts = await prisma.post.findMany({
      where: {
        userId: user.userId,
        status: 'PUBLISHED',
      },
      include: {
        analytics: true,
      },
      orderBy: {
        publishedAt: 'desc',
      },
    });

    const totalImpressions = publishedPosts.reduce((acc, p) => acc + (p.analytics?.impressions || 0), 0);
    const totalReactions = publishedPosts.reduce((acc, p) => acc + (p.analytics?.reactions || 0), 0);
    const totalComments = publishedPosts.reduce((acc, p) => acc + (p.analytics?.comments || 0), 0);
    const totalReposts = publishedPosts.reduce((acc, p) => acc + (p.analytics?.reposts || 0), 0);
    const totalClicks = publishedPosts.reduce((acc, p) => acc + (p.analytics?.clicks || 0), 0);
    const totalEngagements = totalReactions + totalComments + totalReposts + totalClicks;

    const avgEngagementRate = publishedPosts.length > 0
      ? (publishedPosts.reduce((acc, p) => acc + (p.analytics?.engagementRate || 0), 0) / publishedPosts.length).toFixed(1)
      : '0.0';

    // Daily breakdown for charts
    const chartData = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const displayLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Count posts published on this day
      const dayPosts = publishedPosts.filter(p => p.publishedAt && p.publishedAt.toISOString().split('T')[0] === dateStr);
      const dayImpressions = dayPosts.reduce((acc, p) => acc + (p.analytics?.impressions || 0), 0);
      const dayReactions = dayPosts.reduce((acc, p) => acc + (p.analytics?.reactions || 0), 0);

      chartData.push({
        date: displayLabel,
        posts: dayPosts.length,
        impressions: dayImpressions,
        engagements: dayReactions,
      });
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalPublished: publishedPosts.length,
        totalImpressions,
        totalEngagements,
        totalReactions,
        totalComments,
        totalReposts,
        totalClicks,
        avgEngagementRate: parseFloat(avgEngagementRate),
      },
      chartData,
      recentPosts: publishedPosts.slice(0, 5),
    });
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to fetch analytics' } },
      { status: 500 }
    );
  }
}

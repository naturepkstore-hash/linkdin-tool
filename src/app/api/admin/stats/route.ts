import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: { message: 'Forbidden. Admin role required.' } }, { status: 403 });
    }

    const [
      totalUsers,
      totalConnectedAccounts,
      totalScheduled,
      totalPublished,
      totalFailed,
      recentUsers,
      recentLogs,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.socialAccount.count({ where: { status: 'CONNECTED' } }),
      prisma.post.count({ where: { status: 'SCHEDULED' } }),
      prisma.post.count({ where: { status: 'PUBLISHED' } }),
      prisma.post.count({ where: { status: 'FAILED' } }),
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          timezone: true,
          createdAt: true,
          _count: {
            select: { posts: true, socialAccounts: true },
          },
        },
      }),
      prisma.auditLog.findMany({
        take: 15,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      }),
    ]);

    // System Health checks
    const systemHealth = {
      database: 'HEALTHY',
      redis: process.env.REDIS_URL ? 'ONLINE' : 'IN_MEMORY_FALLBACK',
      aiProvider: process.env.AI_API_KEY ? 'CONFIGURED' : 'BUILTIN_ENGINE',
      linkedInApi: process.env.LINKEDIN_CLIENT_ID ? 'OAUTH_READY' : 'SIMULATION_READY',
      uptimeSeconds: process.uptime(),
      memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    };

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalConnectedAccounts,
        totalScheduled,
        totalPublished,
        totalFailed,
      },
      systemHealth,
      recentUsers,
      recentLogs,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to fetch admin stats' } },
      { status: 500 }
    );
  }
}

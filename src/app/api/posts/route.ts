import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';
import { processPublishJob } from '@/lib/scheduler';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      userId: user.userId,
    };

    if (status && status !== 'ALL') {
      where.status = status.toUpperCase();
    }

    if (search) {
      where.content = {
        contains: search,
      };
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          socialAccount: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
            },
          },
          media: true,
          analytics: true,
        },
        orderBy: [
          { scheduledAt: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Fetch posts error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to fetch posts' } },
      { status: 500 }
    );
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
      content,
      contentType = 'TEXT',
      action = 'draft', // 'draft', 'schedule', 'publish_now'
      scheduledAt,
      timezone = 'UTC',
      mediaIds = [],
    } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: { message: 'Post content cannot be empty' } },
        { status: 400 }
      );
    }

    // Find user's active LinkedIn account
    const socialAccount = await prisma.socialAccount.findFirst({
      where: { userId: user.userId, provider: 'linkedin', status: 'CONNECTED' },
    });

    let status = 'DRAFT';
    let targetScheduledAt: Date | null = null;

    if (action === 'schedule') {
      if (!scheduledAt) {
        return NextResponse.json(
          { success: false, error: { message: 'Scheduled date and time are required' } },
          { status: 400 }
        );
      }
      status = 'SCHEDULED';
      targetScheduledAt = new Date(scheduledAt);
    } else if (action === 'publish_now') {
      status = 'SCHEDULED'; // Initial state before immediate publish execution
      targetScheduledAt = new Date();
    }

    // Create post in database
    const post = await prisma.post.create({
      data: {
        userId: user.userId,
        socialAccountId: socialAccount?.id || null,
        content: content.trim(),
        contentType,
        status: action === 'publish_now' ? 'PROCESSING' : status,
        scheduledAt: targetScheduledAt,
        timezone,
        media: mediaIds.length > 0 ? {
          connect: mediaIds.map((id: string) => ({ id })),
        } : undefined,
      },
      include: {
        socialAccount: true,
        media: true,
      },
    });

    // Check and update hashtag usage
    const matchedHashtags = content.match(/#[a-zA-Z0-9_]+/g) || [];
    for (const tag of matchedHashtags) {
      const cleanTag = tag.replace('#', '');
      await prisma.hashtag.upsert({
        where: { userId_name: { userId: user.userId, name: cleanTag } },
        update: { usageCount: { increment: 1 } },
        create: { userId: user.userId, name: cleanTag, usageCount: 1 },
      }).catch(() => {});
    }

    await createAuditLog({
      userId: user.userId,
      action: action === 'publish_now' ? 'POST_PUBLISH_NOW' : action === 'schedule' ? 'POST_SCHEDULED' : 'POST_DRAFTED',
      entityType: 'POST',
      entityId: post.id,
      details: { action, scheduledAt: targetScheduledAt },
    });

    // If immediate publish requested, trigger worker processor synchronously
    if (action === 'publish_now') {
      const publishResult = await processPublishJob(post.id);
      const updatedPost = await prisma.post.findUnique({
        where: { id: post.id },
        include: { socialAccount: true, media: true, analytics: true },
      });

      return NextResponse.json({
        success: publishResult.success,
        post: updatedPost,
        error: publishResult.error ? { message: publishResult.error } : null,
      });
    }

    return NextResponse.json({
      success: true,
      post,
    });
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to create post' } },
      { status: 500 }
    );
  }
}

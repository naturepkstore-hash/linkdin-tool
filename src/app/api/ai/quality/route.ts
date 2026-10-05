import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { analyzeContentQuality } from '@/lib/quality';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 });
    }

    const { content, currentPostId } = await request.json();
    if (!content) {
      return NextResponse.json({ success: false, error: { message: 'Content required' } }, { status: 400 });
    }

    const quality = analyzeContentQuality(content);

    // Duplicate content protection check: Check recent posts
    const recentPosts = await prisma.post.findMany({
      where: {
        userId: user.userId,
        ...(currentPostId ? { id: { not: currentPostId } } : {}),
      },
      select: { id: true, content: true, status: true, createdAt: true },
      take: 25,
      orderBy: { createdAt: 'desc' },
    });

    const normalizedNew = content.toLowerCase().replace(/[^a-z0-9]/g, '');
    let duplicateWarning = null;

    for (const p of recentPosts) {
      const normalizedOld = p.content.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (normalizedNew === normalizedOld) {
        duplicateWarning = {
          similarPostId: p.id,
          message: 'Exact duplicate content detected in a previous post.',
        };
        break;
      } else if (normalizedNew.length > 50 && (normalizedNew.includes(normalizedOld.slice(0, 100)) || normalizedOld.includes(normalizedNew.slice(0, 100)))) {
        duplicateWarning = {
          similarPostId: p.id,
          message: 'This content looks very similar to another recent post.',
        };
        break;
      }
    }

    return NextResponse.json({
      success: true,
      quality,
      duplicateWarning,
    });
  } catch (error) {
    console.error('Content quality analysis error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Quality analysis failed' } },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 });
    }

    const { id } = await params;
    const seriesPost = await prisma.seriesPost.findUnique({
      where: { id },
      include: { series: true },
    });

    if (!seriesPost || seriesPost.series.userId !== user.userId) {
      return NextResponse.json({ success: false, error: { message: 'Series post not found' } }, { status: 404 });
    }

    const body = await request.json();
    const { topic, content, status, scheduledDate, scheduledTime } = body;

    const updated = await prisma.seriesPost.update({
      where: { id },
      data: {
        ...(topic !== undefined ? { topic } : {}),
        ...(content !== undefined ? { content } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(scheduledDate !== undefined ? { scheduledDate: scheduledDate ? new Date(scheduledDate) : null } : {}),
        ...(scheduledTime !== undefined ? { scheduledTime } : {}),
      },
    });

    return NextResponse.json({ success: true, post: updated });
  } catch (error) {
    console.error('Update series post error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to update series post' } },
      { status: 500 }
    );
  }
}

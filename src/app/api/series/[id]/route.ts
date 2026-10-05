import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';

export async function GET(
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
          include: {
            post: true,
          },
        },
      },
    });

    if (!series) {
      return NextResponse.json({ success: false, error: { message: 'Series not found' } }, { status: 404 });
    }

    return NextResponse.json({ success: true, series });
  } catch (error) {
    console.error('Fetch series details error:', error);
    return NextResponse.json({ success: false, error: { message: 'Failed to fetch series' } }, { status: 500 });
  }
}

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
    const body = await request.json();
    const { name, description, status, postingTime, frequency, timezone } = body;

    const series = await prisma.contentSeries.findFirst({
      where: { id, userId: user.userId },
    });

    if (!series) {
      return NextResponse.json({ success: false, error: { message: 'Series not found' } }, { status: 404 });
    }

    const updated = await prisma.contentSeries.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(status ? { status } : {}),
        ...(postingTime ? { postingTime } : {}),
        ...(frequency ? { frequency } : {}),
        ...(timezone ? { timezone } : {}),
      },
    });

    await createAuditLog({
      userId: user.userId,
      action: 'SERIES_UPDATED',
      entityType: 'SERIES',
      entityId: id,
    });

    return NextResponse.json({ success: true, series: updated });
  } catch (error) {
    console.error('Update series error:', error);
    return NextResponse.json({ success: false, error: { message: 'Failed to update series' } }, { status: 500 });
  }
}

export async function DELETE(
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
    });

    if (!series) {
      return NextResponse.json({ success: false, error: { message: 'Series not found' } }, { status: 404 });
    }

    await prisma.contentSeries.delete({
      where: { id },
    });

    await createAuditLog({
      userId: user.userId,
      action: 'SERIES_DELETED',
      entityType: 'SERIES',
      entityId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete series error:', error);
    return NextResponse.json({ success: false, error: { message: 'Failed to delete series' } }, { status: 500 });
  }
}

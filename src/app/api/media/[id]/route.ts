import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';

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
    const media = await prisma.media.findFirst({
      where: { id, userId: user.userId },
    });

    if (!media) {
      return NextResponse.json({ success: false, error: { message: 'Media not found' } }, { status: 404 });
    }

    await prisma.media.delete({ where: { id } });

    await createAuditLog({
      userId: user.userId,
      action: 'MEDIA_DELETED',
      entityType: 'MEDIA',
      entityId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete media error:', error);
    return NextResponse.json({ success: false, error: { message: 'Failed to delete media' } }, { status: 500 });
  }
}

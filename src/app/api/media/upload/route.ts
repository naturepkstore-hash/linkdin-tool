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

    const mediaList = await prisma.media.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ success: true, media: mediaList });
  } catch (error) {
    console.error('Fetch media error:', error);
    return NextResponse.json({ success: false, error: { message: 'Failed to fetch media' } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const directUrl = formData.get('url') as string | null;

    if (!file && !directUrl) {
      return NextResponse.json({ success: false, error: { message: 'No file or image URL provided' } }, { status: 400 });
    }

    let fileUrl = '';
    let fileName = 'image.png';
    let mimeType = 'image/png';
    let fileSize = 0;

    if (file) {
      // Validate type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: { message: 'Invalid file type. Allowed: JPG, PNG, WEBP, GIF' } },
          { status: 400 }
        );
      }

      // Max size: 10MB
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: { message: 'File size exceeds 10MB limit' } },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Data = buffer.toString('base64');
      fileUrl = `data:${file.type};base64,${base64Data}`;
      fileName = file.name || 'image.png';
      mimeType = file.type;
      fileSize = file.size;
    } else if (directUrl) {
      fileUrl = directUrl;
      fileName = directUrl.split('/').pop() || 'image.png';
      mimeType = 'image/jpeg';
      fileSize = 102400;
    }

    const media = await prisma.media.create({
      data: {
        userId: user.userId,
        fileName,
        fileUrl,
        mimeType,
        fileSize,
      },
    });

    await createAuditLog({
      userId: user.userId,
      action: 'MEDIA_UPLOADED',
      entityType: 'MEDIA',
      entityId: media.id,
      details: { fileName, fileSize },
    });

    return NextResponse.json({ success: true, media });
  } catch (error) {
    console.error('Media upload error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to upload media' } },
      { status: 500 }
    );
  }
}

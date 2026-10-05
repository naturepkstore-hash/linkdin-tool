import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        timezone: true,
        avatarUrl: true,
        createdAt: true,
        socialAccounts: {
          select: {
            id: true,
            provider: true,
            displayName: true,
            headline: true,
            avatarUrl: true,
            status: true,
            createdAt: true,
          },
        },
        settings: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Session verify error:', error);
    return NextResponse.json({ success: false, user: null }, { status: 500 });
  }
}

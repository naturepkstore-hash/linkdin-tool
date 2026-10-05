import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 });
    }

    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        timezone: true,
        avatarUrl: true,
        settings: true,
      },
    });

    return NextResponse.json({ success: true, user: userData, settings: userData?.settings });
  } catch (error) {
    console.error('Fetch settings error:', error);
    return NextResponse.json({ success: false, error: { message: 'Failed to fetch settings' } }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      timezone,
      avatarUrl,
      password,
      defaultPostingTime,
      defaultTimezone,
      defaultTone,
      defaultAudience,
      defaultLength,
      notifyOnSuccess,
      notifyOnFailure,
      notifyOnReminder,
    } = body;

    // Update user profile
    const userUpdateData: Record<string, unknown> = {};
    if (name) userUpdateData.name = name.trim();
    if (timezone) userUpdateData.timezone = timezone;
    if (avatarUrl !== undefined) userUpdateData.avatarUrl = avatarUrl;
    if (password && password.length >= 6) {
      userUpdateData.passwordHash = await hashPassword(password);
    }

    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({
        where: { id: user.userId },
        data: userUpdateData,
      });
    }

    // Upsert user preferences
    const settings = await prisma.userSettings.upsert({
      where: { userId: user.userId },
      update: {
        ...(defaultPostingTime ? { defaultPostingTime } : {}),
        ...(defaultTimezone ? { defaultTimezone } : {}),
        ...(defaultTone ? { defaultTone } : {}),
        ...(defaultAudience ? { defaultAudience } : {}),
        ...(defaultLength ? { defaultLength } : {}),
        ...(notifyOnSuccess !== undefined ? { notifyOnSuccess } : {}),
        ...(notifyOnFailure !== undefined ? { notifyOnFailure } : {}),
        ...(notifyOnReminder !== undefined ? { notifyOnReminder } : {}),
      },
      create: {
        userId: user.userId,
        defaultPostingTime: defaultPostingTime || '09:00',
        defaultTimezone: defaultTimezone || 'UTC',
        defaultTone: defaultTone || 'Professional',
        defaultAudience: defaultAudience || 'General LinkedIn Audience',
        defaultLength: defaultLength || 'Medium',
        notifyOnSuccess: notifyOnSuccess ?? true,
        notifyOnFailure: notifyOnFailure ?? true,
        notifyOnReminder: notifyOnReminder ?? true,
      },
    });

    await createAuditLog({
      userId: user.userId,
      action: 'SETTINGS_UPDATED',
      entityType: 'USER_SETTINGS',
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ success: false, error: { message: 'Failed to update settings' } }, { status: 500 });
  }
}

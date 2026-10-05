import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, setSessionCookie } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const { name, email, password, timezone } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: { message: 'Name, email, and password are required' } },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: { message: 'Password must be at least 6 characters long' } },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: { message: 'An account with this email already exists' } },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        timezone: timezone || 'UTC',
        settings: {
          create: {
            defaultPostingTime: '09:00',
            defaultTimezone: timezone || 'UTC',
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        timezone: true,
      },
    });

    await setSessionCookie({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      timezone: user.timezone,
    });

    await createAuditLog({
      userId: user.id,
      action: 'USER_REGISTERED',
      entityType: 'USER',
      entityId: user.id,
    });

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: unknown) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to create account. Please try again.' } },
      { status: 500 }
    );
  }
}

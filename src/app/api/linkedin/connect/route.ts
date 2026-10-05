import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getLinkedInAuthUrl } from '@/lib/linkedin';
import crypto from 'crypto';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Generate state payload with userId and random nonce for CSRF validation
    const nonce = crypto.randomBytes(16).toString('hex');
    const statePayload = Buffer.from(JSON.stringify({ userId: user.userId, nonce })).toString('base64');

    const authUrl = getLinkedInAuthUrl(statePayload);
    return NextResponse.json({ success: true, url: authUrl });
  } catch (error) {
    console.error('LinkedIn connect initiation failed:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to initiate LinkedIn OAuth connection' } },
      { status: 500 }
    );
  }
}

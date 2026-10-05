import { NextResponse } from 'next/server';
import { runDueScheduledPosts } from '@/lib/scheduler';

export const runtime = 'nodejs';
export const maxDuration = 300;

function isAuthorized(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  return Boolean(
    cronSecret &&
      cronSecret.length >= 16 &&
      !cronSecret.startsWith('generate-') &&
      request.headers.get('authorization') === `Bearer ${cronSecret}`,
  );
}

async function runWorker(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const processedCount = await runDueScheduledPosts();
    return NextResponse.json({
      success: true,
      processedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Worker tick error:', error);
    return NextResponse.json({ success: false, error: 'Worker tick execution failed' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return runWorker(request);
}

export async function POST(request: Request) {
  return runWorker(request);
}

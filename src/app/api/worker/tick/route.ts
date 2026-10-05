import { NextResponse } from 'next/server';
import { runDueScheduledPosts } from '@/lib/scheduler';
import { isValidGitHubActionsToken } from '@/lib/github-actions-auth';

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

async function isAuthorizedForWorker(request: Request): Promise<boolean> {
  if (isAuthorized(request)) {
    return true;
  }

  const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
  return token ? isValidGitHubActionsToken(token) : false;
}

async function runWorker(request: Request) {
  try {
    if (!(await isAuthorizedForWorker(request))) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

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

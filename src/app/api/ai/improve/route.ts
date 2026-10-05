import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { improveLinkedInPost } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 });
    }

    const body = await request.json();
    const { content, action } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: { message: 'Content is required' } },
        { status: 400 }
      );
    }

    const improved = await improveLinkedInPost({
      content: content.trim(),
      action: action || 'improve',
    });

    return NextResponse.json({
      success: true,
      content: improved,
    });
  } catch (error) {
    console.error('AI improve error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'AI improvement failed' } },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { generateLinkedInPost } from '@/lib/ai';
import { createAuditLog } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 });
    }

    const body = await request.json();
    const { topic, goal, tone, audience, length, cta } = body;

    if (!topic || !topic.trim()) {
      return NextResponse.json(
        { success: false, error: { message: 'Topic is required for AI generation' } },
        { status: 400 }
      );
    }

    const result = await generateLinkedInPost({
      topic: topic.trim(),
      goal,
      tone,
      audience,
      length,
      cta,
    });

    await createAuditLog({
      userId: user.userId,
      action: 'AI_POST_GENERATED',
      entityType: 'AI',
      details: { topic, goal, tone },
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('AI generate error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'AI generation failed' } },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { items, rawText, usePreset } = body;

    const series = await prisma.contentSeries.findFirst({
      where: { id, userId: user.userId },
    });

    if (!series) {
      return NextResponse.json({ success: false, error: { message: 'Series not found' } }, { status: 404 });
    }

    const parsedItems: Array<{ dayNumber: number; topic: string; content?: string }> = [];

    if (usePreset === 'seo-365') {
      const { SEO_365_PLAN } = await import('@/data/seo365Plan');
      SEO_365_PLAN.forEach((item) => {
        parsedItems.push({
          dayNumber: item.dayNumber,
          topic: item.topic,
          content: `Day ${item.dayNumber} of 365: ${item.topic}\n\n📌 Focus Area: ${item.monthTitle}\n\nHere is the core breakdown and practical takeaway for today:\n\n1. Search Intent & Focus: Aligning closely with user query satisfaction.\n2. Implementation: Practical step-by-step workflow.\n3. Measurable Outcome: How to evaluate the result.\n\nWhat is your experience with this topic? Drop your insights below 👇\n\n#SEO365 #SEO #DigitalMarketing #Growth #LinkedInSEO`,
        });
      });
    } else if (Array.isArray(items) && items.length > 0) {
      items.forEach((it, idx) => {
        parsedItems.push({
          dayNumber: it.dayNumber || idx + 1,
          topic: it.topic || `Day ${idx + 1} Topic`,
          content: it.content || '',
        });
      });
    } else if (typeof rawText === 'string' && rawText.trim().length > 0) {
      // Parse multi-line plain text, CSV, or list format
      const lines = rawText.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);
      
      lines.forEach((line: string, idx: number) => {
        const dayNumber = idx + 1;
        // Check if line contains CSV comma separator
        if (line.includes(',') && !line.startsWith('Day')) {
          const parts = line.split(',');
          const topic = parts[0]?.trim() || `Day ${dayNumber}`;
          const content = parts.slice(1).join(',').trim();
          parsedItems.push({ dayNumber, topic, content });
        } else {
          // Plain topic per line
          const cleanTopic = line.replace(/^Day\s*\d+[\s:\-.]*/i, '').trim() || line;
          parsedItems.push({
            dayNumber,
            topic: cleanTopic,
            content: `Day ${dayNumber}: ${cleanTopic}\n\nKey Strategy & Framework:\n1. Focus on searcher intent and consistency.\n2. Document execution and metrics.\n\nWhat is your take on this? Let me know below 👇\n\n#${series.name.replace(/[^a-zA-Z0-9]/g, '')} #Growth #Learning`,
          });
        }
      });
    }

    if (parsedItems.length === 0) {
      return NextResponse.json(
        { success: false, error: { message: 'No valid days or topics found in the provided content.' } },
        { status: 400 }
      );
    }

    // Update totalDays in series if needed
    if (parsedItems.length > series.totalDays) {
      await prisma.contentSeries.update({
        where: { id },
        data: { totalDays: parsedItems.length },
      });
    }

    // Upsert series posts
    const start = new Date(series.startDate);
    const createdOrUpdated = [];

    for (const item of parsedItems) {
      const scheduledDate = new Date(start);
      scheduledDate.setDate(start.getDate() + (item.dayNumber - 1));

      const res = await prisma.seriesPost.upsert({
        where: {
          seriesId_dayNumber: {
            seriesId: id,
            dayNumber: item.dayNumber,
          },
        },
        update: {
          topic: item.topic,
          content: item.content || undefined,
          status: 'READY',
          scheduledDate,
          scheduledTime: series.postingTime,
        },
        create: {
          seriesId: id,
          dayNumber: item.dayNumber,
          topic: item.topic,
          content: item.content || `Day ${item.dayNumber}: ${item.topic}\n\nConsistency is key. What are your thoughts? 👇`,
          status: 'READY',
          scheduledDate,
          scheduledTime: series.postingTime,
        },
      });

      createdOrUpdated.push(res);
    }

    await createAuditLog({
      userId: user.userId,
      action: 'SERIES_BULK_IMPORTED',
      entityType: 'SERIES',
      entityId: id,
      details: { importedCount: createdOrUpdated.length },
    });

    return NextResponse.json({
      success: true,
      importedCount: createdOrUpdated.length,
      posts: createdOrUpdated,
    });
  } catch (error) {
    console.error('Import series error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to import 365 days plan' } },
      { status: 500 }
    );
  }
}

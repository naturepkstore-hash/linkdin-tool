import { SEO_365_PLAN } from '@/data/seo365Plan';
import { BRAND_THEME } from '@/config/brandingTheme';
import { generateBrandedDailyImage } from '@/lib/brand-image';
import { generateLinkedInPost } from '@/lib/ai';
import { prisma } from '@/lib/prisma';
import { getLocalDateParts, getLocalDayBounds, zonedDateTimeToUtc } from '@/lib/timezone';
import { isCanonicalSeo365Series } from '@/lib/seo365';

const POSTING_TIMEZONE = 'Asia/Karachi';
const POSTING_TIME = BRAND_THEME.preferredDailyPostingTime;

function parsePostingTime(value: string): { hour: number; minute: number } {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  if (!match) throw new Error(`Invalid configured daily posting time: ${value}`);
  return { hour: Number(match[1]), minute: Number(match[2]) };
}

function getTakeaways(content: string, topic: string): string[] {
  const lines = content.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const takeaways: string[] = [];

  for (let index = 0; index < lines.length && takeaways.length < 3; index++) {
    const match = /^(?:\d+[.)]|[•*-])\s*(.+)$/.exec(lines[index]);
    if (!match) continue;

    const detail = lines[index + 1] && !/^(?:\d+[.)]|[•*-]|#)/.test(lines[index + 1])
      ? ` ${lines[index + 1]}`
      : '';
    takeaways.push(`${match[1]}${detail}`.slice(0, 110));
  }

  if (takeaways.length === 0) {
    return [
      `Learn the core principles behind ${topic}.`,
      'Turn the idea into a repeatable process.',
      'Measure results and improve with each cycle.',
    ];
  }

  return takeaways;
}

function getLength(value: string | undefined): 'Short' | 'Medium' | 'Long' {
  if (value === 'Short' || value === 'Long') return value;
  return 'Medium';
}

function isPostingWindowOpen(now: Date, hour: number, minute: number): boolean {
  const localNow = getLocalDateParts(now, POSTING_TIMEZONE);
  return localNow.hour * 60 + localNow.minute >= hour * 60 + minute;
}

export async function scheduleDueDailySeriesPosts(now = new Date()): Promise<number> {
  const { hour, minute } = parsePostingTime(POSTING_TIME);
  if (!isPostingWindowOpen(now, hour, minute)) return 0;

  const localDate = getLocalDateParts(now, POSTING_TIMEZONE);
  const dayBounds = getLocalDayBounds(now, POSTING_TIMEZONE);
  const scheduledAt = zonedDateTimeToUtc(localDate, hour, minute, POSTING_TIMEZONE);
  const seriesCandidates = await prisma.contentSeries.findMany({
    where: {
      status: 'ACTIVE',
      frequency: 'DAILY',
      totalDays: SEO_365_PLAN.length,
      seriesPosts: {
        some: { dayNumber: 1, topic: SEO_365_PLAN[0].topic },
      },
    },
    orderBy: { createdAt: 'asc' },
    include: {
      seriesPosts: {
        select: { dayNumber: true, topic: true, status: true, postId: true },
        orderBy: { dayNumber: 'asc' },
      },
      user: {
        select: {
          id: true,
          settings: {
            select: { defaultTone: true, defaultAudience: true, defaultLength: true },
          },
        },
      },
    },
  });

  let createdCount = 0;
  const seenUsers = new Set<string>();

  for (const series of seriesCandidates) {
    if (seenUsers.has(series.userId) || !isCanonicalSeo365Series(series.seriesPosts)) continue;
    seenUsers.add(series.userId);

    const socialAccount = await prisma.socialAccount.findFirst({
      where: { userId: series.userId, provider: 'linkedin', status: 'CONNECTED' },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });
    if (!socialAccount) continue;

    const alreadyScheduledToday = await prisma.post.findFirst({
      where: {
        userId: series.userId,
        status: { in: ['SCHEDULED', 'PROCESSING', 'PUBLISHED'] },
        scheduledAt: { gte: dayBounds.start, lt: dayBounds.end },
      },
      select: { id: true },
    });
    if (alreadyScheduledToday) continue;

    const nextDay = series.seriesPosts
      .filter((seriesPost) => seriesPost.status === 'READY' && !seriesPost.postId)
      .sort((a, b) => a.dayNumber - b.dayNumber)[0];
    if (!nextDay) continue;

    const settings = series.user.settings;
    const generated = await generateLinkedInPost({
      topic: nextDay.topic,
      goal: 'Educational',
      tone: settings?.defaultTone || 'Expert',
      audience: settings?.defaultAudience || 'LinkedIn creators and professionals',
      length: getLength(settings?.defaultLength),
    });
    const imageBytes = await generateBrandedDailyImage({
      dayNumber: nextDay.dayNumber,
      topic: nextDay.topic,
      takeaways: getTakeaways(generated.content, nextDay.topic),
    });

    await prisma.$transaction(async (transaction) => {
      const claimed = await transaction.seriesPost.updateMany({
        where: {
          seriesId: series.id,
          dayNumber: nextDay.dayNumber,
          status: 'READY',
          postId: null,
        },
        data: {
          status: 'SCHEDULED',
          scheduledDate: scheduledAt,
          scheduledTime: POSTING_TIME,
        },
      });

      if (claimed.count !== 1) return;

      const post = await transaction.post.create({
        data: {
          userId: series.userId,
          socialAccountId: socialAccount.id,
          content: generated.content,
          contentType: 'IMAGE',
          status: 'SCHEDULED',
          scheduledAt,
          timezone: POSTING_TIMEZONE,
        },
      });

      await transaction.media.create({
        data: {
          userId: series.userId,
          postId: post.id,
          fileName: `seo-day-${nextDay.dayNumber}.png`,
          fileUrl: `data:image/png;base64,${imageBytes.toString('base64')}`,
          mimeType: 'image/png',
          fileSize: imageBytes.length,
          width: 1080,
          height: 1080,
        },
      });

      const linked = await transaction.seriesPost.updateMany({
        where: {
          seriesId: series.id,
          dayNumber: nextDay.dayNumber,
          status: 'SCHEDULED',
          postId: null,
        },
        data: { postId: post.id },
      });
      if (linked.count !== 1) {
        throw new Error(`Failed to link generated post to SEO series day ${nextDay.dayNumber}.`);
      }

      createdCount++;
    });
  }

  return createdCount;
}

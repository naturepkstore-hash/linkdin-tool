import { PrismaClient } from '@prisma/client';
import { processPublishJob } from '../src/lib/scheduler';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Publishing/Scheduling Day 12 Post via Tool...');

  // 1. Find user and social account
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error('No user found in database.');
    return;
  }

  const socialAccount = await prisma.socialAccount.findFirst({
    where: { userId: user.id },
  });

  const day12Content = `6 months ago, I made an SEO mistake that cost me 3 weeks of wasted effort.

I thought SEO was all about stuffing keywords into every single heading, paragraph, and alt tag. 

I tracked rankings daily, expecting instant results...

Instead, Google completely ignored the page. 📉

That painful beginner mistake taught me 3 lessons I will never forget:

1. Google ranks solutions, not keywords
Search engines don't reward you for mentioning a phrase 20 times. They reward the page that best satisfies what the searcher actually needs.

2. Search Intent > Search Volume
Target a keyword with 200 high-intent monthly searches, and you'll get actual leads. Target 10,000 broad searches without intent, and you get bounce rates.

3. SEO is compounding, not instant
Treating SEO like paid ads will only lead to frustration. The real growth comes when technical health, content quality, and consistency align over months.

If you are just starting your SEO or digital marketing journey:
Don't chase algorithms. Build for the human behind the screen.

---

💬 What was the very first mistake you made when starting your digital/SEO journey? Drop it below—let's share and learn together! 👇

#SEO #DigitalMarketing #SEOJourney #ContentStrategy #OrganicGrowth #LinkedInGrowth #LearningInPublic #SEO365`;

  // 2. Update series post for Day 12
  const series = await prisma.contentSeries.findFirst({
    where: { userId: user.id },
  });

  if (series) {
    await prisma.seriesPost.updateMany({
      where: {
        seriesId: series.id,
        dayNumber: 12,
      },
      data: {
        content: day12Content,
        status: 'PUBLISHED',
      },
    });
    console.log('Series Day 12 updated.');
  }

  // 3. Create post in main Post queue
  const post = await prisma.post.create({
    data: {
      userId: user.id,
      socialAccountId: socialAccount?.id || null,
      content: day12Content,
      contentType: 'TEXT',
      status: 'SCHEDULED',
      scheduledAt: new Date(), // Immediate
      timezone: user.timezone || 'America/New_York',
    },
  });

  console.log(`Created Post ID: ${post.id}`);

  // 4. Trigger publish job
  const result = await processPublishJob(post.id);
  console.log('Publish result:', result);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });

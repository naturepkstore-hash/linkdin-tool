import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateLivePostInDb() {
  const account = await prisma.socialAccount.findFirst({
    where: { displayName: { contains: 'Ameer' } },
  });

  if (!account) return;

  const livePostUrl = 'https://www.linkedin.com/feed/update/urn:li:share:7512157996509077504';
  const livePostId = 'urn:li:share:7512157996509077504';

  const post = await prisma.post.create({
    data: {
      userId: account.userId,
      socialAccountId: account.id,
      content: `Day 12: My First SEO Mistake & What It Taught Me (with Infographic)`,
      contentType: 'IMAGE',
      status: 'PUBLISHED',
      publishedAt: new Date(),
      providerPostId: livePostId,
      providerPostUrl: livePostUrl,
    },
  });

  console.log('Saved to DB:', post.id);
}

updateLivePostInDb()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });

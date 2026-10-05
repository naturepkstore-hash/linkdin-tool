import { PrismaClient } from '@prisma/client';
import { decrypt } from '../src/lib/encryption';
import { publishToLinkedIn } from '../src/lib/linkedin';

const prisma = new PrismaClient();

async function publishForAmeer() {
  console.log('Finding user Ameer Haider Bhatti...');
  const haiderUser = await prisma.user.findFirst({
    where: {
      OR: [
        { name: { contains: 'Ameer' } },
        { name: { contains: 'Haider' } },
        { email: { contains: 'haider' } },
      ],
    },
    include: { socialAccounts: true },
  });

  if (!haiderUser) {
    console.log('Haider user not found by name filter, listing all users:');
    const allUsers = await prisma.user.findMany({ include: { socialAccounts: true } });
    console.log(allUsers.map((u) => ({ id: u.id, name: u.name, email: u.email, accounts: u.socialAccounts.length })));
    return;
  }

  console.log('Found User:', haiderUser.name, haiderUser.email, 'Accounts:', haiderUser.socialAccounts.length);
  const account = haiderUser.socialAccounts[0];
  if (!account) {
    console.error('No connected LinkedIn account for user');
    return;
  }

  console.log('Using LinkedIn Account:', account.displayName, 'URN:', account.providerAccountId);

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

  // Publish to real LinkedIn API
  console.log('Publishing to LinkedIn API now...');
  const result = await publishToLinkedIn({
    encryptedToken: account.accessTokenEncrypted,
    authorUrn: account.providerAccountId,
    text: day12Content,
    mediaAssetUrns: [],
  });

  console.log('LinkedIn Live API Response:', JSON.stringify(result, null, 2));

  // Save to DB under Ameer's user account
  const newPost = await prisma.post.create({
    data: {
      userId: haiderUser.id,
      socialAccountId: account.id,
      content: day12Content,
      contentType: 'TEXT',
      status: result.success ? 'PUBLISHED' : 'FAILED',
      publishedAt: result.success ? new Date() : null,
      providerPostId: result.postId || null,
      providerPostUrl: result.postUrl || null,
      failureReason: result.error?.message || null,
    },
  });

  console.log('Database post created:', newPost.id, 'Status:', newPost.status);
}

publishForAmeer()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });

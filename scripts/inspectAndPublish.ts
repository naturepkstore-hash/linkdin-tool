import { PrismaClient } from '@prisma/client';
import { decrypt } from '../src/lib/encryption';
import { publishToLinkedIn } from '../src/lib/linkedin';

const prisma = new PrismaClient();

async function inspectAndPublish() {
  const account = await prisma.socialAccount.findFirst({
    where: { displayName: { contains: 'Ameer' } },
  });

  if (!account) {
    console.log('No Ameer account found');
    return;
  }

  console.log('Ameer account found:');
  console.log('ID:', account.id);
  console.log('ProviderAccountId:', account.providerAccountId);
  console.log('Raw AccessToken field length:', account.accessTokenEncrypted.length);
  console.log('Raw AccessToken starts with:', account.accessTokenEncrypted.substring(0, 30));

  let token = decrypt(account.accessTokenEncrypted);
  if (!token) {
    // If it was stored directly unencrypted or plain
    token = account.accessTokenEncrypted;
  }

  console.log('Resolved Token prefix:', token.substring(0, 15), '...');

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

  const res = await publishToLinkedIn({
    encryptedToken: account.accessTokenEncrypted,
    authorUrn: account.providerAccountId,
    text: day12Content,
  });

  console.log('Direct publish response:', JSON.stringify(res, null, 2));
}

inspectAndPublish()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });

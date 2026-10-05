import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { decrypt } from '../src/lib/encryption';
import { uploadLinkedInImage, publishToLinkedIn } from '../src/lib/linkedin';

const prisma = new PrismaClient();

async function publishWithImage() {
  const account = await prisma.socialAccount.findFirst({
    where: { displayName: { contains: 'Ameer' } },
  });

  if (!account) {
    console.log('No Ameer account found');
    return;
  }

  const token = decrypt(account.accessTokenEncrypted) || account.accessTokenEncrypted;
  const imagePath = path.join(process.cwd(), 'public', 'uploads', 'day12_seo_mistake.jpg');
  
  if (!fs.existsSync(imagePath)) {
    console.error('Image not found at:', imagePath);
    return;
  }

  const imageBuffer = fs.readFileSync(imagePath);
  console.log('Image buffer size:', imageBuffer.length, 'bytes');

  console.log('Uploading image to LinkedIn Media Asset Storage...');
  const assetUrn = await uploadLinkedInImage(
    token,
    account.providerAccountId,
    imageBuffer,
    'image/jpeg'
  );

  console.log('Uploaded LinkedIn Asset URN:', assetUrn);

  const postText = `6 months ago, I made an SEO mistake that cost me 3 weeks of wasted effort.

I thought SEO was all about stuffing keywords into every single heading, paragraph, and alt tag.

I tracked rankings daily, expecting instant results...

Instead, Google completely ignored the page. 📉

That beginner mistake taught me 3 lessons I will never forget (see visual breakdown below):

1. Google ranks solutions, not keywords
Search engines reward the page that best satisfies what the searcher actually needs.

2. Search Intent > Search Volume
Target a keyword with 200 high-intent monthly searches, and you will get actual leads.

3. SEO is compounding, not instant
The real growth comes when technical health, content quality, and consistency align over months.

Don't chase algorithms. Build for the human behind the screen.

---

💬 What was the very first mistake you made when starting your digital/SEO journey? Drop it below! 👇

#SEO #DigitalMarketing #SEOJourney #ContentStrategy #OrganicGrowth #LinkedInGrowth #LearningInPublic #SEO365`;

  console.log('Publishing image post to LinkedIn...');
  const res = await publishToLinkedIn({
    encryptedToken: account.accessTokenEncrypted,
    authorUrn: account.providerAccountId,
    text: postText,
    mediaAssetUrns: [assetUrn],
  });

  console.log('Result:', JSON.stringify(res, null, 2));
}

publishWithImage()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });

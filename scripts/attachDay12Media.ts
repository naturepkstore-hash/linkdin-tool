import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function attachMedia() {
  const user = await prisma.user.findFirst();
  if (!user) return;

  // Find latest post created for Day 12
  const latestPost = await prisma.post.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  if (latestPost) {
    // Create Media record linked to post
    const media = await prisma.media.create({
      data: {
        userId: user.id,
        postId: latestPost.id,
        fileName: 'day12_seo_mistake.jpg',
        fileUrl: '/uploads/day12_seo_mistake.jpg',
        mimeType: 'image/jpeg',
        fileSize: 450000,
        width: 1080,
        height: 1080,
      },
    });

    await prisma.post.update({
      where: { id: latestPost.id },
      data: { contentType: 'IMAGE' },
    });

    console.log('✅ Media attached successfully to Post ID:', latestPost.id, 'Media ID:', media.id);
  }
}

attachMedia()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial PostFlow AI database...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create or update Demo Admin User
  const user = await prisma.user.upsert({
    where: { email: 'alex.rivera@postflow.ai' },
    update: {},
    create: {
      name: 'Alex Rivera',
      email: 'alex.rivera@postflow.ai',
      passwordHash,
      role: 'ADMIN',
      timezone: 'America/New_York',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });

  console.log(`User created: ${user.email} (password: password123)`);

  // 2. Create User Settings
  await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      defaultPostingTime: '09:30',
      defaultTimezone: 'America/New_York',
      defaultTone: 'Expert',
      defaultAudience: 'Marketing Professionals',
      defaultLength: 'Medium',
      notifyOnSuccess: true,
      notifyOnFailure: true,
      notifyOnReminder: true,
      aiProvider: 'builtin',
    },
  });

  // 3. Create Connected LinkedIn Account (Simulated token with official format)
  const socialAccount = await prisma.socialAccount.upsert({
    where: {
      userId_provider_providerAccountId: {
        userId: user.id,
        provider: 'linkedin',
        providerAccountId: 'urn:li:person:alex_rivera_demo',
      },
    },
    update: {},
    create: {
      userId: user.id,
      provider: 'linkedin',
      providerAccountId: 'urn:li:person:alex_rivera_demo',
      displayName: 'Alex Rivera',
      headline: 'Head of SEO & Growth Strategy | LinkedIn Creator',
      profileUrl: 'https://linkedin.com/in/alex-rivera-demo',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      accessTokenEncrypted: 'mock_iv:mock_tag:simulated_li_access_token_demo',
      scopes: 'openid profile email w_member_social',
      status: 'CONNECTED',
      tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
    },
  });

  // 4. Create sample posts if none exist
  const existingPost = await prisma.post.findFirst({ where: { userId: user.id } });
  if (!existingPost) {
    const post1 = await prisma.post.create({
      data: {
        userId: user.id,
        socialAccountId: socialAccount.id,
        content: `90% of SEO beginners make this 1 fatal mistake:

They chase high-volume keywords with zero commercial intent.

Here is the exact framework we used to 4x organic conversions in 90 days:

1. Target long-tail problem keywords first
2. Optimize for search intent over raw volume
3. Build topical authority in a single cluster before expanding
4. Update existing content every 6 months

Consistency in execution always beats sporadic bursts.

What SEO metric do you prioritize most right now? Drop it below 👇

#SEO #OrganicGrowth #ContentStrategy #DigitalMarketing`,
        contentType: 'TEXT',
        status: 'PUBLISHED',
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        providerPostId: 'urn:li:ugcPost:71239849201948',
        providerPostUrl: 'https://www.linkedin.com/feed/update/urn:li:ugcPost:71239849201948',
      },
    });

    // Add Analytics for post 1
    await prisma.analytics.create({
      data: {
        postId: post1.id,
        impressions: 4820,
        reactions: 194,
        comments: 38,
        reposts: 12,
        clicks: 86,
        engagementRate: 6.8,
      },
    });

    await prisma.post.create({
      data: {
        userId: user.id,
        socialAccountId: socialAccount.id,
        content: `The easiest way to stand out on LinkedIn in 2026:

Stop writing like a corporate press release.

People connect with real practitioners who share:
• The lessons learned from failed launches
• Raw behind-the-scenes metrics
• Actionable frameworks you can test today

Save this post for when you write your next update 📌

#PersonalBrand #LinkedInGrowth #Leadership #Marketing`,
        contentType: 'TEXT',
        status: 'SCHEDULED',
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        timezone: 'America/New_York',
      },
    });
  }

  // 5. Create or retrieve 365-Day SEO Series
  let series = await prisma.contentSeries.findFirst({
    where: { userId: user.id, name: '365-Day SEO Mastery Series' },
  });

  if (!series) {
    series = await prisma.contentSeries.create({
      data: {
        userId: user.id,
        name: '365-Day SEO Mastery Series',
        description: 'Daily actionable SEO frameworks, tips, and case studies for marketers and founders.',
        startDate: new Date(),
        frequency: 'DAILY',
        postingTime: '09:00',
        timezone: 'America/New_York',
        status: 'ACTIVE',
        totalDays: 365,
      },
    });
  }

  // Seed all 365 days with rich actionable post outlines
  const { SEO_365_PLAN } = await import('../src/data/seo365Plan');

  for (const item of SEO_365_PLAN) {
    const day = item.dayNumber;
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + day);

    await prisma.seriesPost.upsert({
      where: {
        seriesId_dayNumber: {
          seriesId: series.id,
          dayNumber: day,
        },
      },
      update: {
        topic: item.topic,
        content: `Day ${day} of 365: ${item.topic}\n\n📌 ${item.monthTitle}\n\nHere is the core breakdown and practical takeaway for today:\n\n1. Search Intent & Focus: Aligning closely with user query satisfaction.\n2. Implementation: Practical step-by-step workflow.\n3. Measurable Outcome: How to evaluate the result.\n\nWhat is your experience with this topic? Drop your insights below 👇\n\n#SEO365 #SEO #DigitalMarketing #Growth #LinkedInSEO`,
      },
      create: {
        seriesId: series.id,
        dayNumber: day,
        topic: item.topic,
        content: `Day ${day} of 365: ${item.topic}\n\n📌 ${item.monthTitle}\n\nHere is the core breakdown and practical takeaway for today:\n\n1. Search Intent & Focus: Aligning closely with user query satisfaction.\n2. Implementation: Practical step-by-step workflow.\n3. Measurable Outcome: How to evaluate the result.\n\nWhat is your experience with this topic? Drop your insights below 👇\n\n#SEO365 #SEO #DigitalMarketing #Growth #LinkedInSEO`,
        status: day === 1 ? 'PUBLISHED' : day <= 5 ? 'SCHEDULED' : 'READY',
        scheduledDate,
        scheduledTime: '09:00',
      },
    });
  }

  // 6. Create Hashtags
  const tags = ['SEO', 'LinkedInGrowth', 'PersonalBrand', 'DigitalMarketing', 'SaaS', 'Leadership'];
  for (const t of tags) {
    await prisma.hashtag.upsert({
      where: {
        userId_name: {
          userId: user.id,
          name: t,
        },
      },
      update: {},
      create: {
        userId: user.id,
        name: t,
        usageCount: Math.floor(Math.random() * 20) + 5,
      },
    });
  }

  // 7. Seed Notifications
  await prisma.notification.create({
    data: {
      userId: user.id,
      title: '365-Day SEO Plan Ready',
      message: 'All 365 days of your curated SEO Growth Series are active and ready in your series workspace.',
      type: 'SUCCESS',
      isRead: false,
    },
  });

  console.log('Database seeding complete successfully with all 365 days!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

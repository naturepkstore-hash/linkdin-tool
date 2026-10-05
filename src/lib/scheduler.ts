import { prisma } from './prisma';
import { publishToLinkedIn } from './linkedin';
import { createAuditLog } from './audit';
import { createNotification } from './notifications';

/**
 * Worker processor to execute a single scheduled post job idempotently
 */
export async function processPublishJob(postId: string): Promise<{
  success: boolean;
  publishedPostId?: string;
  error?: string;
}> {
  try {
    // 1. Fetch Post with associated User, Social Account, and Media
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: true,
        socialAccount: true,
        media: true,
      },
    });

    if (!post) {
      return { success: false, error: 'Post not found in database' };
    }

    // 2. Idempotency check: If already published with a provider ID, avoid duplicate posts
    if (post.status === 'PUBLISHED' && post.providerPostId) {
      console.log(`[Scheduler] Post ${postId} is already published (providerPostId: ${post.providerPostId}). Skipping.`);
      return { success: true, publishedPostId: post.providerPostId };
    }

    // 3. Status validation: only unclaimed posts can be processed.
    if (post.status !== 'SCHEDULED' && post.status !== 'READY') {
      return { success: false, error: `Invalid post state for publishing: ${post.status}` };
    }

    // 4. Claim atomically so concurrent cron invocations cannot publish the same post twice.
    const claimed = await prisma.post.updateMany({
      where: {
        id: postId,
        status: post.status,
      },
      data: {
        status: 'PROCESSING',
      },
    });

    if (claimed.count !== 1) {
      return { success: false, error: 'Post is already being processed or is no longer publishable.' };
    }

    // 5. Verify LinkedIn account connection
    if (!post.socialAccount || !post.socialAccount.accessTokenEncrypted) {
      await prisma.post.update({
        where: { id: postId },
        data: {
          status: 'FAILED',
          failureReason: 'No connected LinkedIn account or access token found.',
          lastError: 'NO_LINKEDIN_ACCOUNT',
        },
      });

      await createNotification({
        userId: post.userId,
        title: 'Publishing Failed',
        message: 'Your scheduled LinkedIn post failed because no connected account was found.',
        type: 'ERROR',
        link: '/dashboard/linkedin',
      });

      return { success: false, error: 'NO_LINKEDIN_ACCOUNT' };
    }

    // 6. Automatically upload attached media to LinkedIn assets if present
    const mediaAssetUrns: string[] = [];
    if (post.media && post.media.length > 0) {
      const fs = await import('fs');
      const path = await import('path');
      const { uploadLinkedInImage } = await import('./linkedin');
      const { decrypt } = await import('./encryption');
      const rawToken = decrypt(post.socialAccount.accessTokenEncrypted) || post.socialAccount.accessTokenEncrypted;

      for (const m of post.media) {
        try {
          let localPath = m.fileUrl;
          let imageBuffer: Buffer | undefined;

          const dataUrlMatch = /^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/]+={0,2})$/.exec(m.fileUrl);
          if (dataUrlMatch) {
            imageBuffer = Buffer.from(dataUrlMatch[2], 'base64');
          }

          const relativeUploadPath = localPath.startsWith('/uploads/')
            ? localPath.slice(1)
            : localPath.startsWith('public/uploads/')
              ? localPath
              : null;

          if (!imageBuffer && relativeUploadPath) {
            const uploadsDirectory = path.resolve(process.cwd(), 'public', 'uploads');
            const resolvedPath = path.resolve(/*turbopackIgnore: true*/ process.cwd(), relativeUploadPath);
            if (resolvedPath.startsWith(`${uploadsDirectory}${path.sep}`)) {
              localPath = resolvedPath;
            } else {
              localPath = '';
            }
          }
          if (!imageBuffer && localPath && relativeUploadPath && fs.existsSync(/*turbopackIgnore: true*/ localPath)) {
            imageBuffer = fs.readFileSync(/*turbopackIgnore: true*/ localPath);
          }

          if (imageBuffer) {
            const assetUrn = await uploadLinkedInImage(
              rawToken,
              post.socialAccount.providerAccountId,
              imageBuffer,
              m.mimeType || 'image/jpeg'
            );
            if (assetUrn) {
              mediaAssetUrns.push(assetUrn);
            }
          }
        } catch (mediaErr) {
          console.error('[Scheduler Worker] Media upload failed for file:', m.fileName, mediaErr);
        }
      }
    }

    // 7. Execute publishing via Official LinkedIn API
    const publishResult = await publishToLinkedIn({
      encryptedToken: post.socialAccount.accessTokenEncrypted,
      authorUrn: post.socialAccount.providerAccountId,
      text: post.content,
      mediaAssetUrns,
    });

    if (publishResult.success && publishResult.postId) {
      // 7. Success state transition: PROCESSING -> PUBLISHED
      await prisma.post.update({
        where: { id: postId },
        data: {
          status: 'PUBLISHED',
          publishedAt: new Date(),
          providerPostId: publishResult.postId,
          providerPostUrl: publishResult.postUrl,
          failureReason: null,
          lastError: null,
        },
      });

      // Update or create initial Analytics record
      await prisma.analytics.upsert({
        where: { postId: post.id },
        update: { lastSyncedAt: new Date() },
        create: {
          postId: post.id,
          impressions: 0,
          reactions: 0,
          comments: 0,
          reposts: 0,
          clicks: 0,
          engagementRate: 0.0,
        },
      });

      // Log audit
      await createAuditLog({
        userId: post.userId,
        action: 'POST_PUBLISHED',
        entityType: 'POST',
        entityId: post.id,
        details: { providerPostId: publishResult.postId, providerPostUrl: publishResult.postUrl },
      });

      // Notify user
      await createNotification({
        userId: post.userId,
        title: 'Post Published Successfully',
        message: 'Your LinkedIn post is now live on your feed.',
        type: 'SUCCESS',
        link: '/dashboard/published',
      });

      return { success: true, publishedPostId: publishResult.postId };
    } else {
      // 8. Failure handling with retry backoff check
      const currentRetries = post.retryCount || 0;
      const maxRetries = 3;
      const errorCode = publishResult.error?.code || 'UNKNOWN_ERROR';
      const errorMessage = publishResult.error?.message || 'Publishing to LinkedIn failed';

      // Determine if error is permanent (e.g. auth expired / permission revoked)
      const isPermanent =
        errorCode === 'LINKEDIN_AUTH_EXPIRED' ||
        errorCode === 'LINKEDIN_PERMISSION_DENIED' ||
        errorCode === 'INVALID_TOKEN';

      if (currentRetries < maxRetries && !isPermanent) {
        // Schedule next retry with exponential backoff (e.g., 2min, 5min, 15min)
        const delayMinutes = Math.pow(2, currentRetries + 1);
        const nextScheduled = new Date(Date.now() + delayMinutes * 60 * 1000);

        await prisma.post.update({
          where: { id: postId },
          data: {
            status: 'SCHEDULED',
            retryCount: currentRetries + 1,
            scheduledAt: nextScheduled,
            lastError: `${errorCode}: ${errorMessage} (Retrying attempt ${currentRetries + 1}/${maxRetries})`,
          },
        });

        return {
          success: false,
          error: `Transient failure. Retrying in ${delayMinutes} minutes (${currentRetries + 1}/${maxRetries})`,
        };
      } else {
        // Mark as FAILED
        await prisma.post.update({
          where: { id: postId },
          data: {
            status: 'FAILED',
            failureReason: errorMessage,
            lastError: errorCode,
          },
        });

        await createAuditLog({
          userId: post.userId,
          action: 'POST_PUBLISH_FAILED',
          entityType: 'POST',
          entityId: post.id,
          details: { error: publishResult.error },
        });

        await createNotification({
          userId: post.userId,
          title: 'LinkedIn Post Publishing Failed',
          message: isPermanent
            ? 'Publishing failed because your LinkedIn authorization expired or was revoked. Please reconnect your account.'
            : `Publishing failed: ${errorMessage}`,
          type: 'ERROR',
          link: '/dashboard/scheduled',
        });

        return { success: false, error: errorMessage };
      }
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Worker execution exception';
    console.error(`[Scheduler Worker] Error processing post ${postId}:`, err);
    return { success: false, error: errorMsg };
  }
}

/**
 * Background tick runner: Finds all due posts and executes them
 */
export async function runDueScheduledPosts(): Promise<number> {
  const now = new Date();
  const staleProcessingBefore = new Date(now.getTime() - 10 * 60 * 1000);

  await prisma.post.updateMany({
    where: {
      status: 'PROCESSING',
      updatedAt: {
        lt: staleProcessingBefore,
      },
    },
    data: {
      status: 'SCHEDULED',
      scheduledAt: now,
    },
  });
  
  // Find all posts that are SCHEDULED and whose scheduled time is past or equal to now
  const duePosts = await prisma.post.findMany({
    where: {
      status: 'SCHEDULED',
      scheduledAt: {
        lte: now,
      },
    },
    take: 20,
    orderBy: {
      scheduledAt: 'asc',
    },
  });

  if (duePosts.length === 0) {
    return 0;
  }

  console.log(`[Scheduler] Processing ${duePosts.length} due posts...`);

  for (const post of duePosts) {
    await processPublishJob(post.id);
  }

  return duePosts.length;
}

import { prisma } from './prisma';

export async function createNotification({
  userId,
  title,
  message,
  type = 'INFO',
  link,
}: {
  userId: string;
  title: string;
  message: string;
  type?: 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO';
  link?: string;
}) {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        link: link || null,
      },
    });
  } catch (err) {
    console.error('Failed to create notification:', err);
    return null;
  }
}

import { prisma } from './prisma';

export async function createAuditLog({
  userId,
  action,
  entityType,
  entityId,
  details,
  ipAddress,
}: {
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: string | Record<string, unknown>;
  ipAddress?: string;
}) {
  try {
    const detailsString = typeof details === 'object' ? JSON.stringify(details) : details;
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId: entityId || null,
        details: detailsString || null,
        ipAddress: ipAddress || null,
      },
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}

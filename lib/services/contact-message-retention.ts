import { prisma } from "@/lib/prisma";

export const DEFAULT_READ_RETENTION_DAYS = 180;
export const DEFAULT_UNREAD_RETENTION_DAYS = 30;

export function getContactMessageRetentionConfig() {
  const readDays = Number(process.env.CONTACT_MESSAGE_RETENTION_DAYS) || DEFAULT_READ_RETENTION_DAYS;
  const unreadDays =
    Number(process.env.CONTACT_MESSAGE_RETENTION_DAYS_UNREAD) || DEFAULT_UNREAD_RETENTION_DAYS;
  return { readDays, unreadDays };
}

export type PurgeResult = {
  deletedCount: number;
  readDays: number;
  unreadDays: number;
  readCutoff: Date;
  unreadCutoff: Date;
};

/**
 * Implements the retention flowchart for ContactMessage:
 *
 *   ContactMessage -> retention hold? --YES--> KEEP IT
 *                            |
 *                            NO
 *                            |
 *                          read? --YES--> eligible after readDays (180d)
 *                            |
 *                            NO
 *                            |
 *                    eligible after unreadDays (30d)
 *
 * A message on hold is never deleted here, no matter how old or its read
 * state — the hold is a manual override (see MessagesTable "Reter"/"Liberar
 * retenção") for messages an admin needs to keep around (e.g. a legal or
 * dispute hold), and it always wins over the age-based rules below.
 */
export async function purgeExpiredContactMessages(): Promise<PurgeResult> {
  const { readDays, unreadDays } = getContactMessageRetentionConfig();
  const readCutoff = new Date(Date.now() - readDays * 24 * 60 * 60 * 1000);
  const unreadCutoff = new Date(Date.now() - unreadDays * 24 * 60 * 60 * 1000);

  const result = await prisma.contactMessage.deleteMany({
    where: {
      // See the schema comment on retentionHold for why this is `{ not:
      // true }` and not `retentionHold: false`.
      retentionHold: { not: true },
      OR: [
        { read: true, createdAt: { lt: readCutoff } },
        { read: false, createdAt: { lt: unreadCutoff } },
      ],
    },
  });

  return { deletedCount: result.count, readDays, unreadDays, readCutoff, unreadCutoff };
}

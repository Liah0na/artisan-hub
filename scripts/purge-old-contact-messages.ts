/**
 * Maintenance script for item #14 (ContactMessage retention policy — see
 * docs/data-retention-and-deletion.md).
 *
 * Deletes contact messages that are both:
 *   - marked as read (an admin has already handled them), and
 *   - older than CONTACT_MESSAGE_RETENTION_DAYS (default: 180 days)
 *
 * Unread messages are never auto-deleted, no matter how old, so nothing
 * a staff member hasn't looked at yet can silently disappear.
 *
 * This process has no built-in scheduler — run it periodically via your
 * hosting platform's scheduled jobs / cron (e.g. `npm run purge:messages`
 * once a day or week). It is safe to run repeatedly.
 */
import { prisma } from "@/lib/prisma";

const DEFAULT_RETENTION_DAYS = 180;

async function main() {
  const retentionDays = Number(process.env.CONTACT_MESSAGE_RETENTION_DAYS) || DEFAULT_RETENTION_DAYS;
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

  const result = await prisma.contactMessage.deleteMany({
    where: { read: true, createdAt: { lt: cutoff } },
  });

  console.log(
    `[purge-old-contact-messages] Deleted ${result.count} read message(s) older than ${retentionDays} days (before ${cutoff.toISOString()}).`
  );
}

main()
  .catch((error) => {
    console.error("[purge-old-contact-messages] Failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

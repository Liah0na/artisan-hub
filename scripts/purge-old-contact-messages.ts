/**
 * Maintenance script for item #14 (ContactMessage retention policy — see
 * docs/data-retention-and-deletion.md and
 * lib/services/contact-message-retention.ts for the actual rules).
 *
 * This is a thin CLI wrapper: the same logic also runs daily via
 * /api/cron/purge-contact-messages (Vercel Cron, see vercel.json). Use this
 * script for a manual run, or if you're hosting somewhere other than
 * Vercel and need to wire up your own scheduler instead.
 *
 * `npm run purge:messages` — safe to run repeatedly, at any cadence.
 */
import { prisma } from "@/lib/prisma";
import { purgeExpiredContactMessages } from "@/lib/services/contact-message-retention";

async function main() {
  const { deletedCount, readDays, unreadDays, readCutoff, unreadCutoff } =
    await purgeExpiredContactMessages();

  console.log(
    `[purge-old-contact-messages] Deleted ${deletedCount} message(s) not on retention hold: ` +
      `read & older than ${readDays}d (before ${readCutoff.toISOString()}), ` +
      `or unread & older than ${unreadDays}d (before ${unreadCutoff.toISOString()}).`
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

import { NextResponse } from "next/server";
import { purgeExpiredContactMessages } from "@/lib/services/contact-message-retention";
import { purgeExpiredRateLimits } from "@/lib/rate-limit";
import { rejectUnauthorizedCron } from "@/lib/utils/verify-cron";

// Daily purge (see docs/data-retention-and-deletion.md and
// lib/services/contact-message-retention.ts for the actual rules).
// Wired up as a Vercel Cron job in vercel.json.
export async function GET(request: Request) {
  const rejected = rejectUnauthorizedCron(request);
  if (rejected) return rejected;

  const result = await purgeExpiredContactMessages();
  await purgeExpiredRateLimits();

  return NextResponse.json({
    ok: true,
    deletedCount: result.deletedCount,
    readDays: result.readDays,
    unreadDays: result.unreadDays,
  });
}

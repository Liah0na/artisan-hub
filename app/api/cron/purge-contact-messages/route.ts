import { NextResponse } from "next/server";
import { purgeExpiredContactMessages } from "@/lib/services/contact-message-retention";

// Daily purge (see docs/data-retention-and-deletion.md and
// lib/services/contact-message-retention.ts for the actual rules).
//
// Wired up as a Vercel Cron job in vercel.json. Vercel signs every cron
// request with `Authorization: Bearer ${CRON_SECRET}` when that env var is
// set — this is Vercel's own documented convention, not something custom
// we invented, so it also naturally rejects anyone hitting this URL
// directly. If CRON_SECRET isn't set, the endpoint refuses to run at all
// rather than silently skipping the auth check.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET não está configurado no servidor." }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await purgeExpiredContactMessages();

  return NextResponse.json({
    ok: true,
    deletedCount: result.deletedCount,
    readDays: result.readDays,
    unreadDays: result.unreadDays,
  });
}

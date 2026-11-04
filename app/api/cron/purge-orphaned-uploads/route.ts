import { NextResponse } from "next/server";
import { purgeOrphanedUploads } from "@/lib/services/media.service";
import { rejectUnauthorizedCron } from "@/lib/utils/verify-cron";

export const runtime = "nodejs";

// Daily cleanup of uploaded images that never ended up on a product or
// profile (see purgeOrphanedUploads). Wired up as a Vercel Cron job in
// vercel.json.
export async function GET(request: Request) {
  const rejected = rejectUnauthorizedCron(request);
  if (rejected) return rejected;

  const result = await purgeOrphanedUploads();

  return NextResponse.json({ ok: true, ...result });
}

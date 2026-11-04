import { NextResponse } from "next/server";

/**
 * Vercel signs every cron request with `Authorization: Bearer ${CRON_SECRET}`
 * when that env var is set — Vercel's documented convention — so this also
 * rejects anyone hitting a cron URL directly. If CRON_SECRET isn't set, the
 * endpoint refuses to run at all rather than silently skipping the check.
 *
 * Returns an error response to send back, or null if the request is allowed.
 */
export function rejectUnauthorizedCron(request: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET não está configurado no servidor." }, { status: 500 });
  }

  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const purgeExpiredContactMessagesMock = vi.fn();

vi.mock("@/lib/services/contact-message-retention", () => ({
  purgeExpiredContactMessages: (...args: unknown[]) => purgeExpiredContactMessagesMock(...args),
}));

import { GET } from "@/app/api/cron/purge-contact-messages/route";

const ORIGINAL_ENV = { ...process.env };

function makeRequest(authHeader?: string) {
  return new Request("https://x/api/cron/purge-contact-messages", {
    headers: authHeader ? { authorization: authHeader } : {},
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.CRON_SECRET = "s3cr3t";
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("GET /api/cron/purge-contact-messages", () => {
  it("returns 500 when CRON_SECRET isn't configured on the server", async () => {
    delete process.env.CRON_SECRET;

    const res = await GET(makeRequest("Bearer anything"));

    expect(res.status).toBe(500);
    expect(purgeExpiredContactMessagesMock).not.toHaveBeenCalled();
  });

  it("returns 401 with no Authorization header", async () => {
    const res = await GET(makeRequest());

    expect(res.status).toBe(401);
    expect(purgeExpiredContactMessagesMock).not.toHaveBeenCalled();
  });

  it("returns 401 when the bearer token doesn't match CRON_SECRET", async () => {
    const res = await GET(makeRequest("Bearer wrong-secret"));

    expect(res.status).toBe(401);
    expect(purgeExpiredContactMessagesMock).not.toHaveBeenCalled();
  });

  it("runs the purge and returns its result when the secret matches", async () => {
    purgeExpiredContactMessagesMock.mockResolvedValueOnce({
      deletedCount: 3,
      readDays: 180,
      unreadDays: 30,
      readCutoff: new Date(),
      unreadCutoff: new Date(),
    });

    const res = await GET(makeRequest("Bearer s3cr3t"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ ok: true, deletedCount: 3, readDays: 180, unreadDays: 30 });
  });
});

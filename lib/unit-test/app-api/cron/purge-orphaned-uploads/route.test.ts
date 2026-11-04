import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const purgeOrphanedUploadsMock = vi.fn();

vi.mock("@/lib/services/media.service", () => ({
  purgeOrphanedUploads: (...args: unknown[]) => purgeOrphanedUploadsMock(...args),
}));

import { GET } from "@/app/api/cron/purge-orphaned-uploads/route";

const ORIGINAL_ENV = { ...process.env };

function makeRequest(authHeader?: string) {
  return new Request("https://x/api/cron/purge-orphaned-uploads", {
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

describe("GET /api/cron/purge-orphaned-uploads", () => {
  it("returns 500 when CRON_SECRET isn't configured on the server", async () => {
    delete process.env.CRON_SECRET;

    const res = await GET(makeRequest("Bearer anything"));

    expect(res.status).toBe(500);
    expect(purgeOrphanedUploadsMock).not.toHaveBeenCalled();
  });

  it("returns 401 when the bearer token doesn't match CRON_SECRET", async () => {
    const res = await GET(makeRequest("Bearer wrong-secret"));

    expect(res.status).toBe(401);
    expect(purgeOrphanedUploadsMock).not.toHaveBeenCalled();
  });

  it("runs the purge and returns its result when the secret matches", async () => {
    purgeOrphanedUploadsMock.mockResolvedValueOnce({ scanned: 12, deleted: 3 });

    const res = await GET(makeRequest("Bearer s3cr3t"));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, scanned: 12, deleted: 3 });
  });
});

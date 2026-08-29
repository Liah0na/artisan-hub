import { describe, it, expect, vi, beforeEach } from "vitest";

const findFirstMock = vi.fn();
const updateMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findFirst: (...args: unknown[]) => findFirstMock(...args),
      update: (...args: unknown[]) => updateMock(...args),
    },
  },
}));

import { GET } from "@/app/api/auth/verify-email/route";

function makeRequest(query: string) {
  return new Request(`https://x/api/auth/verify-email${query}`);
}

function redirectPath(res: Response) {
  return new URL(res.headers.get("location")!).pathname + new URL(res.headers.get("location")!).search;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/auth/verify-email", () => {
  it("redirects with verify=missing when no token is provided", async () => {
    const res = await GET(makeRequest(""));

    expect(res.status).toBe(307);
    expect(redirectPath(res)).toBe("/signin?verify=missing");
    expect(findFirstMock).not.toHaveBeenCalled();
  });

  it("redirects with verify=invalid when no user matches the token hash", async () => {
    findFirstMock.mockResolvedValueOnce(null);

    const res = await GET(makeRequest("?token=abc123"));

    expect(redirectPath(res)).toBe("/signin?verify=invalid");
  });

  it("redirects with verify=invalid when the user has no expiry stored", async () => {
    findFirstMock.mockResolvedValueOnce({ id: "u1", verificationTokenExpires: null });

    const res = await GET(makeRequest("?token=abc123"));

    expect(redirectPath(res)).toBe("/signin?verify=invalid");
  });

  it("redirects with verify=expired when the token has expired", async () => {
    findFirstMock.mockResolvedValueOnce({
      id: "u1",
      verificationTokenExpires: new Date(Date.now() - 1000),
    });

    const res = await GET(makeRequest("?token=abc123"));

    expect(redirectPath(res)).toBe("/signin?verify=expired");
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("marks the user verified and redirects with verify=success for a valid token", async () => {
    findFirstMock.mockResolvedValueOnce({
      id: "u1",
      verificationTokenExpires: new Date(Date.now() + 60_000),
    });

    const res = await GET(makeRequest("?token=abc123"));

    expect(redirectPath(res)).toBe("/signin?verify=success");
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpires: null,
      },
    });
  });
});

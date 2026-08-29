import { describe, it, expect, vi, beforeEach } from "vitest";

const getServerSessionMock = vi.fn();
const findUniqueMock = vi.fn();
const updateMock = vi.fn();

vi.mock("next-auth", () => ({
  getServerSession: (...args: unknown[]) => getServerSessionMock(...args),
}));

vi.mock("@/auth", () => ({ authOptions: {} }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => findUniqueMock(...args),
      update: (...args: unknown[]) => updateMock(...args),
    },
  },
}));

import { GET, PATCH } from "@/app/api/dashboard/profile/route";

function makeRequest(body: unknown) {
  return new Request("https://x/api/dashboard/profile", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/dashboard/profile", () => {
  it("returns 401 when there is no session", async () => {
    getServerSessionMock.mockResolvedValueOnce(null);

    const res = await GET();

    expect(res.status).toBe(401);
    expect(findUniqueMock).not.toHaveBeenCalled();
  });

  it("returns 404 when the session user no longer exists", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { id: "u1" } });
    findUniqueMock.mockResolvedValueOnce(null);

    const res = await GET();

    expect(res.status).toBe(404);
  });

  it("returns the user profile for a valid session", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { id: "u1" } });
    findUniqueMock.mockResolvedValueOnce({ id: "u1", name: "Maria", email: "maria@example.com" });

    const res = await GET();

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: "u1", name: "Maria", email: "maria@example.com" });
    expect(findUniqueMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "u1" } })
    );
  });
});

describe("PATCH /api/dashboard/profile", () => {
  it("returns 401 when there is no session", async () => {
    getServerSessionMock.mockResolvedValueOnce(null);

    const res = await PATCH(makeRequest({ name: "Maria" }));

    expect(res.status).toBe(401);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("returns 400 when the name is missing", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { id: "u1" } });

    const res = await PATCH(makeRequest({ bio: "Ceramista" }));

    expect(res.status).toBe(400);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("normalizes blank optional fields to null and updates the profile", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { id: "u1" } });
    updateMock.mockResolvedValueOnce({ id: "u1", name: "Maria" });

    const res = await PATCH(
      makeRequest({ name: "  Maria  ", bio: "  ", phone: "", instagram: "@maria", location: null })
    );

    expect(res.status).toBe(200);
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "u1" },
        data: {
          name: "Maria",
          bio: null,
          phone: null,
          instagram: "@maria",
          location: null,
          avatar: null,
        },
      })
    );
  });

  it("returns 400 for an unparseable JSON body", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { id: "u1" } });

    const res = await PATCH(
      new Request("https://x/api/dashboard/profile", { method: "PATCH", body: "not json" })
    );

    expect(res.status).toBe(400);
  });
});

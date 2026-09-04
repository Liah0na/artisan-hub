import { describe, it, expect, vi, beforeEach } from "vitest";

const getServerSessionMock = vi.fn();
const findUniqueMock = vi.fn();
const updateMock = vi.fn();
const deleteCloudinaryAssetMock = vi.fn();

vi.mock("next-auth", () => ({
  getServerSession: (...args: unknown[]) => getServerSessionMock(...args),
}));

vi.mock("@/lib/utils/auth", () => ({ authOptions: {} }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => findUniqueMock(...args),
      update: (...args: unknown[]) => updateMock(...args),
    },
  },
}));

vi.mock("@/lib/utils/cloudinary.server", () => ({
  deleteCloudinaryAsset: (...args: unknown[]) => deleteCloudinaryAssetMock(...args),
}));

import { GET, PATCH } from "@/app/api/dashboard/profile/route";

const USER_ID = "u1";
const PRIVATE_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatar: true,
  bio: true,
  phone: true,
  instagram: true,
  location: true,
};

function makeRequest(body: unknown) {
  return new Request("https://x/api/dashboard/profile", {
    method: "PATCH",
    headers: { origin: "https://x", host: "x" },
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
    getServerSessionMock.mockResolvedValueOnce({ user: { id: USER_ID } });
    findUniqueMock.mockResolvedValueOnce(null);

    const res = await GET();

    expect(res.status).toBe(404);
  });

  it("returns the user's own private profile (including email) selecting only the intended fields", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { id: USER_ID } });
    findUniqueMock.mockResolvedValueOnce({ id: USER_ID, name: "Maria", email: "maria@example.com" });

    const res = await GET();

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: USER_ID, name: "Maria", email: "maria@example.com" });
    expect(findUniqueMock).toHaveBeenCalledWith({ where: { id: USER_ID }, select: PRIVATE_SELECT });
  });
});

describe("PATCH /api/dashboard/profile", () => {
  it("rejects a request whose Origin doesn't match the Host (item #15)", async () => {
    const res = await PATCH(
      new Request("https://x/api/dashboard/profile", {
        method: "PATCH",
        headers: { origin: "https://evil.example.com", host: "x" },
        body: JSON.stringify({ name: "Maria" }),
      })
    );

    expect(res.status).toBe(403);
    expect(getServerSessionMock).not.toHaveBeenCalled();
  });

  it("returns 401 when there is no session", async () => {
    getServerSessionMock.mockResolvedValueOnce(null);

    const res = await PATCH(makeRequest({ name: "Maria" }));

    expect(res.status).toBe(401);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("returns 400 when the name is missing", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { id: USER_ID } });

    const res = await PATCH(makeRequest({ bio: "Ceramista" }));

    expect(res.status).toBe(400);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("returns 400 when an optional field exceeds its length limit (item #11)", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { id: USER_ID } });

    const res = await PATCH(makeRequest({ name: "Maria", bio: "x".repeat(1001) }));

    expect(res.status).toBe(400);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("returns 400 for a phone number containing letters", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { id: USER_ID } });

    const res = await PATCH(makeRequest({ name: "Maria", phone: "call me maybe" }));

    expect(res.status).toBe(400);
  });

  it("normalizes blank optional fields to null and updates the profile, without touching the avatar", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { id: USER_ID } });
    updateMock.mockResolvedValueOnce({ id: USER_ID, name: "Maria" });

    const res = await PATCH(
      makeRequest({ name: "  Maria  ", bio: "  ", phone: "", instagram: "@maria", location: null })
    );

    expect(res.status).toBe(200);
    expect(findUniqueMock).not.toHaveBeenCalled(); // no avatar lookup needed — avatar wasn't in the body
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: USER_ID },
      data: {
        name: "Maria",
        bio: null,
        phone: null,
        instagram: "@maria",
        location: null,
      },
      select: PRIVATE_SELECT,
    });
    expect(deleteCloudinaryAssetMock).not.toHaveBeenCalled();
  });

  it("returns 400 for an unparseable JSON body", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { id: USER_ID } });

    const res = await PATCH(
      new Request("https://x/api/dashboard/profile", {
        method: "PATCH",
        headers: { origin: "https://x", host: "x" },
        body: "not json",
      })
    );

    expect(res.status).toBe(400);
  });

  it("rejects an avatar publicId that doesn't belong to the session user (item #12)", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { id: USER_ID } });

    const res = await PATCH(
      makeRequest({
        name: "Maria",
        avatar: { url: "https://cdn/x.jpg", publicId: "artisan-hub/avatars/someone-else/x" },
      })
    );

    expect(res.status).toBe(400);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("accepts a new avatar owned by the session user and deletes the previous one (item #6)", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { id: USER_ID } });
    findUniqueMock.mockResolvedValueOnce({ avatar: { publicId: `artisan-hub/avatars/${USER_ID}/old` } });
    updateMock.mockResolvedValueOnce({ id: USER_ID });

    const newAvatar = { url: "https://cdn/new.jpg", publicId: `artisan-hub/avatars/${USER_ID}/new` };
    const res = await PATCH(makeRequest({ name: "Maria", avatar: newAvatar }));

    expect(res.status).toBe(200);
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ avatar: newAvatar }) })
    );
    expect(deleteCloudinaryAssetMock).toHaveBeenCalledWith(`artisan-hub/avatars/${USER_ID}/old`);
  });

  it("removes the avatar (avatar: null) and deletes the previous Cloudinary asset", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { id: USER_ID } });
    findUniqueMock.mockResolvedValueOnce({ avatar: { publicId: `artisan-hub/avatars/${USER_ID}/old` } });
    updateMock.mockResolvedValueOnce({ id: USER_ID });

    const res = await PATCH(makeRequest({ name: "Maria", avatar: null }));

    expect(res.status).toBe(200);
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ avatar: null }) })
    );
    expect(deleteCloudinaryAssetMock).toHaveBeenCalledWith(`artisan-hub/avatars/${USER_ID}/old`);
  });

  it("does not delete anything from Cloudinary when there was no previous avatar", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { id: USER_ID } });
    findUniqueMock.mockResolvedValueOnce({ avatar: null });
    updateMock.mockResolvedValueOnce({ id: USER_ID });

    const newAvatar = { url: "https://cdn/new.jpg", publicId: `artisan-hub/avatars/${USER_ID}/new` };
    await PATCH(makeRequest({ name: "Maria", avatar: newAvatar }));

    expect(deleteCloudinaryAssetMock).not.toHaveBeenCalled();
  });
});

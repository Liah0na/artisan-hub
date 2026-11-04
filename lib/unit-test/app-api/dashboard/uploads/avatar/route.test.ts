import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const getServerSessionMock = vi.fn();
const uploadMock = vi.fn();

vi.mock("next-auth", () => ({
  getServerSession: (...args: unknown[]) => getServerSessionMock(...args),
}));

vi.mock("@/auth", () => ({ authOptions: {} }));

vi.mock("@/lib/utils/cloudinary.server", () => ({
  cloudinary: { uploader: { upload: (...args: unknown[]) => uploadMock(...args) } },
}));

import { POST } from "@/app/api/dashboard/uploads/avatar/route";

const ORIGINAL_ENV = { ...process.env };

function makeFormRequest(file?: File) {
  const formData = new FormData();
  if (file) formData.set("file", file);
  return new Request("https://x/api/dashboard/uploads/avatar", {
    method: "POST",
    headers: { origin: "https://x", host: "x" },
    body: formData,
  });
}

function makeImageFile(opts: { type?: string; size?: number } = {}) {
  const type = opts.type ?? "image/png";
  const size = opts.size ?? 1024;
  return new File([new Uint8Array(size)], "avatar.png", { type });
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.CLOUDINARY_CLOUD_NAME = "cloud";
  process.env.CLOUDINARY_API_KEY = "key";
  process.env.CLOUDINARY_API_SECRET = "secret";
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("POST /api/dashboard/uploads/avatar", () => {
  it("returns 401 without a session", async () => {
    getServerSessionMock.mockResolvedValueOnce(null);

    const res = await POST(makeFormRequest(makeImageFile()));

    expect(res.status).toBe(401);
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it("returns 500 when Cloudinary env vars are missing", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { id: "u1" } });
    delete process.env.CLOUDINARY_API_SECRET;

    const res = await POST(makeFormRequest(makeImageFile()));

    expect(res.status).toBe(500);
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it("returns 400 when no file is provided", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { id: "u1" } });

    const res = await POST(makeFormRequest());

    expect(res.status).toBe(400);
  });

  it("returns 400 for a disallowed file type", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { id: "u1" } });

    const res = await POST(makeFormRequest(makeImageFile({ type: "application/pdf" })));

    expect(res.status).toBe(400);
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it("returns 400 when the file exceeds 5MB", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { id: "u1" } });

    const res = await POST(makeFormRequest(makeImageFile({ size: 5 * 1024 * 1024 + 1 })));

    expect(res.status).toBe(400);
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it("uploads to a folder scoped by user id and returns the resulting URL", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { id: "u1" } });
    uploadMock.mockResolvedValueOnce({
      secure_url: "https://res.cloudinary.com/cloud/avatar.png",
      public_id: "artisan-hub/avatars/u1/xyz",
    });

    const res = await POST(makeFormRequest(makeImageFile()));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      url: "https://res.cloudinary.com/cloud/avatar.png",
      publicId: "artisan-hub/avatars/u1/xyz",
    });
    expect(uploadMock).toHaveBeenCalledWith(
      expect.stringContaining("data:image/png;base64,"),
      expect.objectContaining({ folder: "artisan-hub/avatars/u1" })
    );
  });
});

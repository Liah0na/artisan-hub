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

import { POST } from "@/app/api/dashboard/uploads/product-image/route";

const ORIGINAL_ENV = { ...process.env };

function makeFormRequest(file?: File) {
  const formData = new FormData();
  if (file) formData.set("file", file);
  return new Request("https://x/api/dashboard/uploads/product-image", {
    method: "POST",
    body: formData,
  });
}

function makeImageFile(opts: { type?: string; size?: number } = {}) {
  const type = opts.type ?? "image/webp";
  const size = opts.size ?? 2048;
  return new File([new Uint8Array(size)], "product.webp", { type });
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

describe("POST /api/dashboard/uploads/product-image", () => {
  it("returns 401 without a session", async () => {
    getServerSessionMock.mockResolvedValueOnce(null);

    const res = await POST(makeFormRequest(makeImageFile()));

    expect(res.status).toBe(401);
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it("returns 400 for a disallowed file type", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { id: "u1" } });

    const res = await POST(makeFormRequest(makeImageFile({ type: "video/mp4" })));

    expect(res.status).toBe(400);
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it("returns 400 when the file exceeds 5MB", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { id: "u1" } });

    const res = await POST(makeFormRequest(makeImageFile({ size: 5 * 1024 * 1024 + 1 })));

    expect(res.status).toBe(400);
  });

  it("uploads to a product folder scoped by user id", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { id: "u1" } });
    uploadMock.mockResolvedValueOnce({
      secure_url: "https://res.cloudinary.com/cloud/product.webp",
      public_id: "artisan-hub/products/u1/xyz",
    });

    const res = await POST(makeFormRequest(makeImageFile()));

    expect(res.status).toBe(200);
    expect(uploadMock).toHaveBeenCalledWith(
      expect.stringContaining("data:image/webp;base64,"),
      expect.objectContaining({ folder: "artisan-hub/products/u1" })
    );
  });
});

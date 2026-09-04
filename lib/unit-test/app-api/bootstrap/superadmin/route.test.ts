import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const findFirstMock = vi.fn();
const findUniqueMock = vi.fn();
const createMock = vi.fn();
const bcryptHashMock = vi.fn();

vi.mock("bcryptjs", () => ({
  default: { hash: (...args: unknown[]) => bcryptHashMock(...args) },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findFirst: (...args: unknown[]) => findFirstMock(...args),
      findUnique: (...args: unknown[]) => findUniqueMock(...args),
      create: (...args: unknown[]) => createMock(...args),
    },
  },
}));

import { POST } from "@/app/api/bootstrap/superadmin/route";

const ORIGINAL_ENV = { ...process.env };

function makeRequest(secretHeader?: string) {
  return new Request("https://x/api/bootstrap/superadmin", {
    method: "POST",
    headers: secretHeader ? { "x-bootstrap-secret": secretHeader } : {},
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  bcryptHashMock.mockResolvedValue("hashed-password");
  process.env.SUPERADMIN_BOOTSTRAP_ENABLED = "true";
  process.env.SUPERADMIN_BOOTSTRAP_SECRET = "top-secret";
  process.env.SUPERADMIN_EMAIL = "root@example.com";
  process.env.SUPERADMIN_PASSWORD = "rootPassword123";
  process.env.SUPERADMIN_NAME = "Root";
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("POST /api/bootstrap/superadmin", () => {
  it("returns 404 when SUPERADMIN_BOOTSTRAP_ENABLED isn't set to 'true' (endpoint disabled)", async () => {
    delete process.env.SUPERADMIN_BOOTSTRAP_ENABLED;

    const res = await POST(makeRequest("top-secret"));

    expect(res.status).toBe(404);
    expect(findFirstMock).not.toHaveBeenCalled();
  });

  it("returns 404 when SUPERADMIN_BOOTSTRAP_ENABLED is set to something other than 'true'", async () => {
    process.env.SUPERADMIN_BOOTSTRAP_ENABLED = "false";

    const res = await POST(makeRequest("top-secret"));

    expect(res.status).toBe(404);
  });

  it("returns 500 when the server secret isn't configured", async () => {
    delete process.env.SUPERADMIN_BOOTSTRAP_SECRET;

    const res = await POST(makeRequest("anything"));

    expect(res.status).toBe(500);
    expect(findFirstMock).not.toHaveBeenCalled();
  });

  it("returns 401 when no secret header is provided", async () => {
    const res = await POST(makeRequest());

    expect(res.status).toBe(401);
    expect(findFirstMock).not.toHaveBeenCalled();
  });

  it("returns 401 when the secret header doesn't match", async () => {
    const res = await POST(makeRequest("wrong-secret"));

    expect(res.status).toBe(401);
  });

  it("returns alreadyExists:true without creating anyone when a superadmin exists", async () => {
    findFirstMock.mockResolvedValueOnce({ id: "existing-superadmin" });

    const res = await POST(makeRequest("top-secret"));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      message: "O super usuário já existe.",
      alreadyExists: true,
    });
    expect(createMock).not.toHaveBeenCalled();
  });

  it("returns 500 when SUPERADMIN_EMAIL or SUPERADMIN_PASSWORD isn't configured", async () => {
    findFirstMock.mockResolvedValueOnce(null);
    delete process.env.SUPERADMIN_PASSWORD;

    const res = await POST(makeRequest("top-secret"));

    expect(res.status).toBe(500);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("returns 409 when the configured email is already taken by another account", async () => {
    findFirstMock.mockResolvedValueOnce(null);
    findUniqueMock.mockResolvedValueOnce({ id: "someone-else" });

    const res = await POST(makeRequest("top-secret"));

    expect(res.status).toBe(409);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("creates the superadmin with hashed password on success", async () => {
    findFirstMock.mockResolvedValueOnce(null);
    findUniqueMock.mockResolvedValueOnce(null);
    createMock.mockResolvedValueOnce({});

    const res = await POST(makeRequest("top-secret"));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      message: "Super usuário criado com sucesso.",
      alreadyExists: false,
    });
    expect(createMock).toHaveBeenCalledWith({
      data: {
        name: "Root",
        email: "root@example.com",
        passwordHash: "hashed-password",
        role: "superadmin",
        emailVerified: true,
      },
    });
  });

  it("rejects a secret of a different length without matching content (no crash)", async () => {
    const res = await POST(makeRequest("short"));
    expect(res.status).toBe(401);
  });

  it("defaults the name to 'Super Admin' when SUPERADMIN_NAME isn't set", async () => {
    delete process.env.SUPERADMIN_NAME;
    findFirstMock.mockResolvedValueOnce(null);
    findUniqueMock.mockResolvedValueOnce(null);
    createMock.mockResolvedValueOnce({});

    await POST(makeRequest("top-secret"));

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ name: "Super Admin" }) })
    );
  });
});

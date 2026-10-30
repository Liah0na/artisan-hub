import { describe, it, expect, vi, beforeEach } from "vitest";

const findUniqueMock = vi.fn();
const bcryptCompareMock = vi.fn();
const consumeLoginAttemptMock = vi.fn();
const clearLoginAttemptsMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: (...args: unknown[]) => findUniqueMock(...args) },
  },
}));

vi.mock("@/lib/services/login-attempts", () => ({
  consumeLoginAttempt: (...args: unknown[]) => consumeLoginAttemptMock(...args),
  clearLoginAttempts: (...args: unknown[]) => clearLoginAttemptsMock(...args),
}));

vi.mock("bcryptjs", () => ({
  default: { compare: (...args: unknown[]) => bcryptCompareMock(...args) },
}));

import { getServerSession } from "next-auth";
import { encode } from "next-auth/jwt";

import { authOptions } from "@/lib/utils/auth";

// NOTE: next-auth v4's Credentials() factory always returns `authorize: () =>
// null` on the provider object itself; the real authorize function we passed
// in is stored under `.options.authorize` and only wired up by NextAuth's
// internal provider normalization at request time. Reach into `.options` to
// exercise the actual logic directly.
type Authorize = (
  credentials: Record<string, string> | undefined,
  req?: { headers: Record<string, string> }
) => Promise<unknown>;
const authorize = (
  authOptions.providers[0] as unknown as { options: { authorize: Authorize } }
).options.authorize;

beforeEach(() => {
  vi.clearAllMocks();
  consumeLoginAttemptMock.mockResolvedValue(true);
});

describe("authorize()", () => {
  it("returns null when email or password is missing", async () => {
    expect(await authorize(undefined)).toBeNull();
    expect(await authorize({ email: "a@b.com" })).toBeNull();
    expect(await authorize({ password: "x" })).toBeNull();
    expect(findUniqueMock).not.toHaveBeenCalled();
  });

  it("returns null when no user matches the (lowercased) email", async () => {
    findUniqueMock.mockResolvedValueOnce(null);

    const result = await authorize({ email: "Maria@Example.com", password: "senha123" });

    expect(result).toBeNull();
    expect(findUniqueMock).toHaveBeenCalledWith({ where: { email: "maria@example.com" } });
  });

  it("returns null when the password doesn't match", async () => {
    findUniqueMock.mockResolvedValueOnce({
      id: "u1",
      passwordHash: "hashed",
      emailVerified: true,
    });
    bcryptCompareMock.mockResolvedValueOnce(false);

    const result = await authorize({ email: "maria@example.com", password: "wrong" });

    expect(result).toBeNull();
  });

  it("throws EmailNotVerified when the password is correct but an artisan's email isn't verified", async () => {
    findUniqueMock.mockResolvedValueOnce({
      id: "u1",
      role: "artisan",
      passwordHash: "hashed",
      emailVerified: false,
    });
    bcryptCompareMock.mockResolvedValueOnce(true);

    await expect(
      authorize({ email: "maria@example.com", password: "senha123" })
    ).rejects.toThrow("EmailNotVerified");
  });

  it("does NOT require emailVerified for admin/superadmin roles (item #7)", async () => {
    findUniqueMock.mockResolvedValueOnce({
      id: "u1",
      name: "Admin",
      email: "admin@example.com",
      role: "admin",
      passwordHash: "hashed",
      emailVerified: false,
    });
    bcryptCompareMock.mockResolvedValueOnce(true);

    const result = await authorize({ email: "admin@example.com", password: "senha123" });

    expect(result).toEqual({ id: "u1", name: "Admin", email: "admin@example.com", role: "admin" });
  });

  it("returns the user's public fields on a successful login", async () => {
    findUniqueMock.mockResolvedValueOnce({
      id: "u1",
      name: "Maria",
      email: "maria@example.com",
      role: "artisan",
      passwordHash: "hashed",
      emailVerified: true,
    });
    bcryptCompareMock.mockResolvedValueOnce(true);

    const result = await authorize({ email: "maria@example.com", password: "senha123" });

    expect(result).toEqual({
      id: "u1",
      name: "Maria",
      email: "maria@example.com",
      role: "artisan",
    });
  });
});

describe("authorize() brute-force protection", () => {
  const credentials = { email: "Maria@Example.com", password: "senha123" };
  const req = { headers: { "x-forwarded-for": "203.0.113.7, 10.0.0.1" } };

  it("rejects before touching the user or password once the limit is reached", async () => {
    consumeLoginAttemptMock.mockResolvedValueOnce(false);

    await expect(authorize(credentials, req)).rejects.toThrow("TooManyAttempts");

    expect(consumeLoginAttemptMock).toHaveBeenCalledWith("maria@example.com", "203.0.113.7");
    expect(findUniqueMock).not.toHaveBeenCalled();
    expect(bcryptCompareMock).not.toHaveBeenCalled();
  });

  it("keeps a failed attempt counted when the password is wrong", async () => {
    findUniqueMock.mockResolvedValueOnce({ id: "u1", passwordHash: "hashed" });
    bcryptCompareMock.mockResolvedValueOnce(false);

    expect(await authorize(credentials, req)).toBeNull();

    expect(clearLoginAttemptsMock).not.toHaveBeenCalled();
  });

  it("clears the attempts after a correct password", async () => {
    findUniqueMock.mockResolvedValueOnce({
      id: "u1",
      role: "artisan",
      passwordHash: "hashed",
      emailVerified: true,
    });
    bcryptCompareMock.mockResolvedValueOnce(true);

    await authorize(credentials, req);

    expect(clearLoginAttemptsMock).toHaveBeenCalledWith("maria@example.com", "203.0.113.7");
  });
});

describe("callbacks.jwt", () => {
  it("copies role and id from the user onto the token on sign-in", async () => {
    const token = await authOptions.callbacks!.jwt!({
      token: {},
      user: { id: "u1", role: "admin" } as never,
    } as never);

    expect(token).toMatchObject({ role: "admin", id: "u1" });
    expect(findUniqueMock).not.toHaveBeenCalled();
  });

  it("keeps the token as is when the role hasn't changed (subsequent requests)", async () => {
    findUniqueMock.mockResolvedValueOnce({ role: "admin" });

    const existing = { role: "admin", id: "u1" };
    const token = await authOptions.callbacks!.jwt!({ token: existing } as never);

    expect(token).toEqual({ role: "admin", id: "u1" });
    expect(findUniqueMock).toHaveBeenCalledWith({
      where: { id: "u1" },
      select: { role: true },
    });
  });

  it("refreshes the role on the token when the user was demoted", async () => {
    findUniqueMock.mockResolvedValueOnce({ role: "artisan" });

    const token = await authOptions.callbacks!.jwt!({
      token: { role: "admin", id: "u1" },
    } as never);

    expect(token).toMatchObject({ role: "artisan", id: "u1" });
  });

  it("throws when the user no longer exists", async () => {
    findUniqueMock.mockResolvedValueOnce(null);

    await expect(
      authOptions.callbacks!.jwt!({ token: { role: "admin", id: "u1" } } as never)
    ).rejects.toThrow("SessionUserNotFound");
  });
});

describe("getServerSession with an already issued JWT", () => {
  const secret = "test-secret";
  const options = { ...authOptions, secret, logger: { error() {}, warn() {}, debug() {} } };

  const sessionFor = async () => {
    const sessionToken = await encode({ token: { id: "u1", role: "admin" }, secret });
    const req = { headers: {}, cookies: { "next-auth.session-token": sessionToken } };
    const res = { getHeader() {}, setHeader() {} };
    return getServerSession(req as never, res as never, options);
  };

  it("returns the current role for a demoted user", async () => {
    findUniqueMock.mockResolvedValueOnce({ role: "artisan" });

    const session = await sessionFor();

    expect(session?.user).toMatchObject({ id: "u1", role: "artisan" });
  });

  it("returns null for a removed user", async () => {
    findUniqueMock.mockResolvedValueOnce(null);

    expect(await sessionFor()).toBeNull();
  });
});

describe("callbacks.session", () => {
  it("copies id and role from the token onto session.user", async () => {
    const session = await authOptions.callbacks!.session!({
      session: { user: {} },
      token: { id: "u1", role: "admin" },
    } as never);

    expect((session as never as { user: { id: string; role: string } }).user).toMatchObject({
      id: "u1",
      role: "admin",
    });
  });
});

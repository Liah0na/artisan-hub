import { describe, it, expect, vi, beforeEach } from "vitest";

type Row = { id: string; count: number; resetAt: Date };
const rows = new Map<string, Row>();
const uniqueConflict = Object.assign(new Error("conflict"), { code: "P2002" });
let conflictOnNextCreate: Row | null = null;

// Small in-memory stand-in for the collection, so tests can assert behaviour
// across a sequence of attempts instead of individual Prisma calls.
vi.mock("@/lib/prisma", () => ({
  prisma: {
    loginAttempt: {
      updateMany: async ({ where, data }: { where: { id: string; resetAt?: { gt: Date } }; data: { count: { increment?: number; decrement?: number } } }) => {
        const row = rows.get(where.id);
        if (!row || (where.resetAt && row.resetAt <= where.resetAt.gt)) return { count: 0 };
        row.count += (data.count.increment ?? 0) - (data.count.decrement ?? 0);
        return { count: 1 };
      },
      deleteMany: async ({ where }: { where: { id?: string; resetAt?: { lte: Date } } }) => {
        let count = 0;
        for (const row of [...rows.values()]) {
          if (where.id && row.id !== where.id) continue;
          if (where.resetAt && row.resetAt > where.resetAt.lte) continue;
          rows.delete(row.id);
          count += 1;
        }
        return { count };
      },
      create: async ({ data }: { data: Row }) => {
        if (conflictOnNextCreate) {
          rows.set(data.id, { ...conflictOnNextCreate, id: data.id });
          conflictOnNextCreate = null;
          throw uniqueConflict;
        }
        rows.set(data.id, { ...data });
      },
      findUnique: async ({ where }: { where: { id: string } }) => rows.get(where.id) ?? null,
    },
  },
}));

import {
  LOGIN_EMAIL_LIMIT,
  LOGIN_IP_LIMIT,
  LOGIN_WINDOW_MS,
  clearLoginAttempts,
  consumeLoginAttempt,
  purgeExpiredLoginAttempts,
} from "@/lib/services/login-attempts";

async function attempt(times: number, email: (i: number) => string, ip = "203.0.113.7") {
  let allowed = true;
  for (let i = 0; i < times; i += 1) allowed = await consumeLoginAttempt(email(i), ip);
  return allowed;
}

beforeEach(() => {
  rows.clear();
  conflictOnNextCreate = null;
  vi.useRealTimers();
});

describe("consumeLoginAttempt", () => {
  it("allows attempts up to the email limit and blocks the next, even from another IP", async () => {
    expect(await attempt(LOGIN_EMAIL_LIMIT, () => "maria@example.com")).toBe(true);
    expect(await consumeLoginAttempt("maria@example.com", "198.51.100.9")).toBe(false);
  });

  it("blocks one IP trying many accounts, without affecting other IPs", async () => {
    expect(await attempt(LOGIN_IP_LIMIT, (i) => `user${i}@example.com`)).toBe(true);
    expect(await consumeLoginAttempt("other@example.com", "203.0.113.7")).toBe(false);
    expect(await consumeLoginAttempt("another@example.com", "198.51.100.9")).toBe(true);
  });

  it("opens a new window once the old one expires", async () => {
    vi.useFakeTimers();
    await attempt(LOGIN_EMAIL_LIMIT + 1, () => "maria@example.com");

    vi.advanceTimersByTime(LOGIN_WINDOW_MS + 1);

    expect(await consumeLoginAttempt("maria@example.com", "203.0.113.7")).toBe(true);
  });

  it("doesn't share one bucket between callers with an unknown IP", async () => {
    expect(await attempt(LOGIN_IP_LIMIT + 5, (i) => `user${i}@example.com`, "unknown")).toBe(true);
  });

  it("counts against the existing window when a concurrent attempt created it first", async () => {
    conflictOnNextCreate = { id: "", count: LOGIN_EMAIL_LIMIT, resetAt: new Date(Date.now() + LOGIN_WINDOW_MS) };

    expect(await consumeLoginAttempt("maria@example.com", "unknown")).toBe(false);
  });

  it("doesn't store the email or IP in plain text", async () => {
    await consumeLoginAttempt("maria@example.com", "203.0.113.7");

    const ids = [...rows.keys()].join(" ");
    expect(ids).not.toContain("maria");
    expect(ids).not.toContain("203.0.113.7");
  });
});

describe("clearLoginAttempts", () => {
  it("resets the email but only forgives one attempt on the IP", async () => {
    await attempt(LOGIN_EMAIL_LIMIT, () => "maria@example.com");
    await attempt(LOGIN_IP_LIMIT - LOGIN_EMAIL_LIMIT, (i) => `user${i}@example.com`);

    await clearLoginAttempts("maria@example.com", "203.0.113.7");

    expect(await consumeLoginAttempt("maria@example.com", "198.51.100.9")).toBe(true);
    // The IP was at its limit and got exactly one attempt back.
    expect(await consumeLoginAttempt("x@example.com", "203.0.113.7")).toBe(true);
    expect(await consumeLoginAttempt("y@example.com", "203.0.113.7")).toBe(false);
  });
});

describe("purgeExpiredLoginAttempts", () => {
  it("removes only expired rows", async () => {
    rows.set("old", { id: "old", count: 3, resetAt: new Date(Date.now() - 1000) });
    rows.set("live", { id: "live", count: 3, resetAt: new Date(Date.now() + 1000) });

    expect(await purgeExpiredLoginAttempts()).toBe(1);
    expect([...rows.keys()]).toEqual(["live"]);
  });
});

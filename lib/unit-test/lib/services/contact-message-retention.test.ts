import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const deleteManyMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: { contactMessage: { deleteMany: (...args: unknown[]) => deleteManyMock(...args) } },
}));

import {
  purgeExpiredContactMessages,
  getContactMessageRetentionConfig,
  DEFAULT_READ_RETENTION_DAYS,
  DEFAULT_UNREAD_RETENTION_DAYS,
} from "@/lib/services/contact-message-retention";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-06-01T00:00:00.000Z"));
  deleteManyMock.mockResolvedValue({ count: 0 });
});

afterEach(() => {
  vi.useRealTimers();
  process.env = { ...ORIGINAL_ENV };
});

describe("getContactMessageRetentionConfig", () => {
  it("defaults to 180 days (read) / 30 days (unread) when no env vars are set", () => {
    delete process.env.CONTACT_MESSAGE_RETENTION_DAYS;
    delete process.env.CONTACT_MESSAGE_RETENTION_DAYS_UNREAD;

    expect(getContactMessageRetentionConfig()).toEqual({
      readDays: DEFAULT_READ_RETENTION_DAYS,
      unreadDays: DEFAULT_UNREAD_RETENTION_DAYS,
    });
  });

  it("honors CONTACT_MESSAGE_RETENTION_DAYS and CONTACT_MESSAGE_RETENTION_DAYS_UNREAD when set", () => {
    process.env.CONTACT_MESSAGE_RETENTION_DAYS = "90";
    process.env.CONTACT_MESSAGE_RETENTION_DAYS_UNREAD = "7";

    expect(getContactMessageRetentionConfig()).toEqual({ readDays: 90, unreadDays: 7 });
  });
});

describe("purgeExpiredContactMessages", () => {
  it("never deletes a message on retention hold, using `not: true` (not `equals: false`)", async () => {
    await purgeExpiredContactMessages();

    const where = deleteManyMock.mock.calls[0][0].where;
    expect(where.retentionHold).toEqual({ not: true });
  });

  it("targets read messages older than readDays and unread messages older than unreadDays", async () => {
    await purgeExpiredContactMessages();

    const where = deleteManyMock.mock.calls[0][0].where;
    const readCutoff = new Date("2025-12-03T00:00:00.000Z"); // 180 days before mocked "now"
    const unreadCutoff = new Date("2026-05-02T00:00:00.000Z"); // 30 days before mocked "now"

    expect(where.OR).toEqual([
      { read: true, createdAt: { lt: readCutoff } },
      { read: false, createdAt: { lt: unreadCutoff } },
    ]);
  });

  it("returns the deleted count and the config/cutoffs used", async () => {
    deleteManyMock.mockResolvedValueOnce({ count: 5 });

    const result = await purgeExpiredContactMessages();

    expect(result.deletedCount).toBe(5);
    expect(result.readDays).toBe(DEFAULT_READ_RETENTION_DAYS);
    expect(result.unreadDays).toBe(DEFAULT_UNREAD_RETENTION_DAYS);
    expect(result.readCutoff).toBeInstanceOf(Date);
    expect(result.unreadCutoff).toBeInstanceOf(Date);
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const sendMock = vi.fn();

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(function (this: { emails: { send: (...args: unknown[]) => unknown } }) {
    this.emails = { send: (...args: unknown[]) => sendMock(...args) };
  }),
}));

const ORIGINAL_ENV = { ...process.env };

async function importFresh() {
  vi.resetModules();
  return import("@/lib/email/send-verification-email");
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env = { ...ORIGINAL_ENV };
  delete process.env.RESEND_API_KEY;
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("sendVerificationEmail — RESEND_API_KEY not configured", () => {
  it("logs the verification link in development (not production)", async () => {
    process.env.NODE_ENV = "development";
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { sendVerificationEmail } = await importFresh();

    await sendVerificationEmail("maria@example.com", "secret-token-123");

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("secret-token-123"));
    expect(errorSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it("never logs the token/link in production, only a misconfiguration error", async () => {
    process.env.NODE_ENV = "production";
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { sendVerificationEmail } = await importFresh();

    expect(await sendVerificationEmail("maria@example.com", "super-secret-token-456")).toBe(false);

    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledTimes(1);
    const loggedMessage = errorSpy.mock.calls[0][0] as string;
    expect(loggedMessage).not.toContain("super-secret-token-456");
    expect(loggedMessage).toContain("maria@example.com");
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });
});

describe("sendVerificationEmail — RESEND_API_KEY configured", () => {
  it("sends via Resend and never logs the token in production either", async () => {
    process.env.NODE_ENV = "production";
    process.env.RESEND_API_KEY = "re_test_key";
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    sendMock.mockResolvedValueOnce({});
    const { sendVerificationEmail } = await importFresh();

    expect(await sendVerificationEmail("maria@example.com", "token-xyz")).toBe(true);

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({ to: "maria@example.com" })
    );
    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("logs and returns false when Resend reports an API error, without logging the token", async () => {
    process.env.NODE_ENV = "production";
    process.env.RESEND_API_KEY = "re_test_key";
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    sendMock.mockResolvedValueOnce({
      data: null,
      error: { name: "validation_error", message: "Domain not verified" },
    });
    const { sendVerificationEmail } = await importFresh();

    expect(await sendVerificationEmail("maria@example.com", "token-xyz")).toBe(false);

    expect(errorSpy).toHaveBeenCalledTimes(1);
    const logged = errorSpy.mock.calls[0].map(String).join(" ");
    expect(logged).toContain("maria@example.com");
    expect(logged).toContain("Domain not verified");
    expect(logged).not.toContain("token-xyz");
    errorSpy.mockRestore();
  });

  it("logs and returns false when the send rejects", async () => {
    process.env.NODE_ENV = "production";
    process.env.RESEND_API_KEY = "re_test_key";
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    sendMock.mockRejectedValueOnce(new Error("network down"));
    const { sendVerificationEmail } = await importFresh();

    expect(await sendVerificationEmail("maria@example.com", "token-xyz")).toBe(false);

    expect(errorSpy).toHaveBeenCalledTimes(1);
    errorSpy.mockRestore();
  });
});

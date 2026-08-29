import { describe, it, expect } from "vitest";
import { signupSchema } from "@/lib/validations/auth";

function baseInput(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    name: "Maria Silva",
    email: "maria@example.com",
    password: "senha123",
    ...overrides,
  };
}

describe("signupSchema", () => {
  it("accepts a valid signup payload", () => {
    const result = signupSchema.safeParse(baseInput());
    expect(result.success).toBe(true);
  });

  it("trims and lowercases the email", () => {
    const result = signupSchema.safeParse(
      baseInput({ email: "  Maria@Example.COM  " })
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("maria@example.com");
    }
  });

  it("trims the name", () => {
    const result = signupSchema.safeParse(baseInput({ name: "  Maria  " }));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Maria");
    }
  });

  describe("name", () => {
    it("rejects a name shorter than 2 characters", () => {
      const result = signupSchema.safeParse(baseInput({ name: "A" }));
      expect(result.success).toBe(false);
    });

    it("rejects a name longer than 100 characters", () => {
      const result = signupSchema.safeParse(
        baseInput({ name: "A".repeat(101) })
      );
      expect(result.success).toBe(false);
    });
  });

  describe("email", () => {
    it("rejects an empty email", () => {
      const result = signupSchema.safeParse(baseInput({ email: "" }));
      expect(result.success).toBe(false);
    });

    it("rejects a malformed email", () => {
      const result = signupSchema.safeParse(baseInput({ email: "not-an-email" }));
      expect(result.success).toBe(false);
    });

    it("rejects an email longer than 254 characters", () => {
      const longEmail = `${"a".repeat(246)}@example.com`; // > 254 chars total
      const result = signupSchema.safeParse(baseInput({ email: longEmail }));
      expect(result.success).toBe(false);
    });
  });

  describe("password", () => {
    it("rejects a password shorter than 8 characters", () => {
      const result = signupSchema.safeParse(baseInput({ password: "abc123" }));
      expect(result.success).toBe(false);
    });

    it("rejects a password longer than 72 characters", () => {
      const result = signupSchema.safeParse(
        baseInput({ password: "a1".repeat(40) })
      );
      expect(result.success).toBe(false);
    });

    it("rejects a password with no letters", () => {
      const result = signupSchema.safeParse(baseInput({ password: "12345678" }));
      expect(result.success).toBe(false);
    });

    it("rejects a password with no numbers", () => {
      const result = signupSchema.safeParse(
        baseInput({ password: "abcdefgh" })
      );
      expect(result.success).toBe(false);
    });

    it("accepts a password with letters and numbers mixed", () => {
      const result = signupSchema.safeParse(
        baseInput({ password: "Senha#2026Forte" })
      );
      expect(result.success).toBe(true);
    });
  });

  describe("website honeypot field", () => {
    it("accepts a payload with the honeypot omitted", () => {
      const result = signupSchema.safeParse(baseInput());
      expect(result.success).toBe(true);
    });

    it("accepts an empty-string honeypot", () => {
      const result = signupSchema.safeParse(baseInput({ website: "" }));
      expect(result.success).toBe(true);
    });

    it("rejects a filled-in honeypot (bot submission)", () => {
      const result = signupSchema.safeParse(
        baseInput({ website: "http://spam.example" })
      );
      expect(result.success).toBe(false);
    });
  });
});

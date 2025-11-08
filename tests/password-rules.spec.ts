// tests/validatePassword.test.ts
import { describe, it, expect } from "vitest";
import { validatePassword } from "../src/composables/usePasswordRules";

// Shared password policy used in all tests
const policy = {
  minLength: 12,
  requireUpper: true,
  requireLower: true,
  requireDigit: true,
  requireSymbol: true,
};

describe("validatePassword", () => {
  // Should fail if password is too short or missing categories
  it("rejects too short and missing categories", () => {
    const r = validatePassword("Aa1!", "old", policy);
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.includes("least 12"))).toBe(true);
  });

  // Should fail if new password matches the old one
  it("rejects if equal to old", () => {
    const r = validatePassword("SamePass123!", "SamePass123!", policy);
    expect(r.valid).toBe(false);
  });

  // Should pass if password is strong and different from old
  it("accepts strong, different password", () => {
    const r = validatePassword("NewStrong123!X", "OldStrong123!Y", policy);
    expect(r.valid).toBe(true);
  });
});

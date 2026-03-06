import { describe, expect, test } from "vitest";
import { hashPin } from "@/lib/pin/pinService";

describe("pinService", () => {
  test("hashPin is deterministic for same input", () => {
    const first = hashPin("123456");
    const second = hashPin("123456");
    expect(first).toBe(second);
  });

  test("hashPin returns a SHA-256 hex digest", () => {
    const digest = hashPin("654321");
    expect(digest).toMatch(/^[a-f0-9]{64}$/);
  });
});

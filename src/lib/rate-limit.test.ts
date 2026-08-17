import { describe, expect, it } from "vitest";
import { rateLimit } from "./rate-limit";

describe("rateLimit", () => {
  it("limits requests independently per key", () => {
    const first = rateLimit("test-a", 1, 60_000);
    const second = rateLimit("test-a", 1, 60_000);
    const other = rateLimit("test-b", 1, 60_000);
    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(false);
    expect(other.allowed).toBe(true);
  });
});

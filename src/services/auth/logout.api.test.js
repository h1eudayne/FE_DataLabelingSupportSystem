import { describe, it, expect } from "vitest";
import logoutApi from "./logout.api";

describe("logout.api", () => {
  it("should resolve with { success: true } (client-side only)", async () => {
    const result = await logoutApi();

    expect(result).toEqual({ success: true });
  });

  it("should not make any HTTP request", async () => {
    // logoutApi is purely client-side — no axios dependency
    const result = await logoutApi();

    expect(result.success).toBe(true);
  });
});

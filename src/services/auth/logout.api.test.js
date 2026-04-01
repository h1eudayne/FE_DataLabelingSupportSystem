import { beforeEach, describe, expect, it, vi } from "vitest";
import axios from "../axios.customize";
import logoutApi from "./logout.api";

vi.mock("../axios.customize", () => ({
  default: {
    post: vi.fn(),
  },
}));

describe("logout.api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call the backend logout endpoint", async () => {
    vi.mocked(axios.post).mockResolvedValue({
      data: { message: "Logout successful. All tokens have been invalidated." },
    });

    const result = await logoutApi();

    expect(axios.post).toHaveBeenCalledWith("/api/auth/logout");
    expect(result.data.message).toBe(
      "Logout successful. All tokens have been invalidated.",
    );
  });
});

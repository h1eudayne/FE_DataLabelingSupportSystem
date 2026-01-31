import { describe, it, expect, vi } from "vitest";
import axios from "../../axios.customize";
import { userService } from "./userService";

vi.mock("../../axios.customize", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("userService", () => {
  it("getUsers: nên gọi đúng API /api/User", async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    await userService.getUsers();
    expect(axios.get).toHaveBeenCalledWith("/api/User");
  });
});

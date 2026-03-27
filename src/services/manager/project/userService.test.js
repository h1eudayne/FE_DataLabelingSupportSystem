import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "../../axios.customize";
import { userService } from "./userService";

vi.mock("../../axios.customize", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("userService", () => {
  it("getUsers: should call /api/users", async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    await userService.getUsers();
    expect(axios.get).toHaveBeenCalledWith("/api/users/managed");
  });
});

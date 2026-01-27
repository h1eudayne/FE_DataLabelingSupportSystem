import { describe, it, expect, vi } from "vitest";
import loginApi from "./login.api";
import axios from "../../axios.customize";

/* MOCK axios */
vi.mock("../../axios.customize", () => ({
  default: {
    post: vi.fn(),
  },
}));

describe("loginApi", () => {
  it("call POST /api/Auth/login with email & password", async () => {
    axios.post.mockResolvedValue({
      data: { token: "fake-token" },
    });

    const email = "test@gmail.com";
    const password = "123456";

    const res = await loginApi(email, password);

    expect(axios.post).toHaveBeenCalledWith("/api/Auth/login", {
      email,
      password,
    });

    expect(res.data.token).toBe("fake-token");
  });
});

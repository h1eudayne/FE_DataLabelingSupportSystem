import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider, useDispatch, useSelector } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import AuthLoginForm from "./AuthLoginForm";

vi.mock("react-redux", async () => {
  const actual = await vi.importActual("react-redux");
  return {
    ...actual,
    useDispatch: vi.fn(),
    useSelector: vi.fn(),
  };
});

vi.mock("@/store/auth/auth.thunk", () => ({
  loginThunk: vi.fn((payload) => ({
    type: "auth/login/fulfilled",
    payload,
  })),
}));

describe("AuthLoginForm - Comprehensive Test", () => {
  const dispatchMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDispatch).mockReturnValue(dispatchMock);

    vi.mocked(useSelector).mockReturnValue({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,
    });
  });

  const renderUI = () =>
    render(
      <Provider
        store={{
          getState: () => ({ auth: { loading: false } }),
          subscribe: () => {},
          dispatch: dispatchMock,
        }}
      >
        <BrowserRouter>
          <AuthLoginForm />
        </BrowserRouter>
      </Provider>,
    );

  it("nút Sign In và các input phải bị disabled khi đang loading", () => {
    vi.mocked(useSelector).mockReturnValue({
      isAuthenticated: false,
      user: null,
      loading: true,
      error: null,
    });

    renderUI();

    const loadingBtn = screen.getByRole("button", {
      name: /logging in\.\.\./i,
    });
    expect(loadingBtn).toBeDisabled();

    expect(screen.getByLabelText(/Email \/ Username/i)).toBeDisabled();
    expect(screen.getByPlaceholderText(/Enter password/i)).toBeDisabled();
  });

  it("hiển thị chính xác thông báo lỗi từ API (xử lý cả trường hợp object có title)", () => {
    vi.mocked(useSelector).mockReturnValue({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: { title: "Invalid email or password" },
    });

    renderUI();
    expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument();
  });

  it("thay đổi kiểu input từ password sang text khi click icon mắt", async () => {
    const user = userEvent.setup();
    renderUI();

    const passwordInput = screen.getByPlaceholderText(/Enter password/i);
    const toggleBtn = screen.getByLabelText(/toggle password visibility/i);

    expect(passwordInput).toHaveAttribute("type", "password");

    await user.click(toggleBtn);
    expect(passwordInput).toHaveAttribute("type", "text");

    await user.click(toggleBtn);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("gửi thông tin đăng nhập đúng đến loginThunk khi nhấn Sign In", async () => {
    const user = userEvent.setup();
    renderUI();

    const emailInput = screen.getByLabelText(/Email \/ Username/i);
    const passwordInput = screen.getByPlaceholderText(/Enter password/i);
    const submitBtn = screen.getByRole("button", { name: /sign in/i });

    await user.type(emailInput, "admin@gmail.com");
    await user.type(passwordInput, "Password123");
    await user.click(submitBtn);

    expect(dispatchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: { email: "admin@gmail.com", password: "Password123" },
      }),
    );
  });

  it("không hiển thị form nếu người dùng đã đăng nhập thành công", () => {
    vi.mocked(useSelector).mockReturnValue({
      isAuthenticated: true,
      user: { role: "Admin", email: "admin@test.com" },
      loading: false,
      error: null,
    });

    const { container } = renderUI();
    expect(container.firstChild).toBeNull();
  });

  it("các input email và password phải có thuộc tính required", () => {
    renderUI();
    expect(screen.getByLabelText(/Email \/ Username/i)).toBeRequired();
    expect(screen.getByPlaceholderText(/Enter password/i)).toBeRequired();
  });
});

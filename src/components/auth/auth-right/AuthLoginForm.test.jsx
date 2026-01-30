import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import AuthLoginForm from "./AuthLoginForm";
import "@testing-library/jest-dom";

vi.mock("react-redux", async () => {
  const actual = await vi.importActual("react-redux");
  return { ...actual, useDispatch: vi.fn(), useSelector: vi.fn() };
});

describe("AuthLoginForm - Đồng bộ UI", () => {
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
          dispatch: () => {},
        }}
      >
        <BrowserRouter>
          <AuthLoginForm />
        </BrowserRouter>
      </Provider>,
    );

  it("nên cho phép nhập tài khoản và mật khẩu", () => {
    renderUI();
    const emailInput = screen.getByPlaceholderText(/Nhập tài khoản/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);

    fireEvent.change(emailInput, { target: { value: "admin@test.com" } });
    expect(emailInput.value).toBe("admin@test.com");
  });

  it("nên chuyển đổi hiển thị mật khẩu khi nhấn nút toggle", () => {
    renderUI();
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    const toggleBtn = screen.getByLabelText(/toggle password visibility/i);

    expect(passwordInput).toHaveAttribute("type", "password");
    fireEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute("type", "text");
  });
});

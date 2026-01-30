import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import LoginPage from "./LoginPage";
import "@testing-library/jest-dom";

vi.mock("../../../components/auth/auth-left/AuthLeft", () => ({
  default: () => <div data-testid="auth-left">AuthLeft</div>,
}));

const createMockStore = (preloadedState) => {
  return configureStore({
    reducer: {
      auth: (
        state = { user: null, token: null, loading: false, error: null },
        action,
      ) => {
        if (preloadedState.auth) return { ...state, ...preloadedState.auth };
        return state;
      },
      layout: (state = { layoutType: "vertical" }) => state,
    },
  });
};

describe("LoginPage - Layout & UI Integration", () => {
  const renderLogin = (preloadedState = {}) => {
    const store = createMockStore(preloadedState);
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </Provider>,
    );
  };

  it("nên render khung trang và card layout đúng class Bootstrap", () => {
    const { container } = renderLogin();
    expect(container.querySelector(".auth-page-wrapper")).toBeInTheDocument();
    expect(container.querySelector(".auth-card")).toBeInTheDocument();
  });

  it("nên cho phép nhập liệu thông tin đăng nhập", async () => {
    renderLogin();

    const emailInput = screen.getByPlaceholderText(/Nhập tài khoản|email/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••|password/i);

    fireEvent.change(emailInput, { target: { value: "admin@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "123456" } });

    expect(emailInput.value).toBe("admin@test.com");
    expect(passwordInput.value).toBe("123456");
  });

  it("nên chuyển đổi hiển thị mật khẩu khi nhấn icon eye", async () => {
    renderLogin();

    const passwordInput = screen.getByPlaceholderText(/••••••••|password/i);
    const toggleBtn = screen.getByLabelText(/toggle password visibility/i);

    expect(passwordInput.type).toBe("password");

    fireEvent.click(toggleBtn);
    expect(passwordInput.type).toBe("text");

    fireEvent.click(toggleBtn);
    expect(passwordInput.type).toBe("password");
  });
});

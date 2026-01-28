import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import LoginPage from "./LoginPage";
import "@testing-library/jest-dom";

const createMockStore = (preloadedState) => {
  return configureStore({
    reducer: {
      auth: (
        state = { user: null, token: null, loading: false, error: null },
      ) => state,
      layout: (state = { layoutType: "vertical" }) => state,
    },
    preloadedState,
  });
};

describe("LoginPage - Layout & UI Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
    expect(container.querySelector(".auth-page-content")).toBeInTheDocument();
  });

  it("nên hiển thị thông báo lỗi khi có error trong state", () => {
    const errorMessage = "Invalid email or password";
    renderLogin({ auth: { error: errorMessage, loading: false } });

    const errorEl = screen.getByText(errorMessage);
    expect(errorEl).toBeInTheDocument();
  });

  it("nên disable các trường input khi đang loading", () => {
    renderLogin({ auth: { loading: true } });

    const emailInput = screen.getByLabelText(/Email \/ Username|Email/i);
    const submitBtn = screen.getByRole("button", {
      name: /sign in|logging in/i,
    });

    expect(emailInput).toBeDisabled();
    expect(submitBtn).toBeDisabled();
  });

  it("nên cho phép nhập liệu vào form", () => {
    renderLogin();

    const emailInput = screen.getByPlaceholderText(
      /Enter email|Enter username/i,
    );
    const passwordInput = screen.getByPlaceholderText(/Enter password/i);

    fireEvent.change(emailInput, { target: { value: "admin@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "123456" } });

    expect(emailInput.value).toBe("admin@test.com");
    expect(passwordInput.value).toBe("123456");
  });

  it("nên chuyển đổi hiển thị mật khẩu khi nhấn icon eye", () => {
    renderLogin();

    const passwordInput = screen.getByPlaceholderText(/Enter password/i);
    const toggleBtn = screen.getByRole("button", {
      name: /toggle password visibility/i,
    });

    expect(passwordInput.type).toBe("password");

    fireEvent.click(toggleBtn);
    expect(passwordInput.type).toBe("text");

    fireEvent.click(toggleBtn);
    expect(passwordInput.type).toBe("password");
  });
});

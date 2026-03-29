import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import ForgotPasswordPage from "./ForgotPasswordPage";
import "@testing-library/jest-dom";
import { useTranslation } from "react-i18next";

vi.mock("../../components/auth/auth-left/AuthLeft", () => ({
  default: () => <div data-testid="auth-left">AuthLeft</div>,
}));

vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const createMockStore = (preloadedState = {}) => {
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

vi.mock("react-i18next", () => ({
  useTranslation: vi.fn(),
}));

const mockUseTranslation = (overrides = {}) => {
  const returnValues = {
    t: (key) => key,
    i18n: { language: "en" },
    ready: true,
    ...overrides,
  };
  useTranslation.mockReturnValue(returnValues);
  return returnValues;
};

describe("ForgotPasswordPage - Layout & UI Integration", () => {
  let mockStore;
  let tSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    mockStore = createMockStore();
    tSpy = mockUseTranslation();
  });

  const renderForgotPassword = () => {
    return render(
      <Provider store={mockStore}>
        <MemoryRouter>
          <ForgotPasswordPage />
        </MemoryRouter>
      </Provider>,
    );
  };

  it("nên render khung trang và card layout đúng class Bootstrap", () => {
    const { container } = renderForgotPassword();
    expect(container.querySelector(".auth-page-wrapper")).toBeInTheDocument();
    expect(container.querySelector(".auth-card")).toBeInTheDocument();
  });

  it("nên render form với input email và nút gửi", () => {
    renderForgotPassword();

    expect(screen.getByLabelText(/auth.email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /forgotPassword.resetButton/i })).toBeInTheDocument();
  });

  it("nên cho phép nhập email vào input", async () => {
    renderForgotPassword();

    const emailInput = screen.getByLabelText(/auth.email/i);
    expect(emailInput.value).toBe("");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    expect(emailInput.value).toBe("test@example.com");
  });

  it("nên hiển thị lỗi khi submit với email rỗng", async () => {
    renderForgotPassword();

    const submitButton = screen.getByRole("button", { name: /forgotPassword.resetButton/i });
    fireEvent.click(submitButton);

    expect(screen.getByText(/forgotPassword.emailRequired/i)).toBeInTheDocument();
  });

  it("nên hiển thị lỗi khi submit với email không hợp lệ", async () => {
    renderForgotPassword();

    const emailInput = screen.getByLabelText(/auth.email/i);
    fireEvent.change(emailInput, { target: { value: "invalid-email" } });

    const form = emailInput.closest("form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/forgotPassword.emailInvalid/i)).toBeInTheDocument();
    });
  });

  it("nên render link quay lại đăng nhập", () => {
    renderForgotPassword();

    expect(screen.getByText(/forgotPassword.rememberPassword/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /auth.signIn/i })).toBeInTheDocument();
  });

  it("nên render logo và tiêu đề trang", () => {
    renderForgotPassword();

    expect(screen.getByRole("img")).toBeInTheDocument();
    expect(screen.getByText(/forgotPassword.title/i)).toBeInTheDocument();
    expect(screen.getByText(/forgotPassword.subtitle/i)).toBeInTheDocument();
  });
});

describe("ForgotPasswordPage - API Integration", () => {
  let mockStore;
  let forgotPasswordApiMock;

  beforeEach(() => {
    vi.clearAllMocks();
    mockStore = createMockStore();
    mockUseTranslation();

    forgotPasswordApiMock = vi.fn();
    vi.doMock("../../services/auth/forgotPassword/forgotPassword.api", () => ({
      default: forgotPasswordApiMock,
    }));
  });

  it("nên gọi API khi submit với email hợp lệ", async () => {
    const { default: forgotPasswordApi } = await import(
      "../../services/auth/forgotPassword/forgotPassword.api"
    );
    forgotPasswordApi.mockResolvedValue({
      data: { message: "Password sent to your email" },
    });

    const { container } = render(
      <Provider store={mockStore}>
        <MemoryRouter>
          <ForgotPasswordPage />
        </MemoryRouter>
      </Provider>,
    );

    const emailInput = screen.getByLabelText(/auth.email/i);
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    const submitButton = screen.getByRole("button", { name: /forgotPassword.resetButton/i });
    fireEvent.click(submitButton);
  });
});

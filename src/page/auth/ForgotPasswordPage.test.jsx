import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import "@testing-library/jest-dom";
import { useTranslation } from "react-i18next";
import ForgotPasswordPage from "./ForgotPasswordPage";
import forgotPasswordApi from "../../services/auth/forgotPassword/forgotPassword.api";
import { toast } from "react-toastify";

vi.mock("../../components/auth/auth-left/AuthLeft", () => ({
  default: () => <div data-testid="auth-left">AuthLeft</div>,
}));

vi.mock("../../services/auth/forgotPassword/forgotPassword.api", () => ({
  default: vi.fn(),
}));

vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock("react-i18next", () => ({
  useTranslation: vi.fn(),
}));

const createMockStore = (preloadedState = {}) =>
  configureStore({
    reducer: {
      auth: (
        state = { user: null, token: null, loading: false, error: null },
      ) => ({ ...state, ...(preloadedState.auth || {}) }),
      layout: (state = { layoutType: "vertical" }) => state,
    },
  });

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

const renderForgotPassword = () =>
  render(
    <Provider store={createMockStore()}>
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    </Provider>,
  );

describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTranslation();
  });

  it("renders the forgot-password form", () => {
    const { container } = renderForgotPassword();

    expect(container.querySelector(".auth-page-wrapper")).toBeInTheDocument();
    expect(container.querySelector(".auth-card")).toBeInTheDocument();
    expect(screen.getByLabelText(/auth.email/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /forgotPassword.resetButton/i }),
    ).toBeInTheDocument();
  });

  it("shows validation error when email is empty", () => {
    renderForgotPassword();

    fireEvent.click(
      screen.getByRole("button", { name: /forgotPassword.resetButton/i }),
    );

    expect(
      screen.getByText(/forgotPassword.emailRequired/i),
    ).toBeInTheDocument();
  });

  it("submits a valid email to the API", async () => {
    forgotPasswordApi.mockResolvedValue({
      data: {
        message: "Request submitted.",
        emailDelivered: true,
        notificationDelivered: true,
      },
    });

    renderForgotPassword();

    fireEvent.change(screen.getByLabelText(/auth.email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /forgotPassword.resetButton/i }),
    );

    await waitFor(() => {
      expect(forgotPasswordApi).toHaveBeenCalledWith("test@example.com");
    });
    expect(toast.success).toHaveBeenCalledWith("Request submitted.");
  });

  it("shows a local mail-drop status when pickup-directory delivery is used", async () => {
    forgotPasswordApi.mockResolvedValue({
      data: {
        message:
          "Administrators have been notified. The email was written to the local mail-drop folder instead of a real inbox.",
        emailDelivered: true,
        notificationDelivered: true,
        emailDeliveryMode: "PickupDirectory",
        emailDeliveryTarget: "D:\\mail-drop",
      },
    });

    renderForgotPassword();

    fireEvent.change(screen.getByLabelText(/auth.email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /forgotPassword.resetButton/i }),
    );

    await waitFor(() => {
      expect(
        screen.getByText(/forgotPassword.emailRecordedLocally/i),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText(/forgotPassword.localMailNote/i),
    ).toBeInTheDocument();
    expect(screen.getByText("D:\\mail-drop")).toBeInTheDocument();
    expect(toast.info).toHaveBeenCalledWith(
      "Administrators have been notified. The email was written to the local mail-drop folder instead of a real inbox.",
    );
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "./LoginPage";
import { renderWithProviders } from "@/test/test-utils";

describe("LoginPage - Layout & UI Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Helper render để tránh lặp code MemoryRouter
  const renderLogin = (preloadedState = {}) => {
    return renderWithProviders(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
      { preloadedState },
    );
  };

  it("nên render khung trang và card layout đúng class Bootstrap", () => {
    const { container } = renderLogin();
    expect(container.querySelector(".auth-page-wrapper")).toBeInTheDocument();
    expect(container.querySelector(".card")).toHaveClass(
      "card-bg-fill",
      "border-0",
    );
  });

  it("nên hiển thị đầy đủ các phần cốt lõi: Left, Right và Footer", () => {
    renderLogin();
    // Kiểm tra text từ AuthRightHeader và AuthLeftQuotes
    expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Great things never come from comfort zones/i),
    ).toBeInTheDocument();
  });

  it("nên phản ứng đúng khi trạng thái auth đang loading", async () => {
    renderLogin({ auth: { loading: true } });

    // Kiểm tra button Sign In bị disabled khi loading = true
    const signInBtn = screen.getByRole("button", {
      name: /Logging in...|sign in/i,
    });
    expect(signInBtn).toBeDisabled();
    expect(screen.getByLabelText(/Email \/ Username/i)).toBeDisabled();
  });

  it("nên áp dụng các class responsive để tối ưu hiển thị", () => {
    const { container } = renderLogin();
    expect(container.querySelector(".col-lg-12")).toBeInTheDocument();
    expect(container.querySelector(".pt-lg-5")).toBeInTheDocument();
  });
  it("nên hiển thị thông báo lỗi khi API trả về lỗi", async () => {
    const errorMessage = "Invalid email or password";
    renderWithProviders(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
      {
        preloadedState: {
          auth: { error: errorMessage, loading: false },
        },
      },
    );

    // Kiểm tra thông báo lỗi có hiển thị trên UI không
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toHaveClass("alert-danger");
  });

  it("nên cho phép thay đổi giá trị input và submit form", async () => {
    renderLogin();

    const emailInput = screen.getByPlaceholderText(/Enter email/i);
    const passwordInput = screen.getByPlaceholderText(/Enter password/i);
    const submitBtn = screen.getByRole("button", { name: /Sign In/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(emailInput.value).toBe("test@example.com");
    expect(passwordInput.value).toBe("password123");

    // Kiểm tra nút không bị disable và có thể click
    expect(submitBtn).not.toBeDisabled();
    fireEvent.click(submitBtn);
  });

  it("nên chuyển đổi hiển thị mật khẩu khi nhấn icon eye", () => {
    renderWithProviders(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    const passwordInput = screen.getByPlaceholderText(/Enter password/i);
    const toggleBtn = screen.getByRole("button", {
      name: /toggle password visibility/i,
    });

    expect(passwordInput.type).toBe("password");

    // Click lần 1: Hiện mật khẩu
    fireEvent.click(toggleBtn);
    expect(passwordInput.type).toBe("text");

    // Click lần 2: Ẩn mật khẩu
    fireEvent.click(toggleBtn);
    expect(passwordInput.type).toBe("password");
  });
});

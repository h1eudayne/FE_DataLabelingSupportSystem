import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import App from "./App";
import "@testing-library/jest-dom";

// Thêm đoạn này vào phần mock ở đầu file App.test.jsx
// Thay đổi đường dẫn cho đúng với project của bạn (ví dụ: "@/services/axios.customize")
vi.mock("@/services/axios.customize", () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: [] }),
    post: vi.fn().mockResolvedValue({ data: {} }),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));
vi.mock("react-apexcharts", () => ({
  default: () => <div data-testid="chart">Chart</div>,
}));
vi.mock("@vercel/speed-insights/react", () => ({ SpeedInsights: () => null }));
vi.mock("simplebar-react", () => ({
  default: ({ children }) => <div>{children}</div>,
}));

// Giả lập ResizeObserver vì JSDOM không hỗ trợ
beforeEach(() => {
  window.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
  window.scrollTo = vi.fn();
  vi.clearAllMocks();
  localStorage.clear(); // Đảm bảo trạng thái sạch trước mỗi test case
});

/**
 * Tạo Mock Store phù hợp với cấu trúc Redux của ứng dụng
 */
const createMockStore = (authData) => {
  return configureStore({
    reducer: {
      // Khớp với state dùng trong Header.jsx và MainLayouts
      layout: (state = { sidebarSize: "lg", layoutType: "vertical" }) => state,
      auth: (state = authData) => state,
    },
  });
};

describe("App Integration - Security & Roles", () => {
  // Tăng timeout vì App chứa nhiều component và route phức tạp
  vi.setConfig({ testTimeout: 15000 });

  it("nên hiển thị Landing Page khi truy cập lần đầu (chưa đăng nhập)", async () => {
    const store = createMockStore({
      user: null,
      token: null,
      isAuthenticated: false,
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/"]}>
          <App />
        </MemoryRouter>
      </Provider>,
    );

    // Kiểm tra Landing Page dựa trên logic: path="/" và !isLoggedIn
    // Tìm button hoặc text đặc trưng của Landing Page (thường có nút Đăng nhập/Bắt đầu)
    await waitFor(() => {
      const loginButtons = screen.getAllByText(/Đăng nhập/i);
      expect(loginButtons.length).toBeGreaterThan(0);
    });
  });

  // ... (các phần mock giữ nguyên)

  it("nên hiển thị trang Login khi người dùng chủ động vào /login", async () => {
    const store = createMockStore({
      user: null,
      isAuthenticated: false,
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/login"]}>
          <App />
        </MemoryRouter>
      </Provider>,
    );

    // THAY ĐỔI: Tìm chính xác BUTTON có chữ Đăng nhập để tránh trùng lặp với các text khác
    await waitFor(() => {
      const loginButton = screen.getByRole("button", { name: /Đăng nhập/i });
      expect(loginButton).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText(/Nhập tài khoản/i)).toBeInTheDocument();
  });

  it("nên hiển thị Header và Dashboard khi Admin đã đăng nhập", async () => {
    const adminUser = { role: "Admin", name: "Anna", email: "admin@test.com" };
    const store = createMockStore({
      user: adminUser,
      token: "admin-token",
      isAuthenticated: true,
    });

    // App.jsx kiểm tra token từ localStorage để xác định isLoggedIn
    localStorage.setItem("accessToken", "admin-token");

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/dashboard"]}>
          <App />
        </MemoryRouter>
      </Provider>,
    );

    // Kiểm tra tên Admin hiển thị trên Header
    await waitFor(
      () => {
        expect(screen.getByText(/Anna/i)).toBeInTheDocument();
      },
      { timeout: 8000 },
    );

    // Kiểm tra thanh tìm kiếm trong Header
    expect(screen.getByPlaceholderText(/Tìm kiếm\.\.\./i)).toBeInTheDocument();
  });

  it("nên tự động chuyển hướng về trang login/landing khi truy cập trang bảo mật mà chưa đăng nhập", async () => {
    const store = createMockStore({
      user: null,
      isAuthenticated: false,
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/projects-all-projects"]}>
          <App />
        </MemoryRouter>
      </Provider>,
    );

    // Chờ quá trình Redirect của React Router thực hiện
    const loginButton = await screen.findByRole("button", {
      name: /Đăng nhập/i,
    });
    expect(loginButton).toBeInTheDocument();
  });
});

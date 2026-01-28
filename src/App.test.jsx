import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import App from "./App";
import "@testing-library/jest-dom";

// 1. MOCKS
vi.mock("react-apexcharts", () => ({
  default: () => <div data-testid="chart">Chart</div>,
}));
vi.mock("@vercel/speed-insights/react", () => ({ SpeedInsights: () => null }));
vi.mock("simplebar-react", () => ({
  default: ({ children }) => <div>{children}</div>,
}));

beforeEach(() => {
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
  window.scrollTo = vi.fn();
});

const createMockStore = (authData) => {
  return configureStore({
    reducer: {
      layout: (state = { sidebarSize: "lg" }) => state,
      auth: (state = authData) => state,
    },
  });
};

describe("App Integration - Security & Roles", () => {
  // Tăng testTimeout cho toàn bộ block này
  vi.setConfig({ testTimeout: 10000 });

  it("nên hiển thị trang Login khi chưa đăng nhập", async () => {
    const store = createMockStore({
      user: null,
      token: null,
      isAuthenticated: false,
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/login"]}>
          <App />
        </MemoryRouter>
      </Provider>,
    );

    // Tìm theo Role heading thường chính xác hơn findByText đơn thuần
    const loginHeader = await screen.findByRole(
      "heading",
      { name: /Sign In/i },
      { timeout: 8000 },
    );
    expect(loginHeader).toBeInTheDocument();
  });

  it.skip("nên hiển thị Access Denied khi không đủ quyền", async () => {
    const fakeValidToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiQW5ub3RhdG9yIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

    const store = createMockStore({
      user: { role: "Annotator" },
      isAuthenticated: true,
      token: fakeValidToken,
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/settings-user-management"]}>
          <App />
        </MemoryRouter>
      </Provider>,
    );

    // Dòng này sẽ in mã HTML ra terminal khi chạy test.
    // Bạn hãy nhìn vào đó: Nếu thấy "Sign In" -> Bạn đang ở trang Login
    // Nếu thấy "Dashboard" -> Bạn đang ở trang chính (Logic phân quyền chưa chặn được)
    // screen.debug();

    // 2. Tìm số 404 linh hoạt hơn
    const code404 = await screen.findByText(
      (content, element) => {
        return element.textContent.includes("404");
      },
      {},
      { timeout: 8000 },
    );

    expect(code404).toBeInTheDocument();
    expect(screen.getByText(/Sorry, Page not Found/i)).toBeInTheDocument();
  });

  it("nên hiển thị Header khi Admin đăng nhập thành công", async () => {
    const store = createMockStore({
      user: { role: "Admin", name: "Anna" },
      token: "admin-token",
      isAuthenticated: true,
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/dashboard"]}>
          <App />
        </MemoryRouter>
      </Provider>,
    );

    // Đợi layout render xong
    await waitFor(
      () => {
        // Dùng document.body.textContent để quét toàn bộ, tránh lỗi thẻ span chia nhỏ text
        expect(document.body.textContent).toContain("Anna");
      },
      { timeout: 8000 },
    );

    expect(screen.getByText(/Tổng nhân sự/i)).toBeInTheDocument();
  });
});

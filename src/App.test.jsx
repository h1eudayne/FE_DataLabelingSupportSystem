import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import { renderWithProviders } from "@/test/test-utils";

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
vi.mock("react-apexcharts", () => ({ default: () => <div /> }));
vi.mock("@vercel/speed-insights/react", () => ({ SpeedInsights: () => null }));
vi.mock("simplebar-react", () => ({
  default: ({ children }) => <div>{children}</div>,
}));

describe("App Routing - Integration Test", () => {
  // Helper kiểm tra hiển thị trang lỗi (404 hoặc Access Denied)
  const verifyErrorPage = async (expectedTextRegex) => {
    await waitFor(
      () => {
        // Dựa trên debug: Tìm tiêu đề h3 hoặc h1 chứa thông tin lỗi
        const errorMsg = screen.queryByText(expectedTextRegex);
        expect(errorMsg).toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  };

  it("nên hiển thị trang LoginPage khi truy cập /login", async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={["/login"]}>
        <App />
      </MemoryRouter>,
    );
    expect(
      await screen.findByRole("button", { name: /sign in|login/i }),
    ).toBeInTheDocument();
  });

  it("nên chặn Admin page và hiển thị trang lỗi nếu không có quyền", async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={["/settings-user-management"]}>
        <App />
      </MemoryRouter>,
      {
        preloadedState: {
          auth: { isAuthenticated: true, user: { role: "Annotator" } },
        },
      },
    );
    // Thay đổi regex để khớp với nội dung thực tế trong HTML debug của bạn
    await verifyErrorPage(/page not found|access denied/i);
  });

  it("nên điều hướng về trang lỗi khi đường dẫn không tồn tại", async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={["/random-path-that-does-not-exist"]}>
        <App />
      </MemoryRouter>,
    );
    await verifyErrorPage(/page not found/i);
  });
  it("nên chuyển hướng Admin về trang Dashboard sau khi đăng nhập thành công", async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={["/login"]}>
        <App />
      </MemoryRouter>,
      {
        preloadedState: {
          auth: {
            isAuthenticated: true,
            user: { role: "Admin" },
            loading: false,
          },
        },
      },
    );

    // SỬA TẠI ĐÂY: Sử dụng findByRole để tìm chính xác tiêu đề trang
    // Hoặc dùng getAllByText và lấy phần tử đầu tiên
    await waitFor(
      async () => {
        const dashboardTitles =
          await screen.findAllByText(/Analytics Dashboard/i);
        expect(dashboardTitles[0]).toBeInTheDocument();
      },
      { timeout: 4000 },
    );
  });
});

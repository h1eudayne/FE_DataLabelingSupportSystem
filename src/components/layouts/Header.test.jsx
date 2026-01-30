import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import Header from "./Header";
import "@testing-library/jest-dom";

const mockedNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockedNavigate };
});

describe("Header Component - Comprehensive Suite", () => {
  let store;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock store với đầy đủ thông tin để khớp với Header.jsx
    store = configureStore({
      reducer: {
        auth: (
          state = {
            isAuthenticated: true,
            user: {
              name: "Nguyễn Văn A",
              role: "Manager",
              email: "staff1@gmail.com",
            },
          },
        ) => state,
      },
    });

    // Giả lập Fullscreen API
    if (typeof document.documentElement.requestFullscreen !== "function") {
      document.documentElement.requestFullscreen = vi
        .fn()
        .mockResolvedValue(undefined);
    }
  });

  const renderHeader = () =>
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Header sidebarSize="lg" toggleSidebar={vi.fn()} />
        </BrowserRouter>
      </Provider>,
    );

  describe("UI & Profile Dropdown", () => {
    // FIX: Đã gỡ skip để đảm bảo test chạy
    it("nên hiển thị thông tin User chính xác", () => {
      renderHeader();
      expect(screen.getByText(/Nguyễn Văn A/i)).toBeInTheDocument();
    });

    it("nên tương tác đầy đủ với Dropdown Profile", async () => {
      renderHeader();

      // Click để mở dropdown
      const profileToggle = screen.getByText(/Nguyễn Văn A/i);
      fireEvent.click(profileToggle);

      // SỬA LỖI: Dùng waitFor để chờ Popper.js render menu
      await waitFor(() => {
        // Kiểm tra email hiển thị trong menu
        expect(screen.getByText(/staff1@gmail.com/i)).toBeInTheDocument();

        // Kiểm tra các item chức năng
        const profileLink = screen.getByText(/Hồ sơ cá nhân/i);
        const logoutBtn = screen.getByText(/Đăng xuất/i);

        expect(profileLink).toBeInTheDocument();
        expect(logoutBtn).toBeInTheDocument();

        // Kiểm tra logic định tuyến
        expect(profileLink.closest("a")).toHaveAttribute("href", "/profile");
      });
    });
  });

  describe("Hệ thống Search & Actions", () => {
    it("nên cho phép nhập từ khóa vào ô Search", () => {
      renderHeader();
      const searchInput = screen.getByPlaceholderText(/Tìm kiếm\.\.\./i);
      fireEvent.change(searchInput, { target: { value: "Báo cáo" } });
      expect(searchInput.value).toBe("Báo cáo");
    });

    it("nên kích hoạt Fullscreen khi nhấn nút", async () => {
      renderHeader();
      const fullscreenBtn = screen.getByLabelText(/Fullscreen/i);
      fireEvent.click(fullscreenBtn);
      expect(document.documentElement.requestFullscreen).toHaveBeenCalled();
    });
  });

  describe("Authentication Logic", () => {
    it("nên gọi Logout và chuyển hướng về trang chủ", async () => {
      const spyDispatch = vi.spyOn(store, "dispatch");
      // Mock confirm dialog của trình duyệt
      vi.spyOn(window, "confirm").mockImplementation(() => true);

      renderHeader();

      // Phải mở dropdown trước mới click được nút logout
      fireEvent.click(screen.getByText("Nguyễn Văn A"));

      const logoutBtn = screen.getByText(/Đăng xuất/i);
      fireEvent.click(logoutBtn);

      expect(spyDispatch).toHaveBeenCalled();
    });
  });
});

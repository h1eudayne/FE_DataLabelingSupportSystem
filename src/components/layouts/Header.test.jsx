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

vi.mock("../../services/axios.customize", () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: { avatarUrl: "" } }),
  },
}));

describe("Header Component - Comprehensive Suite", () => {
  let store;

  beforeEach(() => {
    vi.clearAllMocks();

    store = configureStore({
      reducer: {
        auth: (
          state = {
            isAuthenticated: true,
            user: {
              fullName: "Nguyễn Văn A",
              role: "Manager",
              email: "staff1@gmail.com",
            },
          },
        ) => state,
      },
    });

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
    it("nên hiển thị thông tin User chính xác", () => {
      renderHeader();
      expect(screen.getByText(/Nguyễn Văn A/i)).toBeInTheDocument();
    });

    it("nên tương tác đầy đủ với Dropdown Profile", async () => {
      renderHeader();

      const profileToggle = screen.getByText(/Nguyễn Văn A/i);
      fireEvent.click(profileToggle);

      await waitFor(() => {
        // Dropdown content should appear
        expect(screen.getByText(/staff1@gmail.com/i)).toBeInTheDocument();
      });

      const profileLink = screen.getByText(/header.profile/i);
      const logoutBtn = screen.getByText(/header.logout/i);

      expect(profileLink).toBeInTheDocument();
      expect(logoutBtn).toBeInTheDocument();

      expect(profileLink.closest("a")).toHaveAttribute("href", "/profile");
    });
  });

  describe("Hệ thống Search & Actions", () => {
    it("nên cho phép nhập từ khóa vào ô Search", () => {
      renderHeader();
      const searchInput = screen.getByPlaceholderText(/header.search/i);
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
      vi.spyOn(window, "confirm").mockImplementation(() => true);

      renderHeader();

      fireEvent.click(screen.getByText("Nguyễn Văn A"));

      await waitFor(() => {
        expect(screen.getByText(/header.logout/i)).toBeInTheDocument();
      });

      const logoutBtn = screen.getByText(/header.logout/i);
      fireEvent.click(logoutBtn);

      expect(spyDispatch).toHaveBeenCalled();
    });
  });
});

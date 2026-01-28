import { render, screen, fireEvent, within } from "@testing-library/react";
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

    store = configureStore({
      reducer: {
        auth: (
          state = {
            isAuthenticated: true,
            user: { name: "Nguyễn Văn A", role: "Manager" },
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
    it.skip("nên hiển thị thông tin User chính xác", async () => {
      renderHeader();

      const userName = await screen.findByText(
        (content, element) => {
          return element.textContent.includes("Nguyễn Văn A");
        },
        {},
        { timeout: 8000 },
      );

      const userRole = await screen.findByText(
        (content, element) => {
          return element.textContent.includes("Manager");
        },
        {},
        { timeout: 8000 },
      );

      expect(userName).toBeInTheDocument();
      expect(userRole).toBeInTheDocument();
    });

    it("nên tương tác đầy đủ với Dropdown Profile", async () => {
      renderHeader();
      const toggle = document.querySelector("#page-header-user-dropdown");
      fireEvent.click(toggle);
      const menu = screen.getByTestId("user-profile-menu");
      const profileLink = within(menu)
        .getByText(/Profile/i)
        .closest("a");
      expect(profileLink).toHaveAttribute("href", "/profile");
    });
  });

  describe("Hệ thống Search & Actions", () => {
    it("nên cho phép nhập từ khóa vào ô Search", () => {
      renderHeader();
      const searchInput = screen.getByPlaceholderText(/Search\.\.\./i);
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
    it("nên gọi Logout và chuyển hướng về /login", async () => {
      const spyDispatch = vi.spyOn(store, "dispatch");
      renderHeader();

      const toggle = document.querySelector("#page-header-user-dropdown");
      fireEvent.click(toggle);

      const logoutBtn = screen.getByRole("button", { name: /logout/i });
      fireEvent.click(logoutBtn);

      expect(spyDispatch).toHaveBeenCalled();
      expect(mockedNavigate).toHaveBeenCalledWith("/login", { replace: true });
    });
  });
});

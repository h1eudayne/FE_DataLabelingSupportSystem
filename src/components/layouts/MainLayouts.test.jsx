import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import MainLayouts from "./MainLayouts";

const mockStore = configureStore([]);

describe("MainLayouts Component", () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      auth: {
        isAuthenticated: true,
        user: { name: "Nguyễn Văn A", role: "Admin" },
      },
      task: { currentTask: null },
    });

    document.body.removeAttribute("data-layout");
    document.body.removeAttribute("data-sidebar-size");
  });

  it("nên thiết lập các thuộc tính data-attributes lên thẻ body khi mount", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <MainLayouts />
        </BrowserRouter>
      </Provider>,
    );

    expect(document.body.getAttribute("data-layout")).toBe("vertical");
    expect(document.body.getAttribute("data-sidebar-size")).toBe("lg");
  });

  it("nên thay đổi kích thước sidebar khi người dùng nhấn nút toggle trong Header", async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <MainLayouts />
        </BrowserRouter>
      </Provider>,
    );

    const toggleBtn = document.getElementById("topnav-hamburger-icon");

    if (!toggleBtn) {
      screen.debug();
      throw new Error(
        "Không tìm thấy nút #topnav-hamburger-icon. Kiểm tra lại ID trong Header.jsx",
      );
    }

    fireEvent.click(toggleBtn);

    await waitFor(
      () => {
        expect(document.body.getAttribute("data-sidebar-size")).toBe(
          "sm-hover",
        );
      },
      { timeout: 2000 },
    );

    fireEvent.click(toggleBtn);

    await waitFor(() => {
      expect(document.body.getAttribute("data-sidebar-size")).toBe("lg");
    });
  });

  it("nên xóa class 'sidebar-enable' khi click vào lớp phủ (overlay)", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <MainLayouts />
        </BrowserRouter>
      </Provider>,
    );

    document.body.classList.add("sidebar-enable");

    const overlay = document.querySelector(".vertical-overlay");
    fireEvent.click(overlay);

    expect(document.body.classList.contains("sidebar-enable")).toBe(false);
  });
});

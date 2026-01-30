import { render, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import MainLayouts from "./MainLayouts";

const mockStore = configureStore([]);

describe("MainLayouts Tích hợp", () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      auth: { isAuthenticated: true, user: { name: "Admin" } },
    });
  });

  it("nên thay đổi data-sidebar-size khi nhấn toggle", async () => {
    const { container } = render(
      <Provider store={store}>
        <BrowserRouter>
          <MainLayouts />
        </BrowserRouter>
      </Provider>,
    );

    const toggleBtn = container.querySelector("#topnav-hamburger-icon");
    if (!toggleBtn)
      throw new Error("Cần thêm id='topnav-hamburger-icon' vào Header.jsx");

    fireEvent.click(toggleBtn);
    await waitFor(() => {
      expect(document.body.getAttribute("data-sidebar-size")).toBe("sm-hover");
    });
  });
});

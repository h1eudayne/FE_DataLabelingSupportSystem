import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import Navbar from "./Navbar";

const mockStore = configureStore([]);

describe("Navbar Component Integration Tests", () => {
  it("nên hiển thị đầy đủ menu Management và Settings nâng cao khi role là Admin", () => {
    const store = mockStore({
      auth: { user: { role: "Admin" } },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      </Provider>,
    );

    expect(screen.getByText(/Tổng dự án/i)).toBeInTheDocument();

    expect(screen.getByText(/Quản lý người dùng/i)).toBeInTheDocument();
    expect(screen.getByText(/Nhật ký hệ thống/i)).toBeInTheDocument();
  });

  it("chỉ hiển thị menu Workplace và không hiển thị User Management khi role là Annotator", () => {
    const store = mockStore({
      auth: { user: { role: "Annotator" } },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      </Provider>,
    );

    expect(screen.getByText(/Nhiệm vụ/i)).toBeInTheDocument();

    expect(screen.queryByText(/Quản lý người dùng/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Nhật ký hệ thống/i)).not.toBeInTheDocument();
  });

  it("nên hiển thị menu 'Review Task' khi role là Reviewer", () => {
    const store = mockStore({
      auth: { user: { role: "Reviewer" } },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      </Provider>,
    );

    expect(screen.getByText(/Nhiệm vụ/i)).toBeInTheDocument();
  });

  it("các thẻ Link phải trỏ đúng địa chỉ URL", () => {
    const store = mockStore({
      auth: { user: { role: "Admin" } },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      </Provider>,
    );

    const dashboardLink = screen.getAllByText(/Dashboard/i)[0].closest("a");
    expect(dashboardLink).toHaveAttribute("href", "/dashboard");

    const userMgmtLink = screen.getByText(/Quản lý người dùng/i).closest("a");
    expect(userMgmtLink).toHaveAttribute("href", "/settings-user-management");
  });
});

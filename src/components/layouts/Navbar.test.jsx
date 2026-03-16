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

    expect(screen.getByText("navbar.dashboard")).toBeInTheDocument();

    expect(screen.getByText("navbar.userManagement")).toBeInTheDocument();
    expect(screen.getByText("navbar.systemLogs")).toBeInTheDocument();
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

    expect(screen.getByText("navbar.myTask")).toBeInTheDocument();

    expect(screen.queryByText("navbar.exportData")).not.toBeInTheDocument();
    expect(screen.queryByText("navbar.userManagement")).not.toBeInTheDocument();
    expect(screen.queryByText("navbar.systemLogs")).not.toBeInTheDocument();
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

    expect(screen.getByText("navbar.myTask")).toBeInTheDocument();
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

    const dashboardLink = screen.getByText("navbar.dashboard").closest("a");
    expect(dashboardLink).toHaveAttribute("href", "/dashboard");

    const userMgmtLink = screen.getByText("navbar.userManagement").closest("a");
    expect(userMgmtLink).toHaveAttribute("href", "/settings-user-management");
  });
});

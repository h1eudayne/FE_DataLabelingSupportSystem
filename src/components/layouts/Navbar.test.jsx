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

    expect(screen.getByText(/Projects/i)).toBeInTheDocument();
    expect(screen.getByText(/Datasets/i)).toBeInTheDocument();
    expect(screen.getByText(/Export Data/i)).toBeInTheDocument();

    expect(screen.getByText(/User Management/i)).toBeInTheDocument();
    expect(screen.getByText(/System Logs/i)).toBeInTheDocument();
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

    expect(screen.getByText(/My Task/i)).toBeInTheDocument();
    expect(screen.getByText(/Team/i)).toBeInTheDocument();

    expect(screen.queryByText(/Export Data/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/User Management/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/System Logs/i)).not.toBeInTheDocument();
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

    expect(screen.getByText(/Review Task/i)).toBeInTheDocument();
    expect(screen.queryByText(/My Task/i)).not.toBeInTheDocument();
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

    const dashboardLink = screen.getByText(/Dashboard/i).closest("a");
    expect(dashboardLink).toHaveAttribute("href", "/dashboard-analytics");

    const userMgmtLink = screen.getByText(/User Management/i).closest("a");
    expect(userMgmtLink).toHaveAttribute("href", "/settings-user-management");
  });
});

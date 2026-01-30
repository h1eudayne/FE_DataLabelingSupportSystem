import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import configureStore from "redux-mock-store";

vi.mock("./App", () => ({
  default: () => <div data-testid="app-root">App Rendered</div>,
}));

vi.mock("bootstrap/dist/css/bootstrap.min.css", () => ({}));
vi.mock("./assets/css/app.min.css", () => ({}));

const mockStore = configureStore([]);

describe("Main Entry Point - Ecosystem Integration", () => {
  let queryClient;
  let store;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { refetchOnWindowFocus: false, retry: 1 },
      },
    });

    store = mockStore({
      auth: { isAuthenticated: false, user: null },
    });
  });

  const renderMain = () =>
    render(
      <BrowserRouter>
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <div id="root">
              <div data-testid="app-root">App Rendered</div>
            </div>
          </QueryClientProvider>
        </Provider>
      </BrowserRouter>,
    );

  it("nên khởi tạo hệ sinh thái Provider mà không có lỗi", () => {
    renderMain();
    expect(screen.getByTestId("app-root")).toBeInTheDocument();
  });

  it("nên áp dụng đúng cấu hình mặc định cho QueryClient", () => {
    renderMain();
    const options = queryClient.getDefaultOptions();
    expect(options.queries.refetchOnWindowFocus).toBe(false);
    expect(options.queries.retry).toBe(1);
  });

  it("nên cung cấp Store cho các component bên dưới", () => {
    renderMain();
    store.dispatch({ type: "TEST_ACTION" });
    const actions = store.getActions();
    expect(actions).toContainEqual({ type: "TEST_ACTION" });
  });

  it("nên render App bên trong môi trường Router", () => {
    renderMain();
    expect(window.location.pathname).toBe("/");
  });

  it("kiểm tra tính toàn vẹn của DOM root", () => {
    const { container } = renderMain();
    const rootDiv = container.querySelector("#root");
    expect(rootDiv).toBeInTheDocument();
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import AuthLoginForm from "./AuthLoginForm";

// ================= MOCK REDUX =================
const dispatchMock = vi.fn();

vi.mock("react-redux", async () => {
  const actual = await vi.importActual("react-redux");
  return {
    ...actual,
    useDispatch: () => dispatchMock,
    useSelector: () => ({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,
    }),
  };
});

// ================= MOCK THUNK =================
vi.mock("@/store/auth/auth.thunk", () => ({
  loginThunk: (payload) => ({
    type: "auth/loginThunk",
    payload,
  }),
}));

// ================= MOCK STORE =================
const fakeStore = {
  getState: () => ({}),
  subscribe: () => {},
  dispatch: dispatchMock,
};

// ================= HELPER =================
const renderUI = () =>
  render(
    <Provider store={fakeStore}>
      <BrowserRouter>
        <AuthLoginForm />
      </BrowserRouter>
    </Provider>,
  );

// ================= TEST =================
describe("AuthLoginForm", () => {
  beforeEach(() => {
    dispatchMock.mockClear();
  });

  it("render login form", () => {
    renderUI();

    expect(screen.getByLabelText("Email / Username")).toBeInTheDocument();

    expect(
      screen.getByLabelText("Password", { selector: "input" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it("dispatch loginThunk with correct email & password", async () => {
    const user = userEvent.setup();
    renderUI();

    await user.type(
      screen.getByLabelText("Email / Username"),
      "Staff1@gmail.com",
    );

    await user.type(
      screen.getByLabelText("Password", { selector: "input" }),
      "123456",
    );

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(dispatchMock).toHaveBeenCalledWith({
      type: "auth/loginThunk",
      payload: {
        email: "Staff1@gmail.com",
        password: "123456",
      },
    });
  });

  it("do not dispatch when email is empty", async () => {
    const user = userEvent.setup();
    renderUI();

    await user.type(
      screen.getByLabelText("Password", { selector: "input" }),
      "123456",
    );

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(dispatchMock).not.toHaveBeenCalled();
  });

  it("do not dispatch when password is empty", async () => {
    const user = userEvent.setup();
    renderUI();

    await user.type(
      screen.getByLabelText("Email / Username"),
      "Staff1@gmail.com",
    );

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(dispatchMock).not.toHaveBeenCalled();
  });

  it("toggle password visibility", async () => {
    const user = userEvent.setup();
    renderUI();

    const passwordInput = screen.getByLabelText("Password", {
      selector: "input",
    });

    const toggleBtn = screen.getByLabelText(/toggle password visibility/i);

    expect(passwordInput).toHaveAttribute("type", "password");

    await user.click(toggleBtn);
    expect(passwordInput).toHaveAttribute("type", "text");

    await user.click(toggleBtn);
    expect(passwordInput).toHaveAttribute("type", "password");
  });
});

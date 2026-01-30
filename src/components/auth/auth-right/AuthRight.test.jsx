import { test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import AuthRight from "./AuthRight";
import "@testing-library/jest-dom";

const store = configureStore({
  reducer: {
    auth: () => ({
      isAuthenticated: false,
      loading: false,
      user: null,
      error: null,
    }),
  },
});

test("render AuthRight layout và kiểm tra tiêu đề", () => {
  render(
    <Provider store={store}>
      <BrowserRouter>
        <AuthRight />
      </BrowserRouter>
    </Provider>,
  );

  // Kiểm tra text trực tiếp trong AuthRight.jsx
  expect(screen.getByText(/Chào mừng trở lại/i)).toBeInTheDocument();
  // Kiểm tra sự hiện diện của Form (nút Đăng nhập)
  expect(
    screen.getByRole("button", { name: /Đăng nhập/i }),
  ).toBeInTheDocument();
});

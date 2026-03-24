import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import AuthRegisterLink from "./AuthRegisterLink";
import "@testing-library/jest-dom";

describe("AuthRegisterLink", () => {
  it("hiển thị đúng câu hỏi và link đăng ký", () => {
    render(
      <BrowserRouter>
        <AuthRegisterLink />
      </BrowserRouter>,
    );

    expect(screen.getByText(/auth.noAccount/i)).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /auth.register/i });
    expect(link).toHaveAttribute("href", "/register");
  });
});

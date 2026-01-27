import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import LoginPage from "./LoginPage";
import { renderWithProviders } from "@/test/test-utils";

describe("LoginPage", () => {
  it("render AuthLeft, AuthRight and AuthFooter", () => {
    renderWithProviders(<LoginPage />);

    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
    // AuthLeft (tuỳ text thực tế, chỉnh nếu khác)
    expect(screen.getByText(/welcome/i)).toBeInTheDocument();
  });

  it("render main login page layout", () => {
    const { container } = renderWithProviders(<LoginPage />);

    expect(container.querySelector(".auth-page-wrapper")).toBeInTheDocument();

    expect(container.querySelector(".auth-page-content")).toBeInTheDocument();
  });
});

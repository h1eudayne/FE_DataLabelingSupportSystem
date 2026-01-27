import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AuthLeft from "./AuthLeft";

describe("AuthLeft", () => {
  it("render logo with link to home", () => {
    render(
      <MemoryRouter>
        <AuthLeft />
      </MemoryRouter>,
    );

    const logo = screen.getByAltText(/logo/i);
    expect(logo).toBeInTheDocument();

    const link = logo.closest("a");
    expect(link).toHaveAttribute("href", "/");
  });

  it("render quotes carousel", () => {
    render(
      <MemoryRouter>
        <AuthLeft />
      </MemoryRouter>,
    );

    expect(
      screen.getByText(/great things never come from comfort zones/i),
    ).toBeInTheDocument();
  });
});

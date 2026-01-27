import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AuthLeftQuotes from "./AuthLeftQuotes";

describe("AuthLeftQuotes", () => {
  it("render quotes icon", () => {
    render(<AuthLeftQuotes />);

    const icon = document.querySelector(".ri-double-quotes-l");
    expect(icon).toBeInTheDocument();
  });

  it("render at least one quote", () => {
    render(<AuthLeftQuotes />);

    expect(
      screen.getByText(/great things never come from comfort zones/i),
    ).toBeInTheDocument();
  });
});

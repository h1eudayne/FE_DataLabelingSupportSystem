import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import AuthRightHeader from "./AuthRightHeader";

describe("AuthRightHeader", () => {
  it("render header title correctly", () => {
    render(<AuthRightHeader />);

    // đổi text này đúng với nội dung thật trong component của bạn
    expect(screen.getByText(/welcome/i)).toBeInTheDocument();
  });

  it("render subtitle or description if exists", () => {
    render(<AuthRightHeader />);

    // nếu có subtitle
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
  });
});

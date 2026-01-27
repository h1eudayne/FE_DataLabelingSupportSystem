import { test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AuthRight from "./AuthRight";

vi.mock("./AuthRightHeader", () => ({
  default: () => <div data-testid="header" />,
}));
vi.mock("./AuthLoginForm", () => ({
  default: () => <div data-testid="form" />,
}));
vi.mock("./AuthRegisterLink", () => ({
  default: () => <div data-testid="register" />,
}));

test("render AuthRight layout", () => {
  render(<AuthRight />);
  expect(screen.getByTestId("header")).toBeInTheDocument();
});

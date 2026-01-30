import { render, screen } from "@testing-library/react";
import { it, expect } from "vitest";
import LandingFooter from "./LandingFooter";

it("LandingFooter hiển thị đúng thông tin bản quyền", () => {
  render(<LandingFooter />);
  expect(screen.getByText(/© 2024 AI LABEL SYSTEM/i)).toBeInTheDocument();
});

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import DashboardLayout from "./DashboardLayout";

describe("DashboardLayout Component", () => {
  it("nên hiển thị tiêu đề và nội dung con đúng cách", () => {
    const testTitle = "Trang Thống Kê";
    render(
      <DashboardLayout title={testTitle}>
        <div data-testid="child-content">Nội dung test</div>
      </DashboardLayout>,
    );

    expect(screen.getByText(testTitle)).toBeInTheDocument();
    expect(screen.getByTestId("child-content")).toHaveTextContent(
      "Nội dung test",
    );
    expect(screen.getByText(testTitle)).toHaveTextContent(
      testTitle,
    );
  });
});

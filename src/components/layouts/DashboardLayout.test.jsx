import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key) => key, i18n: { changeLanguage: vi.fn() } }) }));
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
    expect(screen.getByRole("heading", { level: 4 })).toHaveTextContent(
      testTitle,
    );
  });
});

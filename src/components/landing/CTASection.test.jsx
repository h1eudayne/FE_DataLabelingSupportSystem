import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import CTASection from "./CTASection";

describe("CTASection Component", () => {
  it("nên hiển thị lời kêu gọi bắt đầu", () => {
    render(<CTASection onExplore={() => {}} />);
    expect(screen.getByText(/Sẵn sàng để bắt đầu/i)).toBeInTheDocument();
  });

  it("nên gọi onExplore khi nhấn nút Dùng thử miễn phí", () => {
    const onExploreMock = vi.fn();
    render(<CTASection onExplore={onExploreMock} />);

    fireEvent.click(screen.getByText(/Dùng thử miễn phí/i));
    expect(onExploreMock).toHaveBeenCalled();
  });
});

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import HeroSection from "./HeroSection";

describe("HeroSection Component", () => {
  it("nên hiển thị tiêu đề chính và hình ảnh minh họa", () => {
    render(<HeroSection onExplore={() => {}} />);

    expect(screen.getByText(/landing.heroTitle1/i)).toBeInTheDocument();
    expect(screen.getByText(/Thông minh & Hiệu quả/i)).toBeInTheDocument();
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("nên gọi hàm onExplore khi nhấn vào các nút hành động", () => {
    const onExploreMock = vi.fn();
    render(<HeroSection onExplore={onExploreMock} />);

    const exploreBtn = screen.getByText(/Khám phá Dashboard/i);
    const startBtn = screen.getByText(/landing.getStarted/i);

    fireEvent.click(exploreBtn);
    fireEvent.click(startBtn);

    expect(onExploreMock).toHaveBeenCalledTimes(2);
  });
});

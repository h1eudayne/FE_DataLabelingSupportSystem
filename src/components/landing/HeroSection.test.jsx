import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import HeroSection from "./HeroSection";

describe("HeroSection Component", () => {
  it("nên hiển thị tiêu đề chính và hình ảnh minh họa", () => {
    render(<HeroSection onExplore={() => {}} />);

    expect(screen.getByText(/landingHero.title1/i)).toBeInTheDocument();
    expect(screen.getByText(/landingHero.title2/i)).toBeInTheDocument();
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("nên gọi hàm onExplore khi nhấn vào các nút hành động", () => {
    const onExploreMock = vi.fn();
    render(<HeroSection onExplore={onExploreMock} />);

    const exploreBtn = screen.getByText(/landingHero.exploreDashboard/i);
    const startBtn = screen.getByText(/landingHero.getStartedNow/i);

    fireEvent.click(exploreBtn);
    fireEvent.click(startBtn);

    expect(onExploreMock).toHaveBeenCalledTimes(2);
  });
});

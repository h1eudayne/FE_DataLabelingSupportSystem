import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AuthLeftQuotes from "./AuthLeftQuotes";
import "@testing-library/jest-dom";
import { act } from "react";

describe("AuthLeftQuotes", () => {
  it("render ít nhất một quote mặc định", () => {
    render(<AuthLeftQuotes />);
    // Khớp với text thực tế trong component
    expect(
      screen.getByText(/Great things never come from comfort zones/i),
    ).toBeInTheDocument();
  });

  it("chuyển sang quote tiếp theo sau một khoảng thời gian", async () => {
    vi.useFakeTimers();
    render(<AuthLeftQuotes />);

    // Phải bọc việc tiến thời gian vào act vì nó làm thay đổi giao diện (Carousel slide)
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    vi.useRealTimers();
  });

  it("nên hiển thị tên tác giả thực tế", () => {
    render(<AuthLeftQuotes />);
    // Tìm tác giả "Admin" thay vì "founder"
    const author = screen.getByText(/— Admin/i);
    expect(author).toBeInTheDocument();
  });
});

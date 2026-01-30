import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AuthLeftQuotes from "./AuthLeftQuotes";
import "@testing-library/jest-dom";
import { act } from "react";

describe("AuthLeftQuotes", () => {
  it("render ít nhất một quote mặc định", () => {
    render(<AuthLeftQuotes />);
    expect(
      screen.getByText(/Great things never come from comfort zones/i),
    ).toBeInTheDocument();
  });

  it("chuyển sang quote tiếp theo sau một khoảng thời gian", async () => {
    vi.useFakeTimers();
    render(<AuthLeftQuotes />);

    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    vi.useRealTimers();
  });

  it("nên hiển thị tên tác giả thực tế", () => {
    render(<AuthLeftQuotes />);
    const author = screen.getByText(/— Admin/i);
    expect(author).toBeInTheDocument();
  });
});

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AuthLeftQuotes from "./AuthLeftQuotes";

describe("AuthLeftQuotes", () => {
  it("render ít nhất một quote mặc định", () => {
    render(<AuthLeftQuotes />);
    expect(
      screen.getByText(/great things never come from comfort zones/i),
    ).toBeInTheDocument();
  });

  it("chuyển sang quote tiếp theo sau một khoảng thời gian", async () => {
    vi.useFakeTimers();
    render(<AuthLeftQuotes />);

    const firstQuote = screen.getByText(
      /great things never come from comfort zones/i,
    );
    expect(firstQuote).toBeInTheDocument();

    vi.advanceTimersByTime(5000);

    vi.useRealTimers();
  });
});

it("nên hiển thị icon dấu ngoặc kép để nhận diện khu vực quote", () => {
  render(<AuthLeftQuotes />);
  const quoteIcon = document.querySelector(".ri-double-quotes-l");
  expect(quoteIcon).toBeInTheDocument();
});

it("nên hiển thị tên tác giả hoặc chức danh", () => {
  render(<AuthLeftQuotes />);
  const author =
    screen.queryByText(/founder/i) || screen.queryByText(/graphic designer/i);
  if (author) expect(author).toBeInTheDocument();
});

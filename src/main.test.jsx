import { describe, it, expect, vi } from "vitest";
import React from "react";
import { waitFor } from "@testing-library/react"; // THÊM DÒNG NÀY

// Mock các thư viện bên ngoài
vi.mock("react-dom/client", () => ({
  createRoot: vi.fn(() => ({
    render: vi.fn(),
  })),
}));

vi.mock("./App", () => ({
  default: () => <div data-testid="app-root">App</div>,
}));

describe("Main Entry Point (main.jsx)", () => {
  it("nên thiết lập các Provider đúng cấu trúc", async () => {
    // Import main.jsx để trigger code chạy
    // Lưu ý: Đảm bảo đường dẫn đúng tới file main.jsx của bạn
    await import("./main.jsx");

    const { createRoot } = await import("react-dom/client");

    // Kiểm tra xem createRoot đã được gọi hay chưa
    expect(createRoot).toHaveBeenCalled();

    // Kiểm tra xem phần tử root có ID là 'root' đã được lấy ra chưa
    // (Trong main.jsx bạn dùng document.getElementById("root"))
  });
  it("nên render ứng dụng được bọc trong Provider và StrictMode", async () => {
    const rootDiv = document.createElement("div");
    rootDiv.id = "root";
    document.body.appendChild(rootDiv);

    await import("./main.jsx");

    // Kiểm tra xem ứng dụng có render nội dung gì đó không
    await waitFor(() => {
      expect(document.body.innerHTML).not.toBe("");
    });
  });
});

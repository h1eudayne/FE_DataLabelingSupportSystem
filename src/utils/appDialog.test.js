import { describe, it, expect, vi, beforeEach } from "vitest";

const fireMock = vi.fn();
const isLoadingMock = vi.fn(() => false);

vi.mock("sweetalert2", () => ({
  default: {
    fire: fireMock,
    isLoading: isLoadingMock,
  },
}));

describe("appDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.setAttribute("data-bs-theme", "dark");
  });

  it("builds themed confirm dialog options with custom variant classes", async () => {
    const { showConfirmDialog } = await import("./appDialog");

    await showConfirmDialog({
      title: "Confirm block",
      text: "Send request to manager?",
      icon: "warning",
      variant: "warning",
      confirmText: "Send",
      cancelText: "Cancel",
    });

    expect(fireMock).toHaveBeenCalledTimes(1);
    const options = fireMock.mock.calls[0][0];
    expect(options.title).toBe("Confirm block");
    expect(options.text).toBe("Send request to manager?");
    expect(options.showCancelButton).toBe(true);
    expect(options.confirmButtonText).toBe("Send");
    expect(options.cancelButtonText).toBe("Cancel");
    expect(options.customClass.popup).toContain("app-swal-popup--warning");
    expect(options.customClass.popup).toContain("app-swal-theme--dark");
    expect(options.customClass.confirmButton).toBe(
      "app-swal-confirm app-swal-confirm--warning",
    );
    expect(options.allowOutsideClick()).toBe(true);
  });

  it("normalizes error icon to danger styling for status dialog", async () => {
    const { showStatusDialog } = await import("./appDialog");

    await showStatusDialog({
      title: "SMTP failed",
      text: "Mail delivery failed.",
      icon: "error",
    });

    const options = fireMock.mock.calls[0][0];
    expect(options.showCancelButton).toBe(false);
    expect(options.customClass.popup).toContain("app-swal-popup--danger");
    expect(options.confirmButtonText).toBe("Close");
  });
});

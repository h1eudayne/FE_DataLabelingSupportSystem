import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import AppToastHost from "./AppToastHost";

const {
  toastContainerSpy,
  cssTransitionSpy,
  toastApi,
  toastMethodSpies,
  locationState,
} =
  vi.hoisted(() => {
    const methodSpies = {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
    };

    return {
      toastContainerSpy: vi.fn(),
      cssTransitionSpy: vi.fn(() => "app-toast-transition"),
      toastApi: {
        ...methodSpies,
        dismiss: vi.fn(),
        clearWaitingQueue: vi.fn(),
        isActive: vi.fn(() => false),
      },
      toastMethodSpies: methodSpies,
      locationState: {
        pathname: "/dashboard",
      },
    };
  });

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useLocation: () => locationState,
  };
});

vi.mock("react-toastify", () => ({
  cssTransition: (options) => cssTransitionSpy(options),
  ToastContainer: (props) => {
    toastContainerSpy(props);
    return <div data-testid="toast-host-stub" />;
  },
  toast: toastApi,
}));

describe("AppToastHost", () => {
  beforeEach(() => {
    toastContainerSpy.mockClear();
    toastApi.dismiss.mockClear();
    toastApi.clearWaitingQueue.mockClear();
    toastApi.isActive.mockClear();
    Object.values(toastMethodSpies).forEach((spy) => spy.mockClear());
    locationState.pathname = "/dashboard";
  });

  it("wires themed toast container with smooth defaults and auto-dismiss behavior", () => {
    const { rerender } = render(<AppToastHost />);

    expect(screen.getByTestId("toast-host-stub")).toBeInTheDocument();
    expect(toastContainerSpy).toHaveBeenCalledTimes(1);

    const props = toastContainerSpy.mock.calls[0][0];
    expect(props.position).toBe("top-right");
    expect(props.autoClose).toBe(3200);
    expect(props.limit).toBe(4);
    expect(props.theme).toBe("light");
    expect(props.pauseOnHover).toBe(false);
    expect(props.pauseOnFocusLoss).toBe(false);
    expect(props.draggable).toBe(false);
    expect(props.transition).toBe("app-toast-transition");
    expect(props.toastStyle).toEqual({ width: "100%" });
    expect(props.toastClassName({ type: "success" })).toBe(
      "app-toast app-toast--success",
    );
    expect(props.bodyClassName()).toBe("app-toast__body");
    expect(props.progressClassName()).toBe("app-toast__progress");

    const { container: iconContainer } = render(props.icon({ type: "warning" }));
    const iconNode = iconContainer.querySelector(".app-toast__icon--warning");
    expect(iconNode).toBeTruthy();
    expect(iconContainer.querySelector(".ri-alert-fill")).toBeTruthy();

    const closeToast = vi.fn();
    render(props.closeButton({ closeToast }));
    screen.getByRole("button", { name: "Close notification" }).click();
    expect(closeToast).toHaveBeenCalledTimes(1);

    toastApi.success("Import successfully");
    expect(toastMethodSpies.success).toHaveBeenCalledWith(
      "Import successfully",
      expect.objectContaining({
        autoClose: 2800,
        closeOnClick: true,
        pauseOnHover: false,
        pauseOnFocusLoss: false,
        draggable: false,
      }),
    );

    toastApi.error("Save failed", { autoClose: 9100 });
    expect(toastMethodSpies.error).toHaveBeenCalledWith(
      "Save failed",
      expect.objectContaining({
        autoClose: 9100,
        closeOnClick: true,
        pauseOnHover: false,
        pauseOnFocusLoss: false,
        draggable: false,
      }),
    );

    toastApi.warn("Needs attention");
    expect(toastMethodSpies.warn).toHaveBeenCalledWith(
      "Needs attention",
      expect.objectContaining({
        autoClose: 4200,
      }),
    );

    toastApi.success("Duplicate-safe toast");
    toastApi.success("Duplicate-safe toast");
    expect(toastMethodSpies.success).toHaveBeenCalledTimes(2);
    expect(toastMethodSpies.success).toHaveBeenLastCalledWith(
      "Duplicate-safe toast",
      expect.objectContaining({
        autoClose: 2800,
        toastId: "success:Duplicate-safe toast",
      }),
    );

    locationState.pathname = "/projects-all-projects";
    rerender(<AppToastHost />);
    expect(toastApi.dismiss).toHaveBeenCalledTimes(1);
    expect(toastApi.clearWaitingQueue).toHaveBeenCalledTimes(1);

    toastApi.success("Import successfully");
    expect(toastMethodSpies.success).toHaveBeenCalledTimes(3);
    expect(toastMethodSpies.success).toHaveBeenLastCalledWith(
      "Import successfully",
      expect.objectContaining({
        autoClose: 2800,
        toastId: "success:Import successfully",
      }),
    );

    expect(cssTransitionSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        enter: "app-toast-motion-enter",
        exit: "app-toast-motion-exit",
        appendPosition: true,
        collapse: true,
        collapseDuration: 180,
      }),
    );
  });
});

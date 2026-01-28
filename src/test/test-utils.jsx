import "@testing-library/jest-dom";
import { vi } from "vitest";

Object.defineProperty(document, "documentElement", {
  value: {
    requestFullscreen: vi.fn().mockResolvedValue(undefined),
  },
  configurable: true,
});

document.exitFullscreen = vi.fn().mockResolvedValue(undefined);

Object.defineProperty(document, "fullscreenElement", {
  get: () => null,
  configurable: true,
});

if (!SVGElement.prototype.getBBox) {
  SVGElement.prototype.getBBox = () => ({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
}

vi.mock("react-apexcharts", () => ({
  __esModule: true,
  default: () => <div data-testid="mock-apexchart" />,
}));

vi.mock("apexcharts", () => ({
  __esModule: true,
  default: class {
    constructor() {}
    render() {
      return Promise.resolve();
    }
    destroy() {}
    updateOptions() {
      return Promise.resolve();
    }
  },
}));

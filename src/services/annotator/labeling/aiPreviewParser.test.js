import { describe, expect, it } from "vitest";

import {
  extractBoundingBoxesFromImageData,
  scaleBoundingBoxes,
} from "./aiPreviewParser";

const createImageData = (width, height, pixels) => {
  const data = new Uint8ClampedArray(width * height * 4);

  pixels.forEach(([x, y, r, g, b, a = 255]) => {
    const index = (y * width + x) * 4;
    data[index] = r;
    data[index + 1] = g;
    data[index + 2] = b;
    data[index + 3] = a;
  });

  return data;
};

const addOrangeRectOutline = (
  pixels,
  xmin,
  ymin,
  xmax,
  ymax,
  color = [255, 165, 0, 255],
) => {
  for (let x = xmin; x <= xmax; x += 1) {
    pixels.push([x, ymin, ...color]);
    pixels.push([x, ymax, ...color]);
  }

  for (let y = ymin; y <= ymax; y += 1) {
    pixels.push([xmin, y, ...color]);
    pixels.push([xmax, y, ...color]);
  }
};

const addOrangeFilledRect = (
  pixels,
  xmin,
  ymin,
  xmax,
  ymax,
  color = [255, 165, 0, 255],
) => {
  for (let y = ymin; y <= ymax; y += 1) {
    for (let x = xmin; x <= xmax; x += 1) {
      pixels.push([x, y, ...color]);
    }
  }
};

describe("aiPreviewParser", () => {
  it("extracts orange rectangles from preview image data", () => {
    const pixels = [];
    addOrangeRectOutline(pixels, 4, 5, 18, 16);
    addOrangeRectOutline(pixels, 24, 10, 35, 22);

    const data = createImageData(48, 32, pixels);
    const boxes = extractBoundingBoxesFromImageData(48, 32, data, {
      padding: 0,
    });

    expect(boxes).toEqual([
      { xmin: 4, ymin: 5, xmax: 18, ymax: 16 },
      { xmin: 24, ymin: 10, xmax: 35, ymax: 22 },
    ]);
  });

  it("ignores non-orange pixels and tiny noise", () => {
    const pixels = [
      [1, 1, 255, 255, 255, 255],
      [2, 2, 255, 165, 0, 255],
      [3, 2, 255, 165, 0, 255],
    ];

    const data = createImageData(12, 12, pixels);
    const boxes = extractBoundingBoxesFromImageData(12, 12, data);

    expect(boxes).toEqual([]);
  });

  it("ignores attached label badges when inferring the actual detection box", () => {
    const pixels = [];
    addOrangeRectOutline(pixels, 12, 10, 40, 24);
    addOrangeFilledRect(pixels, 8, 4, 22, 9);

    for (let y = 8; y <= 10; y += 1) {
      pixels.push([12, y, 255, 165, 0, 255]);
    }

    const data = createImageData(56, 36, pixels);
    const boxes = extractBoundingBoxesFromImageData(56, 36, data, {
      padding: 0,
    });

    expect(boxes).toEqual([
      { xmin: 12, ymin: 10, xmax: 40, ymax: 24 },
    ]);
  });

  it("rescales extracted boxes from preview size to original image size", () => {
    const boxes = scaleBoundingBoxes(
      [{ xmin: 10, ymin: 8, xmax: 30, ymax: 20 }],
      { width: 100, height: 50 },
      { width: 200, height: 100 },
    );

    expect(boxes).toEqual([
      { xmin: 20, ymin: 16, xmax: 61, ymax: 41 },
    ]);
  });
});

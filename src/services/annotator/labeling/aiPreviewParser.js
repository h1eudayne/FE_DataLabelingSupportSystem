const DEFAULT_OPTIONS = {
  minWidth: 8,
  minHeight: 8,
  minPixels: 24,
  padding: 1,
  edgeSpanRatio: 0.7,
};

const isOrangePixel = (r, g, b, a) =>
  a >= 180 &&
  r >= 180 &&
  g >= 90 &&
  g <= 235 &&
  b <= 120 &&
  r - g >= 20 &&
  r - b >= 80;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const normalizeImageSize = (size) => {
  const width = Number(size?.width);
  const height = Number(size?.height);

  if (!Number.isFinite(width) || !Number.isFinite(height)) {
    return null;
  }

  if (width <= 0 || height <= 0) {
    return null;
  }

  return {
    width: Math.round(width),
    height: Math.round(height),
  };
};

const getImageSize = (image) => ({
  width: image.naturalWidth || image.width,
  height: image.naturalHeight || image.height,
});

export const extractBoundingBoxesFromImageData = (
  width,
  height,
  data,
  options = {},
) => {
  if (!width || !height || !data?.length) {
    return [];
  }

  const {
    minWidth,
    minHeight,
    minPixels,
    padding,
    edgeSpanRatio,
  } = { ...DEFAULT_OPTIONS, ...options };

  const pixelCount = width * height;
  const orangeMask = new Uint8Array(pixelCount);
  const visited = new Uint8Array(pixelCount);

  for (let idx = 0; idx < pixelCount; idx += 1) {
    const offset = idx * 4;
    if (
      isOrangePixel(
        data[offset],
        data[offset + 1],
        data[offset + 2],
        data[offset + 3],
      )
    ) {
      orangeMask[idx] = 1;
    }
  }

  const boxes = [];
  const neighbors = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  for (let idx = 0; idx < pixelCount; idx += 1) {
    if (!orangeMask[idx] || visited[idx]) {
      continue;
    }

    const rowExtents = new Map();
    const columnExtents = new Map();
    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;
    let pixels = 0;
    const queue = [idx];
    visited[idx] = 1;

    while (queue.length > 0) {
      const current = queue.pop();
      const x = current % width;
      const y = Math.floor(current / width);

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      pixels += 1;

      const rowExtent = rowExtents.get(y) || { min: x, max: x };
      rowExtent.min = Math.min(rowExtent.min, x);
      rowExtent.max = Math.max(rowExtent.max, x);
      rowExtents.set(y, rowExtent);

      const columnExtent = columnExtents.get(x) || { min: y, max: y };
      columnExtent.min = Math.min(columnExtent.min, y);
      columnExtent.max = Math.max(columnExtent.max, y);
      columnExtents.set(x, columnExtent);

      for (const [dx, dy] of neighbors) {
        const nextX = x + dx;
        const nextY = y + dy;
        if (
          nextX < 0 ||
          nextY < 0 ||
          nextX >= width ||
          nextY >= height
        ) {
          continue;
        }

        const nextIndex = nextY * width + nextX;
        if (!orangeMask[nextIndex] || visited[nextIndex]) {
          continue;
        }

        visited[nextIndex] = 1;
        queue.push(nextIndex);
      }
    }

    if (pixels < minPixels) {
      continue;
    }

    const boxWidth = maxX - minX + 1;
    const boxHeight = maxY - minY + 1;
    if (boxWidth < minWidth || boxHeight < minHeight) {
      continue;
    }

    const rowEntries = [...rowExtents.entries()];
    const columnEntries = [...columnExtents.entries()];
    const maxRowSpan = rowEntries.reduce(
      (largest, [, extent]) => Math.max(largest, extent.max - extent.min + 1),
      0,
    );
    const maxColumnSpan = columnEntries.reduce(
      (largest, [, extent]) => Math.max(largest, extent.max - extent.min + 1),
      0,
    );

    const rowSpanThreshold = Math.max(
      minWidth,
      Math.ceil(maxRowSpan * edgeSpanRatio),
    );
    const columnSpanThreshold = Math.max(
      minHeight,
      Math.ceil(maxColumnSpan * edgeSpanRatio),
    );

    const refinedRows = rowEntries.filter(
      ([, extent]) => extent.max - extent.min + 1 >= rowSpanThreshold,
    );
    const refinedColumns = columnEntries.filter(
      ([, extent]) => extent.max - extent.min + 1 >= columnSpanThreshold,
    );

    const refinedMinY = refinedRows.length
      ? Math.min(...refinedRows.map(([y]) => y))
      : minY;
    const refinedMaxY = refinedRows.length
      ? Math.max(...refinedRows.map(([y]) => y))
      : maxY;
    const refinedMinX = refinedColumns.length
      ? Math.min(...refinedColumns.map(([x]) => x))
      : minX;
    const refinedMaxX = refinedColumns.length
      ? Math.max(...refinedColumns.map(([x]) => x))
      : maxX;

    boxes.push({
      xmin: Math.max(0, refinedMinX - padding),
      ymin: Math.max(0, refinedMinY - padding),
      xmax: Math.min(width - 1, refinedMaxX + padding),
      ymax: Math.min(height - 1, refinedMaxY + padding),
    });
  }

  return boxes.sort((left, right) => {
    if (left.ymin !== right.ymin) {
      return left.ymin - right.ymin;
    }
    return left.xmin - right.xmin;
  });
};

const loadImage = (imageUrl) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load AI preview image."));
    image.src = imageUrl;
  });

export const scaleBoundingBoxes = (boxes, sourceSize, targetSize) => {
  if (!Array.isArray(boxes) || boxes.length === 0) {
    return [];
  }

  const normalizedSourceSize = normalizeImageSize(sourceSize);
  const normalizedTargetSize = normalizeImageSize(targetSize);

  if (!normalizedSourceSize || !normalizedTargetSize) {
    return boxes;
  }

  if (
    normalizedSourceSize.width === normalizedTargetSize.width &&
    normalizedSourceSize.height === normalizedTargetSize.height
  ) {
    return boxes;
  }

  const scaleX = normalizedTargetSize.width / normalizedSourceSize.width;
  const scaleY = normalizedTargetSize.height / normalizedSourceSize.height;

  return boxes.map((box) => {
    const xmin = clamp(
      Math.floor(Number(box.xmin || 0) * scaleX),
      0,
      normalizedTargetSize.width - 1,
    );
    const ymin = clamp(
      Math.floor(Number(box.ymin || 0) * scaleY),
      0,
      normalizedTargetSize.height - 1,
    );
    const xmax = clamp(
      Math.ceil((Number(box.xmax || 0) + 1) * scaleX) - 1,
      xmin,
      normalizedTargetSize.width - 1,
    );
    const ymax = clamp(
      Math.ceil((Number(box.ymax || 0) + 1) * scaleY) - 1,
      ymin,
      normalizedTargetSize.height - 1,
    );

    return { xmin, ymin, xmax, ymax };
  });
};

export const extractDetectionsFromPreviewImage = async (
  imageUrl,
  options = {},
) => {
  if (!imageUrl) {
    return {
      boxes: [],
      previewBoxes: [],
      previewImageSize: null,
      targetImageSize: null,
      boxesWereRescaled: false,
    };
  }

  const {
    targetImageUrl = null,
    ...extractOptions
  } = options;

  const image = await loadImage(imageUrl);
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    throw new Error("Unable to create a canvas context for AI preview parsing.");
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  try {
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
    const previewBoxes = extractBoundingBoxesFromImageData(
      canvas.width,
      canvas.height,
      data,
      extractOptions,
    );

    const previewImageSize = getImageSize(image);
    let targetImageSize = null;
    let boxes = previewBoxes;
    let boxesWereRescaled = false;

    if (targetImageUrl) {
      try {
        const targetImage = await loadImage(targetImageUrl);
        targetImageSize = getImageSize(targetImage);
        boxes = scaleBoundingBoxes(previewBoxes, previewImageSize, targetImageSize);
        boxesWereRescaled =
          Boolean(targetImageSize) &&
          (previewImageSize.width !== targetImageSize.width ||
            previewImageSize.height !== targetImageSize.height);
      } catch {
        targetImageSize = null;
      }
    }

    return {
      boxes,
      previewBoxes,
      previewImageSize,
      targetImageSize,
      boxesWereRescaled,
    };
  } catch (error) {
    throw new Error(
      "Unable to read the AI preview image for auto-insert. The preview image may block pixel access.",
    );
  }
};

export default extractDetectionsFromPreviewImage;

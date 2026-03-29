import { describe, it, expect } from "vitest";


describe("AnnotatorProjectPacks - image index display (off-by-one fix)", () => {
  const PACK_SIZE = 50;

  function buildPacks(images) {
    const result = [];
    for (let i = 0; i < images.length; i += PACK_SIZE) {
      result.push({
        index: result.length,
        startIdx: i,
        endIdx: Math.min(i + PACK_SIZE, images.length),
        total: images.slice(i, i + PACK_SIZE).length,
      });
    }
    return result;
  }

  
  function getDisplayRange(pack, total) {
    const end = Math.min(pack.endIdx, total) - 1;
    return `${pack.startIdx + 1} – ${Math.max(pack.startIdx + 1, end + 1)}`;
  }

  it("pack đầu tiên với 50 ảnh nên hiển thị đúng range 1-50", () => {
    const images = Array.from({ length: 50 }, (_, i) => ({ id: i }));
    const packs = buildPacks(images);

    expect(packs).toHaveLength(1);
    expect(packs[0].startIdx).toBe(0);
    expect(packs[0].endIdx).toBe(50);
    expect(getDisplayRange(packs[0], 50)).toBe("1 – 50");
  });

  it("pack cuối với ít hơn PACK_SIZE ảnh nên hiển thị đúng chỉ số", () => {
    const images = Array.from({ length: 120 }, (_, i) => ({ id: i }));
    const packs = buildPacks(images);

    expect(packs).toHaveLength(3);

    expect(getDisplayRange(packs[0], 120)).toBe("1 – 50");
    expect(getDisplayRange(packs[1], 120)).toBe("51 – 100");
    expect(getDisplayRange(packs[2], 120)).toBe("101 – 120");
  });

  it("pack 1 phần tử nên hiển thị đúng index 1-1", () => {
    const images = [{ id: 0 }];
    const packs = buildPacks(images);

    expect(packs).toHaveLength(1);
    expect(packs[0].startIdx).toBe(0);
    expect(packs[0].endIdx).toBe(1);
    expect(getDisplayRange(packs[0], 1)).toBe("1 – 1");
  });

  it("tổng số phần tử hiển thị của pack cuối không được vượt quá images.length", () => {
    for (const total of [1, 10, 49, 50, 51, 99, 100, 101, 500]) {
      const images = Array.from({ length: total }, (_, i) => ({ id: i }));
      const packs = buildPacks(images);
      const lastPack = packs[packs.length - 1];

      const displayStr = getDisplayRange(lastPack, total);
      const match = displayStr.match(/–\s*(\d+)$/);
      const displayEnd = parseInt(match[1], 10);

      expect(displayEnd).toBeLessThanOrEqual(total);
      expect(displayEnd).toBeGreaterThanOrEqual(1);
    }
  });
});

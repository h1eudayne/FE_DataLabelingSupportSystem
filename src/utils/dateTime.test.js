import { describe, expect, it } from "vitest";
import {
  formatLocalDateTime,
  normalizeServerDateTime,
  parseDateTimeToMillis,
} from "./dateTime";

describe("dateTime utils", () => {
  it("normalizes ISO timestamps without timezone to UTC", () => {
    expect(normalizeServerDateTime("2026-04-01T17:06:51")).toBe(
      "2026-04-01T17:06:51Z",
    );
  });

  it("normalizes space-separated timestamps without timezone to UTC", () => {
    expect(normalizeServerDateTime("2026-04-01 17:06:51")).toBe(
      "2026-04-01T17:06:51Z",
    );
  });

  it("keeps timestamps that already include timezone information", () => {
    expect(normalizeServerDateTime("2026-04-01T17:06:51.000Z")).toBe(
      "2026-04-01T17:06:51.000Z",
    );
  });

  it("parses timezone-less and UTC timestamps to the same moment", () => {
    expect(parseDateTimeToMillis("2026-04-01T17:06:51")).toBe(
      parseDateTimeToMillis("2026-04-01T17:06:51Z"),
    );
  });

  it("formats timezone-less and UTC timestamps identically for local display", () => {
    expect(formatLocalDateTime("2026-04-01T17:06:51", "vi-VN")).toBe(
      formatLocalDateTime("2026-04-01T17:06:51Z", "vi-VN"),
    );
  });
});

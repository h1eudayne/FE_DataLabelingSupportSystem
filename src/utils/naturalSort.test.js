import { describe, expect, it } from "vitest";

import { compareNaturalText, sortByNaturalName } from "./naturalSort";

describe("naturalSort", () => {
  it("compares numeric suffixes naturally", () => {
    expect(compareNaturalText("Reviewer 2", "Reviewer 10")).toBeLessThan(0);
    expect(compareNaturalText("Annotator 11", "Annotator 3")).toBeGreaterThan(0);
  });

  it("sorts managed users by natural display name", () => {
    const users = [
      { id: 10, fullName: "Annotator 10" },
      { id: 2, fullName: "Annotator 2" },
      { id: 1, fullName: "Annotator 1" },
      { id: 11, fullName: "Annotator 11" },
      { id: 3, fullName: "Annotator 3" },
    ];

    const sorted = sortByNaturalName(users, (user) => user.fullName);

    expect(sorted.map((user) => user.fullName)).toEqual([
      "Annotator 1",
      "Annotator 2",
      "Annotator 3",
      "Annotator 10",
      "Annotator 11",
    ]);
  });
});

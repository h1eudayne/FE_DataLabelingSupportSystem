import { describe, expect, it } from "vitest";
import { buildAnnotatorWorkspaceUrl } from "./annotatorWorkspaceNavigation";

describe("annotatorWorkspaceNavigation", () => {
  it("builds a workspace URL that targets the clicked image inside the selected project", () => {
    expect(
      buildAnnotatorWorkspaceUrl(88, {
        id: 17,
        dataItemId: 901,
      }),
    ).toBe("/workplace-labeling-task/88?imageId=17&dataItemId=901");
  });

  it("returns null when project id or image id is missing", () => {
    expect(buildAnnotatorWorkspaceUrl(null, { id: 17, dataItemId: 901 })).toBeNull();
    expect(buildAnnotatorWorkspaceUrl(88, { dataItemId: 901 })).toBeNull();
  });
});

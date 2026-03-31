import { describe, expect, it } from "vitest";
import { buildAssignmentRequest } from "./projectAssignTask.helpers";

describe("buildAssignmentRequest", () => {
  it("builds one payload that includes all selected annotators and reviewers", () => {
    const request = buildAssignmentRequest({
      projectId: 12,
      targetAnnotators: [
        { id: "ann-1", name: "Annotator One" },
        { id: "ann-2", name: "Annotator Two" },
      ],
      targetReviewers: [
        { id: "rev-1", name: "Reviewer One" },
        { id: "rev-2", name: "Reviewer Two" },
      ],
      qtyPerAnnotator: 5,
    });

    expect(request.payload.annotatorIds).toEqual(["ann-1", "ann-2"]);
    expect(request.payload.reviewerIds).toEqual(["rev-1", "rev-2"]);
    expect(request.payload.totalQuantity).toBe(5);
  });

  it("computes matrix assignment records for all images, annotators, and reviewers", () => {
    const request = buildAssignmentRequest({
      projectId: 99,
      targetAnnotators: [
        { id: "ann-1", name: "Annotator One" },
        { id: "ann-2", name: "Annotator Two" },
        { id: "ann-3", name: "Annotator Three" },
      ],
      targetReviewers: [
        { id: "rev-1", name: "Reviewer One" },
        { id: "rev-2", name: "Reviewer Two" },
      ],
      qtyPerAnnotator: 100,
    });

    expect(request.annotatorCount).toBe(3);
    expect(request.reviewerCount).toBe(2);
    expect(request.totalRecords).toBe(600);
  });
});

import { describe, expect, it } from "vitest";
import {
  parseErrorCategories,
  parseStoredAnnotationData,
  summarizeEvidence,
  summarizeReviewerFeedbacks,
} from "./disputeEvidence.utils";

describe("disputeEvidence.utils", () => {
  it("parses stored annotation payload with annotations, checklist, and default flags", () => {
    const result = parseStoredAnnotationData(
      JSON.stringify({
        annotations: [{ id: "a-1", type: "BBOX", x: 10, y: 20, width: 30, height: 40 }],
        __checklist: { 1: [true, false, true] },
        __defaultFlags: [1],
      }),
    );

    expect(result.annotations).toHaveLength(1);
    expect(result.checklist).toEqual({ 1: [true, false, true] });
    expect(result.defaultFlags).toEqual([1]);
  });

  it("summarizes annotation evidence and reviewer votes for manager decisions", () => {
    const labels = [
      {
        id: 1,
        name: "Plate",
        color: "#00b8a9",
        guideLine: "Mark the whole license plate.",
        checklist: ["Plate visible", "Text readable"],
      },
    ];

    const evidence = summarizeEvidence({
      annotations: [
        {
          id: "bbox-1",
          type: "BBOX",
          labelId: 1,
          x: 12,
          y: 24,
          width: 120,
          height: 48,
        },
      ],
      checklist: { 1: [true, false] },
      defaultFlags: [1],
      labels,
      reviewerFeedbacks: [
        { verdict: "Approve" },
        { verdict: "Rejected" },
        { verdict: "Approve" },
      ],
    });

    expect(evidence.annotationCount).toBe(1);
    expect(evidence.labelSummaries[0].name).toBe("Plate");
    expect(evidence.labelSummaries[0].checkedItems).toEqual(["Plate visible"]);
    expect(evidence.flaggedLabels[0].name).toBe("Plate");
    expect(evidence.feedbackSummary).toEqual({
      approvedCount: 2,
      rejectedCount: 1,
      neutralCount: 0,
      total: 3,
      majorityVerdict: "approved",
      isConflict: false,
    });
  });

  it("parses reviewer error categories from JSON strings and CSV fallbacks", () => {
    expect(parseErrorCategories('["Missing object","Wrong label"]')).toEqual([
      "Missing object",
      "Wrong label",
    ]);
    expect(parseErrorCategories("Missing object, Wrong label")).toEqual([
      "Missing object",
      "Wrong label",
    ]);
  });

  it("detects tied reviewer votes for penalty review cases", () => {
    expect(
      summarizeReviewerFeedbacks([
        { verdict: "Approved" },
        { verdict: "Reject" },
      ]),
    ).toEqual({
      approvedCount: 1,
      rejectedCount: 1,
      neutralCount: 0,
      total: 2,
      majorityVerdict: null,
      isConflict: true,
    });
  });
});

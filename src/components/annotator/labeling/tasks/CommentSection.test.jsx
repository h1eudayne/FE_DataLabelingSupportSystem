import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) =>
      (
        {
          "commentSection.feedbackTitle": "Feedback",
          "commentSection.reviewerFeedback": "Reviewer Feedback",
          "commentSection.managerFeedback": "Manager Feedback",
          "commentSection.noComment": "No feedback for this image yet.",
          "workspace.statusApproved": "Approved",
          "workspace.statusRejected": "Rejected",
        }
      )[key] ?? key,
    i18n: {
      language: "en",
    },
  }),
}));

import CommentSection from "./CommentSection";

describe("CommentSection", () => {
  it("shows an empty state when there is no reviewer or manager feedback", () => {
    render(<CommentSection />);

    expect(screen.getByText("Feedback")).toBeInTheDocument();
    expect(
      screen.getByText("No feedback for this image yet."),
    ).toBeInTheDocument();
  });

  it("renders reviewer and manager feedback with their statuses", () => {
    render(
      <CommentSection
        status="Rejected"
        reviewerFeedbacks={[
          {
            reviewLogId: 1,
            sourceName: "Reviewer One",
            errorType: "bbox",
            comment: "Need tighter box",
            status: "Rejected",
            returnedDate: "2026-04-01T09:00:00.000Z",
          },
          {
            reviewLogId: 2,
            sourceName: "Reviewer Two",
            errorType: "classification",
            comment: "Wrong class",
            status: "Rejected",
            returnedDate: "2026-04-01T09:05:00.000Z",
          },
        ]}
        managerComment="Penalty kept after manager review"
        managerStatus="Rejected"
      />,
    );

    expect(screen.getAllByText("Reviewer Feedback")).toHaveLength(2);
    expect(screen.getByText("Manager Feedback")).toBeInTheDocument();
    expect(screen.getByText("Need tighter box")).toBeInTheDocument();
    expect(screen.getByText("Wrong class")).toBeInTheDocument();
    expect(screen.getByText("Reviewer One")).toBeInTheDocument();
    expect(screen.getByText("Reviewer Two")).toBeInTheDocument();
    expect(
      screen.getByText("Penalty kept after manager review"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Rejected")).toHaveLength(3);
  });
});

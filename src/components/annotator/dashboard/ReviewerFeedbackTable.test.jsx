import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ReviewerFeedbackTable from "./ReviewerFeedbackTable";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) =>
      (
        {
          "annotatorDashboardComp.colTask": "Task",
          "annotatorDashboardComp.colReturnedBy": "Returned By",
          "annotatorDashboardComp.colErrorType": "Error Type",
          "annotatorDashboardComp.colComment": "Comment",
          "annotatorDashboardComp.colReturnDate": "Return Date",
          "annotatorDashboardComp.colAction": "Action",
          "annotatorDashboardComp.noFeedback":
            "No returned feedback from Reviewer or Manager yet",
          "annotatorDashboardComp.loadingFeedback": "Loading feedback...",
          "annotatorDashboardComp.roleReviewer": "Reviewer",
          "annotatorDashboardComp.roleManager": "Manager",
          "annotatorDashboardComp.unknownProject": "Unknown project",
          "annotatorDashboardComp.managerDecision": "Manager decision",
          "annotatorDashboardComp.open": "Open",
        }
      )[key] ?? key,
    i18n: {
      language: "en",
    },
  }),
}));

describe("ReviewerFeedbackTable", () => {
  it("shows loading state while feedback is being fetched", () => {
    render(<ReviewerFeedbackTable loading />);

    expect(screen.getByText("Loading feedback...")).toBeInTheDocument();
  });

  it("renders reviewer and manager feedback rows and opens the selected task", async () => {
    const user = userEvent.setup();
    const onOpenTask = vi.fn();

    render(
      <ReviewerFeedbackTable
        data={[
          {
            assignmentId: 5,
            dataItemId: 55,
            projectId: 100,
            projectName: "Project A",
            taskName: "car-55.jpg",
            sourceRole: "Reviewer",
            sourceName: "Reviewer One",
            errorType: "BBox",
            comment: "Bounding box is too loose",
            returnedDate: "2026-04-01T09:00:00.000Z",
          },
          {
            assignmentId: 5,
            dataItemId: 55,
            projectId: 100,
            projectName: "Project A",
            taskName: "car-55.jpg",
            sourceRole: "Manager",
            sourceName: "Manager One",
            comment: "Please relabel based on guideline v2",
            returnedDate: "2026-04-01T10:00:00.000Z",
          },
        ]}
        onOpenTask={onOpenTask}
      />,
    );

    expect(screen.getAllByText("car-55.jpg")).toHaveLength(2);
    expect(screen.getAllByText("Project A · Task #5")).toHaveLength(2);
    expect(screen.getByText("Reviewer One")).toBeInTheDocument();
    expect(screen.getByText("Manager One")).toBeInTheDocument();
    expect(screen.getByText("Bounding box is too loose")).toBeInTheDocument();
    expect(
      screen.getByText("Please relabel based on guideline v2"),
    ).toBeInTheDocument();
    expect(screen.getByText("Manager decision")).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: /open/i })[1]);

    expect(onOpenTask).toHaveBeenCalledWith(
      expect.objectContaining({
        assignmentId: 5,
        sourceRole: "Manager",
        projectId: 100,
      }),
    );
  });

  it("renders multiple reviewer rows for the same task when more than one reviewer returned it", () => {
    render(
      <ReviewerFeedbackTable
        data={[
          {
            feedbackId: 101,
            assignmentId: 5,
            dataItemId: 55,
            projectId: 100,
            projectName: "Project A",
            taskName: "car-55.jpg",
            sourceRole: "Reviewer",
            sourceName: "Reviewer One",
            errorType: "BBox",
            comment: "Bounding box is too loose",
            returnedDate: "2026-04-01T09:00:00.000Z",
          },
          {
            feedbackId: 102,
            assignmentId: 5,
            dataItemId: 55,
            projectId: 100,
            projectName: "Project A",
            taskName: "car-55.jpg",
            sourceRole: "Reviewer",
            sourceName: "Reviewer Two",
            errorType: "Classification",
            comment: "Wrong class",
            returnedDate: "2026-04-01T09:05:00.000Z",
          },
        ]}
      />,
    );

    expect(screen.getAllByText("Reviewer")).toHaveLength(2);
    expect(screen.getByText("Reviewer One")).toBeInTheDocument();
    expect(screen.getByText("Reviewer Two")).toBeInTheDocument();
    expect(screen.getByText("Bounding box is too loose")).toBeInTheDocument();
    expect(screen.getByText("Wrong class")).toBeInTheDocument();
  });
});

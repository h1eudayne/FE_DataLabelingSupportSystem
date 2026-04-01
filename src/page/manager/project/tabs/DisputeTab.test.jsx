import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";

import DisputeTab from "./DisputeTab";
import projectService from "../../../../services/manager/project/projectService";
import disputeService from "../../../../services/manager/dispute/disputeService";
import reviewAuditService from "../../../../services/manager/review/reviewAuditService";

const toast = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
}));

vi.mock("react-toastify", () => ({
  toast,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

vi.mock("../../../../hooks/useSignalRRefresh", () => ({
  default: () => {},
}));

vi.mock("../../../../services/manager/project/projectService", () => ({
  default: {
    getProjectById: vi.fn(),
  },
}));

vi.mock("../../../../services/manager/dispute/disputeService", () => ({
  default: {
    getDisputes: vi.fn(),
    resolveDispute: vi.fn(),
  },
}));

vi.mock("../../../../services/manager/review/reviewAuditService", () => ({
  default: {
    getEscalations: vi.fn(),
    resolveEscalation: vi.fn(),
  },
}));

vi.mock(
  "../../../../components/manager/dispute/ManagerDecisionEvidenceModal",
  () => ({
    default: ({ isOpen, onConfirm, mode }) =>
      isOpen ? (
        <button
          type="button"
          onClick={() =>
            onConfirm({
              decision: mode === "escalation" ? "reject" : "accept",
              comment: "Manager decision",
            })
          }
        >
          confirm-manager-decision
        </button>
      ) : null,
  }),
);

describe("DisputeTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    projectService.getProjectById.mockResolvedValue({
      data: { id: 1, labels: [] },
    });
    disputeService.getDisputes.mockResolvedValue({ data: [] });
  });

  it("keeps only active escalations in the priority queue after a manager resolves one", async () => {
    const user = userEvent.setup();

    reviewAuditService.getEscalations
      .mockResolvedValueOnce({
        data: [
          {
            assignmentId: 10,
            status: "Escalated",
            escalationType: "PenaltyReview",
            projectName: "Demo Project",
            annotatorName: "Annotator A",
            rejectCount: 3,
            reviewerFeedbacks: [],
          },
        ],
      })
      .mockResolvedValueOnce({
        data: [
          {
            assignmentId: 10,
            status: "Rejected",
            escalationType: "PenaltyReview",
            projectName: "Demo Project",
            annotatorName: "Annotator A",
            rejectCount: 4,
            reviewerFeedbacks: [],
          },
        ],
      });

    reviewAuditService.resolveEscalation.mockResolvedValue({
      data: { message: "OK" },
    });

    render(<DisputeTab projectId={1} />);

    expect(await screen.findByText("#10")).toBeInTheDocument();

    await user.click(
      screen.getAllByRole("button", { name: "dispute.resolve" })[0],
    );
    await user.click(screen.getByRole("button", { name: "confirm-manager-decision" }));

    await waitFor(() => {
      expect(reviewAuditService.resolveEscalation).toHaveBeenCalledWith({
        assignmentId: 10,
        action: "reject",
        comment: "Manager decision",
      });
    });

    await waitFor(() => {
      expect(screen.queryByText("#10")).not.toBeInTheDocument();
    });

    expect(
      screen.getByText("analytics.priorityQueueEmpty"),
    ).toBeInTheDocument();
    expect(toast.success).toHaveBeenCalledWith("dispute.resolveSuccess");
  });
});

import { describe, expect, it } from "vitest";
import {
  PROJECT_WORKFLOW_STATUS,
  getProjectStatusBadgeClass,
  getProjectStatusLabel,
  getProjectStatusTone,
  isAwaitingManagerConfirmation,
  isCompletedProjectStatus,
} from "./projectWorkflowStatus";

const t = (key) => key;

describe("projectWorkflowStatus", () => {
  it("detects awaiting manager confirmation status", () => {
    expect(
      isAwaitingManagerConfirmation(
        PROJECT_WORKFLOW_STATUS.AWAITING_MANAGER_CONFIRMATION,
      ),
    ).toBe(true);
    expect(
      isAwaitingManagerConfirmation(PROJECT_WORKFLOW_STATUS.COMPLETED),
    ).toBe(false);
  });

  it("treats only completed as completed", () => {
    expect(isCompletedProjectStatus(PROJECT_WORKFLOW_STATUS.COMPLETED)).toBe(
      true,
    );
    expect(
      isCompletedProjectStatus(
        PROJECT_WORKFLOW_STATUS.AWAITING_MANAGER_CONFIRMATION,
      ),
    ).toBe(false);
  });

  it("maps awaiting manager confirmation to warning presentation", () => {
    expect(
      getProjectStatusLabel(
        PROJECT_WORKFLOW_STATUS.AWAITING_MANAGER_CONFIRMATION,
        t,
      ),
    ).toBe("statusCommon.awaitingManagerConfirmation");
    expect(
      getProjectStatusTone(
        PROJECT_WORKFLOW_STATUS.AWAITING_MANAGER_CONFIRMATION,
      ),
    ).toBe("warning");
    expect(
      getProjectStatusBadgeClass(
        PROJECT_WORKFLOW_STATUS.AWAITING_MANAGER_CONFIRMATION,
      ),
    ).toBe("bg-warning-subtle text-warning");
  });
});

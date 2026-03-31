import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import DashboardAnalytics from "./DashboardAnalyticsPage";
import "@testing-library/jest-dom";

const toast = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}));

const analyticsServiceMock = vi.hoisted(() => ({
  getMyProjects: vi.fn(),
  getManagerStats: vi.fn(),
  getProjectStats: vi.fn(),
}));

const reviewAuditServiceMock = vi.hoisted(() => ({
  getTasksForReview: vi.fn(),
}));

const disputeServiceMock = vi.hoisted(() => ({
  getDisputes: vi.fn(),
}));

vi.mock("react-toastify", async () => {
  const actual = await vi.importActual("react-toastify");
  return {
    ...actual,
    toast,
  };
});

vi.mock("../../../services/manager/analytics/analyticsService", () => ({
  default: analyticsServiceMock,
}));

vi.mock("../../../services/manager/review/reviewAuditService", () => ({
  default: reviewAuditServiceMock,
}));

vi.mock("../../../services/manager/dispute/disputeService", () => ({
  default: disputeServiceMock,
}));

const createStore = () =>
  configureStore({
    reducer: {
      auth: () => ({
        user: { id: 7, role: "Manager", fullName: "Manager 1" },
        isAuthenticated: true,
      }),
    },
  });

const projectStatsResponse = {
  data: {
    totalAssignments: 10,
    approvedAssignments: 4,
    rejectedAssignments: 1,
    submittedAssignments: 2,
    pendingAssignments: 3,
    rejectionRate: 10,
    errorBreakdown: { Missing: 1 },
    annotatorPerformances: [
      {
        annotatorId: "ann-1",
        annotatorName: "Annotator 1",
        tasksAssigned: 5,
        tasksCompleted: 3,
        tasksRejected: 1,
        averageQualityScore: 94,
        annotatorAccuracy: 88,
        totalCriticalErrors: 0,
      },
    ],
    reviewerPerformances: [
      {
        reviewerId: "rev-1",
        reviewerName: "Reviewer 1",
        totalReviews: 3,
      },
    ],
    projectAccuracy: 88,
    totalItems: 10,
    completedItems: 4,
    finalCorrect: 4,
    firstPassCorrect: 3,
    totalReworks: 1,
    totalSubmittedTasks: 5,
    labelDistributions: [{ className: "Plate", count: 4 }],
    finalAccuracy: 88,
    firstPassAccuracy: 77,
    reworkRate: 20,
  },
};

describe("DashboardAnalyticsPage", () => {
  beforeEach(() => {
    localStorage.setItem("i18nLang", "en");
    vi.clearAllMocks();

    analyticsServiceMock.getMyProjects.mockResolvedValue({
      data: [
        {
          id: 1,
          name: "Project Alpha",
          pendingDisputeCount: 1,
          pendingPenaltyCount: 0,
          rejectedImageCount: 0,
          priorityIssueCount: 1,
          hasPriorityIssue: true,
          defaultActionTab: "disputes",
        },
      ],
    });
    analyticsServiceMock.getManagerStats.mockResolvedValue({
      data: { totalMembers: 3 },
    });
    analyticsServiceMock.getProjectStats.mockResolvedValue(projectStatsResponse);
    reviewAuditServiceMock.getTasksForReview.mockResolvedValue({ data: [] });
    disputeServiceMock.getDisputes.mockResolvedValue({ data: [] });

    class ResizeObserverMock {
      constructor(callback) {
        this.callback = callback;
      }

      observe() {
        this.callback?.([]);
      }

      unobserve() {}

      disconnect() {}
    }

    window.ResizeObserver = ResizeObserverMock;
    global.ResizeObserver = ResizeObserverMock;

    Object.defineProperty(HTMLElement.prototype, "clientWidth", {
      configurable: true,
      get() {
        return 480;
      },
    });

    Object.defineProperty(HTMLElement.prototype, "clientHeight", {
      configurable: true,
      get() {
        return 320;
      },
    });
  });

  it("renders manager action buttons and priority entry", async () => {
    render(
      <Provider store={createStore()}>
        <MemoryRouter>
          <DashboardAnalytics />
        </MemoryRouter>
      </Provider>,
    );

    expect(
      await screen.findByText("analytics.dashboardTitle"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /analytics\.createProject/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /analytics\.allProjects/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /analytics\.openTopIssue/i })).toBeInTheDocument();
  });

  it("shows success toast after manual refresh", async () => {
    const user = userEvent.setup();

    render(
      <Provider store={createStore()}>
        <MemoryRouter>
          <DashboardAnalytics />
        </MemoryRouter>
      </Provider>,
    );

    const refreshButton = await screen.findByRole("button", { name: /analytics\.refresh/i });
    await user.click(refreshButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("analytics.refreshSuccess");
    });
  });
});

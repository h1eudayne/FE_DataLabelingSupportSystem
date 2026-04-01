import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
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

const markAsReadMock = vi.hoisted(() => vi.fn());
const refreshNotificationsMock = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const updateNotificationMock = vi.hoisted(() => vi.fn());
const useNotificationsMock = vi.hoisted(() => vi.fn());
const resolveGlobalBanRequestMock = vi.hoisted(() => vi.fn());

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

vi.mock("../../../hooks/useNotifications", () => ({
  default: useNotificationsMock,
}));

vi.mock("../../../services/admin/managementUsers/user.api", () => ({
  resolveGlobalBanRequest: resolveGlobalBanRequestMock,
}));

vi.mock("../../../components/layouts/GlobalBanDecisionModal", () => ({
  default: ({
    show,
    notification,
    onSubmit,
  }) =>
    show ? (
      <div data-testid="global-ban-modal">
        <span>{notification?.metadata?.targetUserName}</span>
        <button type="button" onClick={onSubmit}>
          submit-global-ban
        </button>
      </div>
    ) : null,
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
        correctDecisions: 2,
        totalManagerDecisions: 3,
        reviewerAccuracy: 66.7,
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
    useNotificationsMock.mockReturnValue({
      notifications: [],
      unreadCount: 0,
      markAsRead: markAsReadMock,
      markAllAsRead: vi.fn(),
      updateNotification: updateNotificationMock,
      clearAll: vi.fn(),
      refreshNotifications: refreshNotificationsMock,
    });
    resolveGlobalBanRequestMock.mockResolvedValue({ data: { success: true } });

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

  it("shows real reviewer metrics headers and hides fake 100 quality score for annotators without manager decisions", async () => {
    analyticsServiceMock.getProjectStats.mockResolvedValueOnce({
      data: {
        ...projectStatsResponse.data,
        annotatorPerformances: [
          ...projectStatsResponse.data.annotatorPerformances,
          {
            annotatorId: "ann-2",
            annotatorName: "Annotator 2",
            tasksAssigned: 3,
            tasksCompleted: 0,
            tasksRejected: 0,
            resolvedTasks: 0,
            totalSubmittedTasks: 0,
            averageQualityScore: null,
            finalAccuracy: 0,
            firstPassAccuracy: 0,
            reworkRate: 0,
            totalCriticalErrors: 0,
          },
        ],
      },
    });

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

    const annotatorTwoRow = screen
      .getAllByText("Annotator 2")
      .find((element) => element.closest("tr"))
      ?.closest("tr");
    expect(annotatorTwoRow).toBeTruthy();
    expect(annotatorTwoRow).not.toHaveTextContent("100.0");
  });

  it("fills reviewer evaluation rows from project statistics even when audit and dispute feeds are empty", async () => {
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

    const reviewerCell = await screen.findByText("Reviewer 1");
    const reviewerRow = reviewerCell.closest("tr");
    expect(reviewerRow).toBeTruthy();
    expect(within(reviewerRow).getByText("66.7%")).toBeInTheDocument();
    expect(within(reviewerRow).getAllByText("3").length).toBeGreaterThan(0);
    expect(screen.queryByText("analytics.noReviewerData")).not.toBeInTheDocument();
  });

  it("surfaces pending global ban requests on the manager dashboard and resolves them", async () => {
    const user = userEvent.setup();

    useNotificationsMock.mockReturnValue({
      notifications: [
        {
          id: 501,
          actionKey: "ResolveGlobalUserBanRequest",
          timestamp: "2026-04-01T09:30:00.000Z",
          message: "Admin requested a global ban for Annotator A.",
          metadata: {
            banRequestId: 77,
            requestStatus: "Pending",
            targetUserName: "Annotator A",
            targetUserEmail: "annotator.a@example.com",
            targetUserRole: "Annotator",
            requestedByAdminName: "Admin 1",
            requestedAt: "2026-04-01T09:00:00.000Z",
            unfinishedProjects: [
              {
                Id: 1,
                Name: "Project Alpha",
                Status: "InProgress",
              },
            ],
          },
        },
      ],
      unreadCount: 1,
      markAsRead: markAsReadMock,
      markAllAsRead: vi.fn(),
      updateNotification: updateNotificationMock,
      clearAll: vi.fn(),
      refreshNotifications: refreshNotificationsMock,
    });

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
    expect(
      screen.getByText("analytics.globalBanPriorityTitle"),
    ).toBeInTheDocument();
    expect(screen.getByText("Annotator A")).toBeInTheDocument();
    expect(screen.getAllByText(/Project Alpha/i).length).toBeGreaterThan(0);

    const reviewButtons = screen.getAllByRole("button", {
      name: /header\.globalBanReviewRequestCta/i,
    });
    expect(reviewButtons[0]).toBeInTheDocument();
    reviewButtons.forEach((button) => {
      expect(button).toHaveClass("text-nowrap");
    });

    await user.click(
      reviewButtons[0],
    );

    expect(await screen.findByTestId("global-ban-modal")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /submit-global-ban/i }));

    await waitFor(() => {
      expect(resolveGlobalBanRequestMock).toHaveBeenCalledWith(77, true, "");
    });
    expect(updateNotificationMock).toHaveBeenCalledWith(
      501,
      expect.objectContaining({
        read: true,
        metadata: expect.objectContaining({
          requestStatus: "Approved",
        }),
      }),
    );
    expect(markAsReadMock).toHaveBeenCalledWith(501);
    expect(refreshNotificationsMock).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith("header.globalBanApproveSuccess");
  });
});

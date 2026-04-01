import { describe, it, expect } from "vitest";
import {
  buildResolvedGlobalBanNotificationPatch,
  getSafeGlobalBanErrorMessage,
  getGlobalBanProjects,
  getPendingGlobalBanNotifications,
  isPendingGlobalBanNotification,
} from "./globalBanNotifications";

describe("globalBanNotifications", () => {
  it("filters and sorts only pending global ban notifications", () => {
    const notifications = [
      {
        id: 1,
        actionKey: "ResolveGlobalUserBanRequest",
        timestamp: "2026-04-01T09:00:00.000Z",
        metadata: { requestStatus: "Pending" },
      },
      {
        id: 2,
        actionKey: "ResolveGlobalUserBanRequest",
        timestamp: "2026-04-01T10:00:00.000Z",
        metadata: { requestStatus: "Approved" },
      },
      {
        id: 3,
        actionKey: "ResolveGlobalUserBanRequest",
        timestamp: "2026-04-01T11:00:00.000Z",
        metadata: { requestStatus: "Pending" },
      },
      {
        id: 4,
        actionKey: "OtherAction",
        timestamp: "2026-04-01T12:00:00.000Z",
        metadata: { requestStatus: "Pending" },
      },
    ];

    const result = getPendingGlobalBanNotifications(notifications);

    expect(result.map((item) => item.id)).toEqual([3, 1]);
    expect(isPendingGlobalBanNotification(result[0])).toBe(true);
  });

  it("returns unfinished projects safely from notification metadata", () => {
    expect(
      getGlobalBanProjects({
        metadata: {
          unfinishedProjects: [
            { id: 10, name: "Project A" },
            { id: 10, name: "Project A" },
            { id: 18 },
            { projectId: 18, status: "InProgress" },
            { Id: 21, Name: "Project Pascal", Status: "Active" },
          ],
        },
      }),
    ).toEqual([
      { id: 10, name: "Project A", status: null },
      { id: 18, name: null, status: "InProgress" },
      { id: 21, name: "Project Pascal", status: "Active" },
    ]);

    expect(getGlobalBanProjects({ metadata: {} })).toEqual([]);
    expect(getGlobalBanProjects(null)).toEqual([]);
  });

  it("dedupes pending notifications that point to the same global ban request", () => {
    const result = getPendingGlobalBanNotifications([
      {
        id: 11,
        actionKey: "ResolveGlobalUserBanRequest",
        timestamp: "2026-04-01T11:00:00.000Z",
        metadata: { requestStatus: "Pending", banRequestId: 9 },
      },
      {
        id: 10,
        actionKey: "ResolveGlobalUserBanRequest",
        timestamp: "2026-04-01T10:00:00.000Z",
        metadata: { requestStatus: "Pending", banRequestId: 9 },
      },
      {
        id: 12,
        actionKey: "ResolveGlobalUserBanRequest",
        timestamp: "2026-04-01T09:00:00.000Z",
        metadata: { requestStatus: "Pending", banRequestId: 8 },
      },
    ]);

    expect(result.map((item) => item.id)).toEqual([11, 12]);
  });

  it("builds a resolved patch that removes pending action state locally", () => {
    const result = buildResolvedGlobalBanNotificationPatch(
      {
        metadata: {
          requestStatus: "Pending",
          banRequestId: 44,
        },
      },
      true,
      "Approved now",
    );

    expect(result.read).toBe(true);
    expect(result.metadata.requestStatus).toBe("Approved");
    expect(result.metadata.decisionNote).toBe("Approved now");
    expect(typeof result.metadata.resolvedAt).toBe("string");
  });

  it("returns only safe business messages and hides technical backend errors", () => {
    expect(
      getSafeGlobalBanErrorMessage(
        {
          response: {
            status: 400,
            data: {
              message: "This global ban request has already been resolved.",
            },
          },
        },
        "Generic fallback",
      ),
    ).toBe("This global ban request has already been resolved.");

    expect(
      getSafeGlobalBanErrorMessage(
        {
          response: {
            status: 500,
            data: {
              message:
                "The configured execution strategy 'MySqlRetryingExecutionStrategy' does not support user-initiated transactions.",
            },
          },
        },
        "Generic fallback",
      ),
    ).toBe("Generic fallback");
  });
});

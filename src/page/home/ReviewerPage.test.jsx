import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ReviewerPage from "./ReviewerPage";

const getReviewProjectsMock = vi.fn();
const getReviewerStatsMock = vi.fn();

vi.mock("../../services/reviewer/project.service", () => ({
  default: {
    getReviewProjects: (...args) => getReviewProjectsMock(...args),
    getReviewerStats: (...args) => getReviewerStatsMock(...args),
    getReviewWorkspace: vi.fn(),
  },
}));

vi.mock("../../hooks/useSignalRRefresh", () => ({
  default: vi.fn(),
}));

vi.mock("../../components/reviewer/home/ReviewerActionBar", () => ({
  default: () => <div data-testid="reviewer-action-bar" />,
}));

vi.mock("../../components/reviewer/home/ShortcutSidebar", () => ({
  default: () => <div data-testid="shortcut-sidebar" />,
}));

vi.mock("../../components/home/CommonHeader", () => ({
  default: ({ title, subtitle }) => (
    <div>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  ),
}));

vi.mock("../../components/reviewer/home/ProjectCardItem", () => ({
  default: () => <div data-testid="project-card-item" />,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

describe("ReviewerPage", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    getReviewProjectsMock.mockReset();
    getReviewerStatsMock.mockReset();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("stops background refresh and shows a clear access state after reviewer endpoints return 403", async () => {
    const forbiddenError = {
      response: {
        status: 403,
        data: {
          message: "Review access revoked.",
        },
      },
    };

    getReviewProjectsMock.mockRejectedValue(forbiddenError);
    getReviewerStatsMock.mockRejectedValue(forbiddenError);

    render(
      <MemoryRouter>
        <ReviewerPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByText("reviewer.accessForbiddenTitle"),
      ).toBeInTheDocument();
      expect(screen.getByText("Review access revoked.")).toBeInTheDocument();
    });

    vi.advanceTimersByTime(35000);

    expect(getReviewProjectsMock).toHaveBeenCalledTimes(1);
    expect(getReviewerStatsMock).toHaveBeenCalledTimes(1);
  });
});

import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import GlobalBanDecisionModal from "./GlobalBanDecisionModal";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, options) => {
      if (key === "header.globalBanProjectCount") {
        return `${options?.count ?? 0} unfinished projects`;
      }

      return key;
    },
    i18n: { language: "en" },
  }),
}));

describe("GlobalBanDecisionModal", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("dedupes unfinished project rows with incomplete metadata so React keys stay unique", () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <GlobalBanDecisionModal
        show
        onHide={vi.fn()}
        onSubmit={vi.fn()}
        loading={false}
        notification={{
          metadata: {
            banRequestId: 1,
            unfinishedProjects: [
              { id: 18 },
              { id: 18 },
              { id: 1 },
              { id: 1 },
            ],
          },
        }}
        decision="approve"
        onDecisionChange={vi.fn()}
        decisionNote=""
        onDecisionNoteChange={vi.fn()}
      />,
    );

    expect(screen.getAllByText("header.globalBanUnknownProject #18")).toHaveLength(1);
    expect(screen.getAllByText("header.globalBanUnknownProject #1")).toHaveLength(1);

    const hasDuplicateKeyWarning = consoleErrorSpy.mock.calls.some((call) =>
      call.some(
        (argument) =>
          typeof argument === "string" &&
          argument.includes("Encountered two children with the same key"),
      ),
    );

    expect(hasDuplicateKeyWarning).toBe(false);
  });
});

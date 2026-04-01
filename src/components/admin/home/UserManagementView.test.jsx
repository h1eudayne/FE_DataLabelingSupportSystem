import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UserManagementView from "./UserManagementView";

describe("UserManagementView", () => {
  const baseProps = {
    stats: { admins: 1, workers: 1 },
    admins: [{ id: "admin-1", email: "admin@test.com" }],
    openCreateModal: vi.fn(),
    onSearch: vi.fn(),
    onEdit: vi.fn(),
    pagination: { page: 1, pageSize: 10, onPageChange: vi.fn() },
    totalCount: 1,
  };

  it("shows the dashboard notice and pending approval status for managed workers", async () => {
    const user = userEvent.setup();
    const onActive = vi.fn();

    render(
      <UserManagementView
        {...baseProps}
        onActive={onActive}
        notice={{
          title: "Pending request",
          message: "Manager approval request was sent.",
          detail: "The account stays active until the manager decides.",
        }}
        users={[
          {
            id: "worker-1",
            fullName: "Worker One",
            email: "worker@test.com",
            role: "Annotator",
            isActive: true,
            hasPendingGlobalBanRequest: true,
            totalProjects: 3,
            unfinishedProjectCount: 2,
            managerName: "Manager One",
          },
        ]}
      />,
    );

    expect(screen.getByText("Pending request")).toBeInTheDocument();
    expect(
      screen.getByText("Manager approval request was sent."),
    ).toBeInTheDocument();

    const pendingButtons = screen.getAllByRole("button", {
      name: /pendingApproval/i,
    });

    expect(pendingButtons.length).toBeGreaterThan(0);

    await user.click(pendingButtons[0]);

    expect(onActive).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "worker-1",
        hasPendingGlobalBanRequest: true,
      }),
      false,
    );
  });
});

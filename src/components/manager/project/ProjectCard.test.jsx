import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProjectCard from "./ProjectCard";

describe("ProjectCard", () => {
  it("shows unassigned lifecycle status for projects without members", () => {
    render(
      <MemoryRouter>
        <ProjectCard
          project={{
            id: 7,
            name: "Demo Project",
            totalMembers: 0,
            totalDataItems: 0,
            progress: 0,
            status: "Active",
            deadline: "2026-04-30T00:00:00",
          }}
          onDelete={() => {}}
        />
      </MemoryRouter>,
    );

    expect(screen.getAllByText("managerProjectCard.unassigned").length).toBeGreaterThan(0);
    expect(screen.queryByText("projectCard.statusActive")).not.toBeInTheDocument();
  });
});

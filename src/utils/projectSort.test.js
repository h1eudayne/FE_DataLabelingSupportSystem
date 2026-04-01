import { describe, expect, it } from "vitest";

import { sortProjectsByNewestId } from "./projectSort";

describe("projectSort", () => {
  it("sorts projects by newest numeric id first", () => {
    const projects = [
      { projectId: 3, projectName: "Project 3" },
      { projectId: 10, projectName: "Project 10" },
      { projectId: 2, projectName: "Project 2" },
      { projectId: 4, projectName: "Project 4" },
    ];

    const sorted = sortProjectsByNewestId(projects);

    expect(sorted.map((project) => project.projectId)).toEqual([10, 4, 3, 2]);
  });

  it("falls back to project name when ids are missing", () => {
    const projects = [
      { name: "Project 10" },
      { name: "Project 2" },
      { name: "Project 1" },
    ];

    const sorted = sortProjectsByNewestId(projects);

    expect(sorted.map((project) => project.name)).toEqual([
      "Project 1",
      "Project 2",
      "Project 10",
    ]);
  });
});

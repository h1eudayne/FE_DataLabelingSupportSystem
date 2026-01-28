import React from "react";
import ProjectTable from "./ProjectTable";

const ProjectStatusTable = ({ projects }) => {
  return (
    <div className="project-status-wrapper">
      <ProjectTable projects={projects} />
    </div>
  );
};

export default ProjectStatusTable;

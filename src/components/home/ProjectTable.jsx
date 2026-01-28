import { Card, Table } from "react-bootstrap";
import { ProjectProgress } from "./ProjectProgress";
import { StatusBadge } from "./StatusBadge";

const ProjectTable = ({ projects = [], title = "Tiến độ dự án" }) => (
  <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
    <Card.Header className="bg-white py-3 border-0">
      <h6 className="fw-bold mb-0">{title}</h6>
    </Card.Header>
    <div className="table-responsive">
      <Table hover className="mb-0 align-middle">
        <thead className="bg-light text-muted small text-uppercase">
          <tr>
            <th className="ps-4">Dự án</th>
            <th>Tiến độ</th>
            <th>Reviewer</th>
            <th className="pe-4 text-end">Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((proj) => (
            <tr key={proj.id}>
              <td className="ps-4 fw-bold">{proj.name}</td>
              <td>
                <ProjectProgress now={proj.progress} />
              </td>
              <td className="text-muted small">{proj.reviewerName || "N/A"}</td>
              <td className="pe-4 text-end">
                <StatusBadge progress={proj.progress} />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  </Card>
);

export default ProjectTable;

import { Card, Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { ProjectProgress } from "./ProjectProgress";
import { StatusBadge } from "./StatusBadge";

const ProjectTable = ({ projects = [], title }) => {
  const { t } = useTranslation();
  const displayTitle = title || t("homeProjectTable.title");
  return (
  <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
    <Card.Header className="bg-white py-3 border-0">
      <h6 className="fw-bold mb-0">{displayTitle}</h6>
    </Card.Header>
    <div className="table-responsive">
      <Table hover className="mb-0 align-middle">
        <thead className="bg-light text-muted small text-uppercase">
          <tr>
            <th className="ps-4">{t("homeProjectTable.colProject")}</th>
            <th>{t("homeProjectTable.colProgress")}</th>
            <th>Reviewer</th>
            <th className="pe-4 text-end">{t("homeProjectTable.colStatus")}</th>
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
};

export default ProjectTable;

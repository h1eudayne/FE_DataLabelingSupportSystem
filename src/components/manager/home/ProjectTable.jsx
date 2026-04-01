import { Card, Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { ProjectProgress } from "./ProjectProgress";
import { StatusBadge } from "./StatusBadge";

const ProjectTable = ({ projects }) => {
  const { t } = useTranslation();
  return (
  <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
    <Card.Header className="bg-white py-3 border-0">
      <h6 className="fw-bold mb-0">{t("managerProjectTable.title")}</h6>
    </Card.Header>
    <Table responsive className="mb-0 align-middle">
      <thead className="bg-light text-muted small uppercase">
        <tr>
          <th className="ps-4">{t("managerProjectTable.colProject")}</th>
          <th>{t("managerProjectTable.colProgress")}</th>
          <th>Reviewer</th>
          <th className="pe-4 text-end">{t("managerProjectTable.colStatus")}</th>
        </tr>
      </thead>
      <tbody>
        {projects.map((proj) => (
          <tr key={proj.id}>
            <td className="ps-4 fw-bold">{proj.name}</td>
            <td>
              <ProjectProgress now={proj.progress} />
            </td>
            <td className="text-muted small">{proj.reviewerName}</td>
            <td className="pe-4 text-end">
              <StatusBadge status={proj.status} />
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  </Card>
);
};
export default ProjectTable;

import { Badge } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import {
  getProjectStatusBadgeClass,
  getProjectStatusLabel,
} from "../../../utils/projectWorkflowStatus";

export const StatusBadge = ({ status }) => {
  const { t } = useTranslation();
  return (
    <Badge
      className={`bg-opacity-10 p-2 text-capitalize ${getProjectStatusBadgeClass(status)}`}
    >
      {getProjectStatusLabel(status, t)}
    </Badge>
  );
};

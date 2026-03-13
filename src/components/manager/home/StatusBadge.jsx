import { Badge } from "react-bootstrap";
import { useTranslation } from "react-i18next";

export const StatusBadge = ({ progress }) => {
  const { t } = useTranslation();
  const isDone = progress === 100;
  return (
    <Badge
      bg={isDone ? "success" : "warning"}
      className="bg-opacity-10 p-2 text-capitalize"
      style={{ color: isDone ? "#0ab39c" : "#f7b84b" }}
    >
      {isDone ? t('qualityDonut.completed') : t('performanceBar.weeklyData')}
    </Badge>
  );
};

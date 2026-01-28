import { Badge } from "react-bootstrap";

export const StatusBadge = ({ progress }) => {
  const isDone = progress === 100;
  return (
    <Badge
      bg={isDone ? "success" : "warning"}
      className="bg-opacity-10 p-2 text-capitalize"
      style={{ color: isDone ? "#0ab39c" : "#f7b84b" }}
    >
      {isDone ? "Hoàn thành" : "Đang chạy"}
    </Badge>
  );
};

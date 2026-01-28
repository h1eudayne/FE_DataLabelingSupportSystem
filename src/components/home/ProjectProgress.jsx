import { ProgressBar } from "react-bootstrap";

export const ProjectProgress = ({ now }) => (
  <div className="d-flex align-items-center gap-2" style={{ width: "160px" }}>
    <ProgressBar
      now={now}
      variant="primary"
      style={{ height: "6px", flex: 1 }}
    />
    <span className="fw-bold text-muted" style={{ fontSize: "10px" }}>
      {now}%
    </span>
  </div>
);

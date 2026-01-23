import React from "react";
import { Card, CardHeader, CardBody, Badge } from "reactstrap";

const ProjectStatusSidebar = ({ projects }) => {
  return (
    <Card className="shadow-sm border-0 h-100">
      <CardHeader className="bg-white py-3">
        <h5 className="mb-0">Chi tiết trạng thái</h5>
      </CardHeader>
      <CardBody>
        <div className="list-group list-group-flush">
          {projects.slice(0, 6).map((p, idx) => (
            <div key={idx} className="list-group-item px-0 py-3">
              <div className="d-flex align-items-start">
                <div className="flex-grow-1">
                  <h6 className="fs-14 mb-1">{p.name}</h6>
                  <p className="text-muted mb-0 fs-12">
                    Items: {p.totalDataItems}
                  </p>
                </div>
                <div className="flex-shrink-0 text-end">
                  <Badge color={p.status === "Active" ? "success" : "danger"}>
                    {p.status}
                  </Badge>
                  <div className="fw-bold mt-1 text-primary">{p.progress}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

export default ProjectStatusSidebar;

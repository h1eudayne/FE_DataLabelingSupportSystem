import React from "react";
import { Card, Button } from "react-bootstrap";
import { Info, CheckCircle2, XCircle } from "lucide-react";

const ShortcutItem = ({ icon, keyCap, label }) => (
  <div className="d-flex align-items-center justify-content-between p-3 bg-light border border-dashed rounded-3">
    <div className="d-flex align-items-center gap-3">
      <div className="bg-white border shadow-sm rounded-2 px-2 py-1 fw-bold text-primary small">
        {keyCap}
      </div>
      <span className="small fw-bold">{label}</span>
    </div>
    {icon}
  </div>
);

const ShortcutSidebar = () => (
  <Card
    className="border-0 shadow-sm p-4 sticky-top rounded-4"
    style={{ top: "20px" }}
  >
    <div className="d-flex align-items-center gap-2 mb-4">
      <div className="p-2 bg-warning bg-opacity-10 text-warning rounded">
        <Info size={20} />
      </div>
      <h6 className="fw-bold mb-0">Hướng dẫn nhanh</h6>
    </div>
    <div className="d-grid gap-3">
      <ShortcutItem
        icon={<CheckCircle2 className="text-success" />}
        keyCap="A"
        label="Approve dự án"
      />
      <ShortcutItem
        icon={<XCircle className="text-danger" />}
        keyCap="R"
        label="Reject dự án"
      />
    </div>
    <div
      className="mt-5 p-4 rounded-4 text-white text-center shadow-lg"
      style={{
        background: "linear-gradient(135deg, #405189 0%, #2a375e 100%)",
      }}
    >
      <p className="small mb-3 opacity-75">Sẵn sàng làm việc?</p>
      <Button
        variant="light"
        className="w-100 fw-bold border-0 text-primary py-2 rounded-3"
      >
        Bắt đầu ngay
      </Button>
    </div>
  </Card>
);

export default ShortcutSidebar;

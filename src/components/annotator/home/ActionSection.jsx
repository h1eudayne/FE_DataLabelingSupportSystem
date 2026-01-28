import { Card, Button } from "react-bootstrap";
import { Zap, PlayCircle, AlertTriangle } from "lucide-react";

const GuideItem = ({ text }) => (
  <div className="d-flex align-items-start gap-3">
    <div className="mt-1 p-1 bg-warning bg-opacity-10 rounded text-warning">
      <AlertTriangle size={14} />
    </div>
    <span className="small fw-semibold text-secondary">{text}</span>
  </div>
);

const ActionSection = () => (
  <>
    <Card
      className="card-custom border-0 shadow-lg mb-4 text-white rounded-2rem"
      style={{
        background: "linear-gradient(135deg, #405189 0%, #293552 100%)",
      }}
    >
      <Card.Body className="p-4 position-relative overflow-hidden">
        <Zap
          className="position-absolute"
          size={120}
          style={{
            right: "-20px",
            top: "-20px",
            opacity: 0.1,
            transform: "rotate(15deg)",
          }}
        />
        <div className="z-index-1 position-relative">
          <h4 className="fw-black mb-2">Workstation</h4>
          <p className="small mb-4 opacity-75">
            Tiếp tục thực hiện gán nhãn để đảm bảo tiến độ dự án.
          </p>
          <Button
            variant="light"
            className="w-100 fw-bold text-primary rounded-3 py-2 shadow-sm d-flex align-items-center justify-content-center gap-2 border-0"
          >
            <PlayCircle size={18} /> MỞ WORKSTATION
          </Button>
        </div>
      </Card.Body>
    </Card>

    <Card className="card-custom rounded-2rem border-0">
      <Card.Body className="p-4">
        <h6 className="fw-bold text-muted mb-4 small tracking-wider text-uppercase border-bottom pb-2">
          Hướng dẫn nhanh
        </h6>
        <div className="d-grid gap-3">
          <GuideItem text="Vẽ khung sát vật thể (Bbox)" />
          <GuideItem text="Chọn đúng nhãn loại xe tương ứng" />
          <GuideItem text="Đảm bảo độ sáng ảnh khi gán" />
        </div>
      </Card.Body>
    </Card>
  </>
);
export default ActionSection;

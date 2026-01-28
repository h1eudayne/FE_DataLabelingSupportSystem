import { Card, ListGroup, Badge } from "react-bootstrap";
import { MessageSquare, CheckCircle, Clock } from "lucide-react";

const FeedbackSection = ({ feedbacks = [] }) => (
  <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden">
    <Card.Header className="bg-white border-bottom py-3 px-4 d-flex align-items-center gap-2">
      <MessageSquare size={18} className="text-danger" />
      <h6 className="mb-0 fw-bold text-dark">Phản hồi & Chỉnh sửa</h6>
    </Card.Header>
    <Card.Body className="p-0">
      {feedbacks.length > 0 ? (
        <ListGroup variant="flush">
          {feedbacks.map((item) => (
            <ListGroup.Item key={item.id} className="p-3 border-bottom">
              <div className="d-flex justify-content-between mb-1">
                <span className="fw-bold small">{item.projectName}</span>
                <Badge bg="light" className="text-muted fw-normal border">
                  <Clock size={10} /> {item.date}
                </Badge>
              </div>
              <p className="text-muted small mb-0">{item.comment}</p>
            </ListGroup.Item>
          ))}
        </ListGroup>
      ) : (
        <div className="text-center py-5">
          <CheckCircle size={40} className="text-success opacity-25 mb-3" />
          <p className="text-muted">Chưa có phản hồi nào!</p>
        </div>
      )}
    </Card.Body>
  </Card>
);

export default FeedbackSection;

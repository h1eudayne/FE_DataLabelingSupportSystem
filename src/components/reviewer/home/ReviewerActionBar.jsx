import React from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import { Search, Filter } from "lucide-react";

const ReviewerActionBar = ({ onSearchChange }) => (
  <Row className="mb-4 g-3">
    <Col lg={10}>
      <div className="bg-white rounded-3 shadow-sm border d-flex align-items-center px-3 py-1">
        <Search size={18} className="text-muted" />
        <Form.Control
          type="text"
          placeholder="Tìm kiếm dự án hoặc ID..."
          className="border-0 shadow-none"
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </Col>
    <Col lg={2}>
      <Button
        variant="white"
        className="w-100 border bg-white shadow-sm d-flex align-items-center justify-content-center gap-2 rounded-3"
      >
        <Filter size={18} /> Bộ lọc
      </Button>
    </Col>
  </Row>
);

export default ReviewerActionBar;

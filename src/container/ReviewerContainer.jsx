import React, { useEffect, useState } from "react";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import ReviewerActionBar from "../components/reviewer/home/ReviewerActionBar";
import ShortcutSidebar from "../components/reviewer/home/ShortcutSidebar";
import ProjectCard from "../components/reviewer/home/ProjectCard";
import CommonHeader from "../components/home/CommonHeader";

const ReviewerContainer = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await projectService.getReviewProjects();
      setProjects(res.data || []);
    } catch (err) {
      console.error("Lỗi tải dự án:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toString().includes(searchTerm),
  );

  return (
    <div className="dashboard-wrapper p-4 bg-light min-vh-100">
      <Container fluid>
        <CommonHeader
          role="Reviewer"
          title="Trung tâm Kiểm duyệt"
          subtitle="Quản lý và phê duyệt chất lượng dữ liệu từ Annotators."
        />
        <ReviewerActionBar onSearchChange={setSearchTerm} />
        <Row>
          <Col xl={9} lg={8}>
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : filteredProjects.length > 0 ? (
              filteredProjects.map((item) => (
                <ProjectCard
                  key={item.id}
                  project={item}
                  onReview={(id) => {}}
                />
              ))
            ) : (
              <div className="text-center py-5 bg-white rounded-4 shadow-sm">
                <p className="text-muted mb-0">
                  Không tìm thấy dự án nào cần kiểm duyệt.
                </p>
              </div>
            )}
          </Col>
          <Col xl={3} lg={4}>
            <ShortcutSidebar />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ReviewerContainer;

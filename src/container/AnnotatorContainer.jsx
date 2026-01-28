import React, { useEffect, useState } from "react";
import { Spinner, Container } from "react-bootstrap";
import * as annotatorApi from "../services/annotator/dashboard/annotator.api";

import StatsRow from "../components/annotator/home/StatsRow";

import ActionSection from "../components/annotator/home/ActionSection";
import FeedbackSection from "../components/annotator/home/FeedbackSection";
import AnnotatorHeader from "../components/annotator/home/AnnotatorHeader";

const AnnotatorContainer = () => {
  const [data, setData] = useState({
    stats: { totalAssigned: 0, submitted: 0, inProgress: 0 },
    feedbacks: [],
    profile: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [statsData, feedbackData, profileData] = await Promise.all([
          annotatorApi.getDashboardStats(),
          annotatorApi.getAllReviewerFeedback(),
          annotatorApi.getProfile(),
        ]);
        setData({
          stats: statsData,
          feedbacks: feedbackData,
          profile: profileData,
        });
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      <AnnotatorHeader user={data.profile} />

      <Container fluid className="px-4 pb-4">
        <div className="mb-4 mt-2">
          <h4 className="fw-bold mb-1 text-dark">Bảng làm việc</h4>
          <p className="text-muted small">
            Chào mừng trở lại, bạn có phản hồi mới cần xử lý.
          </p>
        </div>

        <StatsRow stats={data.stats} />

        <div className="row g-4">
          <div className="col-lg-8">
            <FeedbackSection feedbacks={data.feedbacks} />
          </div>
          <div className="col-lg-4">
            <ActionSection />
          </div>
        </div>
      </Container>
    </div>
  );
};

export default AnnotatorContainer;

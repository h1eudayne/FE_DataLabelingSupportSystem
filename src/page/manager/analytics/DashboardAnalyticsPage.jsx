import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  Spinner,
  Table,
  Badge,
  Progress,
  Alert,
} from "reactstrap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Database,
  CheckCircle,
  Clock,
  Users,
  AlertTriangle,
  TrendingDown,
} from "lucide-react";
import StatCard from "../../../components/manager/analytics/StatCard";
import { useSelector } from "react-redux";
import analyticsService from "../../../services/manager/analytics/analyticsService";
import reviewAuditService from "../../../services/manager/review/reviewAuditService";
import disputeService from "../../../services/manager/dispute/disputeService";

const COLORS = ["#0ab39c", "#f7b84b", "#405189", "#f06548", "#299cdb"];

const EMPTY_STATS = {
  totalProjects: 0,
  completed: 0,
  inProgress: 0,
  submitted: 0,
  rejected: 0,
};

const DashboardAnalytics = () => {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [projectChartData, setProjectChartData] = useState([]);
  const [annotatorData, setAnnotatorData] = useState([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [loading, setLoading] = useState(true);

  const [rejectionRate, setRejectionRate] = useState(0);
  const [errorBreakdown, setErrorBreakdown] = useState([]);
  const [annotatorPerformances, setAnnotatorPerformances] = useState([]);
  const [labelDistributions, setLabelDistributions] = useState([]);
  const [reviewerEvaluations, setReviewerEvaluations] = useState([]);
  const [qualityAlerts, setQualityAlerts] = useState([]);

  const { user } = useSelector((state) => state.auth);
  const managerId = user?.nameid;

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        // Fetch projects and manager stats in parallel
        const [resProjects, resManagerStats] = await Promise.all([
          analyticsService.getMyProjects(managerId),
          analyticsService
            .getManagerStats(managerId)
            .catch(() => ({ data: null })),
        ]);
        const projects = resProjects.data || [];
        const managerStats = resManagerStats.data;

        let completed = 0;
        let inProgress = 0;
        let submitted = 0;
        let rejected = 0;

        let totalRejRate = 0;
        let rejRateCount = 0;
        const allErrors = {};
        const allAnnotators = [];
        const allLabels = {};

        const reviewerMap = {};
        const alerts = [];
        const chartStatsArr = [];

        for (const project of projects) {
          try {
            const res = await analyticsService.getProjectStats(project.id);
            const s = res.data;

            const totalAsgn = s.totalAssignments ?? 0;
            const approvedAsgn = s.approvedAssignments ?? 0;
            const rejAsgn = s.rejectedAssignments ?? 0;
            const subAsgn = s.submittedAssignments ?? 0;

            // Project status logic:
            // - Completed: ALL assignments approved
            // - Rejected: Has rejections but no submissions and no approvals
            // - InProgress: Any work is happening (submitted, approved partially, etc.)
            // - New: No assignments at all
            if (totalAsgn === 0) {
              // New project, no assignments
            } else if (approvedAsgn === totalAsgn) {
              completed++;
            } else if (approvedAsgn === 0 && subAsgn === 0 && rejAsgn > 0) {
              // Only has rejections, nothing submitted or approved
              rejected++;
            } else {
              // Any other state = work in progress
              inProgress++;
            }

            if (s.rejectionRate != null) {
              totalRejRate += s.rejectionRate;
              rejRateCount++;
            }

            if (s.errorBreakdown) {
              Object.entries(s.errorBreakdown).forEach(([key, val]) => {
                allErrors[key] = (allErrors[key] || 0) + val;
              });
            }

            if (s.annotatorPerformances?.length) {
              allAnnotators.push(...s.annotatorPerformances);
            }

            if (s.labelDistributions?.length) {
              s.labelDistributions.forEach((ld) => {
                allLabels[ld.className] =
                  (allLabels[ld.className] || 0) + ld.count;
              });
            }

            if (s.rejectionRate > 30) {
              alerts.push({
                type: "danger",
                icon: "ri-error-warning-line",
                message: `Dự án "${project.name}" có Rejection Rate ${s.rejectionRate.toFixed(1)}% (> 30%) — Cần xem xét lại quy trình.`,
              });
            }

            const progressPct =
              s.totalItems > 0 ? (s.completedItems / s.totalItems) * 100 : 0;
            chartStatsArr.push({
              name: project.name,
              total: Number(s.totalItems ?? project.totalDataItems ?? 0),
              completed: Number(s.completedItems ?? 0),
            });
            const daysLeft = project.deadline
              ? Math.ceil(
                  (new Date(project.deadline) - new Date()) /
                    (1000 * 60 * 60 * 24),
                )
              : null;
            if (daysLeft !== null && daysLeft < 7 && progressPct < 50) {
              alerts.push({
                type: "warning",
                icon: "ri-time-line",
                message: `Dự án "${project.name}" còn ${daysLeft} ngày nhưng tiến độ mới ${progressPct.toFixed(0)}% — Nguy cơ trễ deadline.`,
              });
            }
          } catch (err) {
            if (err.response?.status === 400) {
              chartStatsArr.push({
                name: project.name,
                total: Number(project.totalDataItems || 0),
                completed: Math.round(
                  (Number(project.totalDataItems || 0) *
                    Number(project.progress || 0)) /
                    100,
                ),
              });
              continue;
            }
            throw err;
          }

          try {
            const [resReviews, resDisputes] = await Promise.all([
              reviewAuditService.getTasksForReview(project.id),
              disputeService.getDisputes(project.id),
            ]);
            const reviews = resReviews.data || [];
            const disputes = resDisputes.data || [];

            reviews.forEach((r) => {
              const reviewerKey = r.reviewerName || r.reviewerId || "Unknown";
              if (!reviewerMap[reviewerKey]) {
                reviewerMap[reviewerKey] = {
                  name: reviewerKey,
                  totalReviews: 0,
                  overridden: 0,
                  disputeCount: 0,
                };
              }
              reviewerMap[reviewerKey].totalReviews++;
              if (
                r.managerAuditDecision !== undefined &&
                r.managerAuditDecision !== null &&
                r.managerAuditDecision === false
              ) {
                reviewerMap[reviewerKey].overridden++;
              }
            });

            disputes.forEach((d) => {
              const reviewerKey = d.reviewerName || d.reviewerId || "Unknown";
              if (!reviewerMap[reviewerKey]) {
                reviewerMap[reviewerKey] = {
                  name: reviewerKey,
                  totalReviews: 0,
                  overridden: 0,
                  disputeCount: 0,
                };
              }
              reviewerMap[reviewerKey].disputeCount++;
            });
          } catch {}
        }

        setStats({
          totalProjects: projects.length,
          completed,
          inProgress,
          submitted,
          rejected,
        });
        const avgRejRate =
          rejRateCount > 0 ? (totalRejRate / rejRateCount).toFixed(1) : 0;
        setRejectionRate(avgRejRate);
        setErrorBreakdown(
          Object.entries(allErrors).map(([name, value]) => ({ name, value })),
        );
        setLabelDistributions(
          Object.entries(allLabels).map(([name, value]) => ({ name, value })),
        );

        if (Number(avgRejRate) > 30) {
          alerts.push({
            type: "danger",
            icon: "ri-error-warning-line",
            message: `Tỷ lệ Reject trung bình ${avgRejRate}% vượt ngưỡng 30% — Cần điều chỉnh quy trình.`,
          });
        }

        const uniqueAnnotators = {};
        allAnnotators.forEach((a) => {
          if (!uniqueAnnotators[a.annotatorId]) {
            uniqueAnnotators[a.annotatorId] = {
              ...a,
              // Calculate submitted from backend data
              tasksSubmitted: Math.max(
                0,
                (a.tasksAssigned || 0) -
                  (a.tasksCompleted || 0) -
                  (a.tasksRejected || 0),
              ),
            };
          } else {
            const existing = uniqueAnnotators[a.annotatorId];
            existing.tasksAssigned += a.tasksAssigned;
            existing.tasksCompleted += a.tasksCompleted;
            existing.tasksRejected += a.tasksRejected;
            existing.totalCriticalErrors += a.totalCriticalErrors;
            // Recalculate submitted after aggregation
            existing.tasksSubmitted = Math.max(
              0,
              existing.tasksAssigned -
                existing.tasksCompleted -
                existing.tasksRejected,
            );
          }
        });
        const annotatorsArr = Object.values(uniqueAnnotators);
        setAnnotatorPerformances(annotatorsArr);

        annotatorsArr.forEach((a) => {
          if (a.totalCriticalErrors > 5) {
            alerts.push({
              type: "warning",
              icon: "ri-alarm-warning-line",
              message: `Annotator "${a.annotatorName || a.annotatorId}" có ${a.totalCriticalErrors} lỗi nghiêm trọng — Cần đào tạo lại.`,
            });
          }
        });

        setQualityAlerts(alerts);

        const reviewerEvals = Object.values(reviewerMap).map((r) => ({
          ...r,
          overrideRate:
            r.totalReviews > 0
              ? ((r.overridden / r.totalReviews) * 100).toFixed(1)
              : "0.0",
          disputeRate:
            r.totalReviews > 0
              ? ((r.disputeCount / r.totalReviews) * 100).toFixed(1)
              : "0.0",
        }));
        setReviewerEvaluations(reviewerEvals);

        setProjectChartData(chartStatsArr);

        // Use TotalMembers from manager stats API (includes annotators + reviewers + subordinates)
        setTotalMembers(managerStats?.totalMembers ?? annotatorsArr.length);

        // Top 5 annotators: count submitted + completed tasks
        setAnnotatorData(
          annotatorsArr
            .map((a) => ({
              name: a.annotatorName || a.annotatorId,
              taskCount: (a.tasksCompleted || 0) + (a.tasksSubmitted || 0),
            }))
            .sort((a, b) => b.taskCount - a.taskCount)
            .slice(0, 5),
        );
      } catch (err) {
        console.error("Analytics error:", err);
        setStats(EMPTY_STATS);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [managerId]);

  if (loading) {
    return (
      <div className="p-5 text-center">
        <Spinner color="primary" className="me-2" />
        <span>Đang phân tích dữ liệu hệ thống...</span>
      </div>
    );
  }

  return (
    <>
      <Row>
        <Col md={2}>
          <StatCard
            title="Tổng Dự án"
            value={stats.totalProjects}
            icon={Database}
            color="primary"
          />
        </Col>
        <Col md={2}>
          <StatCard
            title="Dự án hoàn thành"
            value={stats.completed}
            icon={CheckCircle}
            color="success"
          />
        </Col>
        <Col md={2}>
          <StatCard
            title="Đang thực hiện"
            value={stats.inProgress}
            icon={Clock}
            color="warning"
          />
        </Col>
        <Col md={2}>
          <StatCard
            title="Dự án bị từ chối"
            value={stats.rejected}
            icon={AlertTriangle}
            color="danger"
          />
        </Col>

        <Col md={2}>
          <StatCard
            title="Tỷ lệ Reject"
            value={`${rejectionRate}%`}
            icon={TrendingDown}
            color="danger"
          />
        </Col>
        <Col md={2}>
          <StatCard
            title="Nhân sự"
            value={totalMembers}
            icon={Users}
            color="info"
          />
        </Col>
      </Row>

      {qualityAlerts.length > 0 && (
        <Row className="mt-3">
          <Col xl={12}>
            <Card className="shadow-sm border-0">
              <CardHeader className="bg-white border-bottom">
                <h5 className="mb-0">
                  <i className="ri-alarm-warning-line me-2 text-danger"></i>
                  Cảnh báo Chất lượng
                </h5>
              </CardHeader>
              <CardBody>
                {qualityAlerts.map((alert, idx) => (
                  <Alert key={idx} color={alert.type} className="mb-2 py-2">
                    <i className={`${alert.icon} me-2`}></i>
                    {alert.message}
                  </Alert>
                ))}
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}

      <Row className="mt-3">
        <Col xl={8}>
          <Card className="shadow-sm border-0 h-100">
            <CardHeader className="bg-white border-bottom">
              <h5 className="mb-0">So sánh quy mô dữ liệu dự án</h5>
            </CardHeader>
            <CardBody>
              <div style={{ width: "100%", height: 280 }}>
                <ResponsiveContainer>
                  <BarChart data={projectChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis allowDecimals={false} fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="total"
                      fill="#405189"
                      name="Tổng dữ liệu"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="completed"
                      fill="#0ab39c"
                      name="Đã hoàn thành"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col xl={4}>
          <Card className="shadow-sm border-0 h-100">
            <CardHeader className="bg-white border-bottom">
              <h5 className="mb-0">Cơ cấu trạng thái Dự án</h5>
            </CardHeader>
            <CardBody>
              <div style={{ width: "100%", height: 280 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Hoàn thành", value: stats.completed },
                        { name: "Đang thực hiện", value: stats.inProgress },
                        { name: "Bị từ chối", value: stats.rejected },
                      ].filter((d) => d.value > 0)}
                      innerRadius={70}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={index} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row className="mt-3">
        {errorBreakdown.length > 0 && (
          <Col xl={6}>
            <Card className="shadow-sm border-0 h-100">
              <CardHeader className="bg-white border-bottom">
                <h5 className="mb-0">
                  <i className="ri-bug-line me-2 text-danger"></i>
                  Phân loại lỗi (Error Breakdown)
                </h5>
              </CardHeader>
              <CardBody>
                <div style={{ width: "100%", height: 250 }}>
                  <ResponsiveContainer>
                    <BarChart data={errorBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis allowDecimals={false} fontSize={12} />
                      <Tooltip />
                      <Bar
                        dataKey="value"
                        fill="#f06548"
                        name="Số lỗi"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>
          </Col>
        )}

        <Col xl={errorBreakdown.length > 0 ? 6 : 12}>
          <Card className="shadow-sm border-0 h-100">
            <CardHeader className="bg-white border-bottom">
              <h5 className="mb-0">
                <i className="ri-price-tag-3-line me-2 text-primary"></i>
                Phân bố nhãn (Label Distribution)
              </h5>
            </CardHeader>
            <CardBody>
              {(() => {
                const nonZeroLabels = labelDistributions.filter(
                  (l) => l.value > 0,
                );
                if (nonZeroLabels.length > 0) {
                  return (
                    <div style={{ width: "100%", height: 250 }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={nonZeroLabels}
                            innerRadius={60}
                            outerRadius={90}
                            dataKey="value"
                            label={({ name, percent }) =>
                              `${name} ${(percent * 100).toFixed(0)}%`
                            }
                          >
                            {nonZeroLabels.map((_, index) => (
                              <Cell
                                key={index}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  );
                }
                return (
                  <div className="text-center text-muted py-5">
                    <i className="ri-price-tag-3-line display-5 mb-3 d-block"></i>
                    <p>
                      {labelDistributions.length > 0
                        ? "Có nhãn nhưng chưa có annotation nào. Hãy gán nhãn cho ảnh trong dự án."
                        : "Chưa có dữ liệu nhãn. Hãy tạo nhãn và gán cho ảnh trong dự án."}
                    </p>
                  </div>
                );
              })()}
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row className="mt-3">
        <Col xl={12}>
          <Card className="shadow-sm border-0">
            <CardHeader className="bg-white border-bottom">
              <h5 className="mb-0">
                <i className="ri-user-star-line me-2 text-success"></i>
                Hiệu suất Annotator
              </h5>
            </CardHeader>
            <CardBody>
              {annotatorPerformances.length > 0 ? (
                <div className="table-responsive">
                  <Table className="table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Annotator</th>
                        <th className="text-center">Được giao</th>
                        <th className="text-center">Đã nộp</th>
                        <th className="text-center">Hoàn thành</th>
                        <th className="text-center">Bị từ chối</th>
                        <th className="text-center">Quality Score</th>
                        <th className="text-center">Lỗi nghiêm trọng</th>
                        <th>Tiến độ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {annotatorPerformances.map((a) => {
                        const totalDone =
                          (a.tasksCompleted || 0) + (a.tasksSubmitted || 0);
                        const completionRate =
                          a.tasksAssigned > 0
                            ? Math.round((totalDone / a.tasksAssigned) * 100)
                            : 0;
                        return (
                          <tr key={a.annotatorId}>
                            <td className="fw-semibold">
                              {a.annotatorName || a.annotatorId}
                            </td>
                            <td className="text-center">{a.tasksAssigned}</td>
                            <td className="text-center text-info fw-bold">
                              {a.tasksSubmitted || 0}
                            </td>
                            <td className="text-center text-success fw-bold">
                              {a.tasksCompleted}
                            </td>
                            <td className="text-center">
                              {a.tasksRejected > 0 ? (
                                <Badge color="danger">{a.tasksRejected}</Badge>
                              ) : (
                                <span className="text-muted">0</span>
                              )}
                            </td>
                            <td className="text-center">
                              <Badge
                                color={
                                  a.averageQualityScore >= 80
                                    ? "success"
                                    : a.averageQualityScore >= 50
                                      ? "warning"
                                      : "danger"
                                }
                              >
                                {(a.averageQualityScore ?? 0).toFixed(0)}
                              </Badge>
                            </td>
                            <td className="text-center">
                              {a.totalCriticalErrors > 0 ? (
                                <Badge color="danger">
                                  {a.totalCriticalErrors}
                                </Badge>
                              ) : (
                                <span className="text-muted">0</span>
                              )}
                            </td>
                            <td style={{ minWidth: "150px" }}>
                              <div className="d-flex align-items-center gap-2">
                                <Progress
                                  value={completionRate}
                                  color={
                                    completionRate >= 80
                                      ? "success"
                                      : completionRate >= 50
                                        ? "warning"
                                        : "danger"
                                  }
                                  className="flex-grow-1"
                                  style={{ height: "6px" }}
                                />
                                <small className="text-muted fw-bold">
                                  {completionRate}%
                                </small>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center text-muted py-5">
                  <i className="ri-user-star-line display-5 mb-3 d-block"></i>
                  <p>Chưa có annotator nào được giao việc.</p>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row className="mt-3">
        <Col xl={12}>
          <Card className="shadow-sm border-0">
            <CardHeader className="bg-white border-bottom">
              <h5 className="mb-0">
                <i className="ri-shield-star-line me-2 text-info"></i>
                Đánh giá Reviewer — Override Rate & Dispute Rate
              </h5>
            </CardHeader>
            <CardBody>
              <Alert color="light" className="border py-2 mb-3">
                <i className="ri-information-line me-1"></i>
                <strong>Override Rate</strong>: % reviews bị Manager đảo kết
                quả. <strong>Dispute Rate</strong>: % khiếu nại liên quan. Badge
                đỏ khi Override Rate &gt; 20% hoặc Dispute Rate &gt; 15%.
              </Alert>
              {reviewerEvaluations.length > 0 ? (
                <div className="table-responsive">
                  <Table className="table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Reviewer</th>
                        <th className="text-center">Tổng Review</th>
                        <th className="text-center">Bị Override</th>
                        <th className="text-center">Override Rate</th>
                        <th className="text-center">Disputes</th>
                        <th className="text-center">Dispute Rate</th>
                        <th className="text-center">KQS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviewerEvaluations.map((r, idx) => {
                        const overrideHigh = parseFloat(r.overrideRate) > 20;
                        const disputeHigh = parseFloat(r.disputeRate) > 15;
                        const kqsScore = Math.max(
                          0,
                          100 -
                            parseFloat(r.overrideRate) * 2 -
                            parseFloat(r.disputeRate) * 3,
                        ).toFixed(0);
                        return (
                          <tr key={idx}>
                            <td className="fw-semibold">{r.name}</td>
                            <td className="text-center">{r.totalReviews}</td>
                            <td className="text-center">
                              {r.overridden > 0 ? (
                                <Badge color="danger">{r.overridden}</Badge>
                              ) : (
                                <span className="text-muted">0</span>
                              )}
                            </td>
                            <td className="text-center">
                              <Badge
                                color={overrideHigh ? "danger" : "success"}
                              >
                                {r.overrideRate}%
                              </Badge>
                            </td>
                            <td className="text-center">
                              {r.disputeCount > 0 ? (
                                <Badge color="warning">{r.disputeCount}</Badge>
                              ) : (
                                <span className="text-muted">0</span>
                              )}
                            </td>
                            <td className="text-center">
                              <Badge color={disputeHigh ? "danger" : "success"}>
                                {r.disputeRate}%
                              </Badge>
                            </td>
                            <td className="text-center">
                              <Badge
                                color={
                                  kqsScore >= 80
                                    ? "success"
                                    : kqsScore >= 50
                                      ? "warning"
                                      : "danger"
                                }
                                className="fs-12"
                              >
                                {kqsScore}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center text-muted py-5">
                  <i className="ri-shield-star-line display-5 mb-3 d-block"></i>
                  <p>Chưa có dữ liệu đánh giá reviewer.</p>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row className="mt-3">
        <Col xl={12}>
          <Card className="shadow-sm border-0">
            <CardHeader className="bg-white border-bottom">
              <h5 className="mb-0">Top 5 Annotators làm việc hiệu quả nhất</h5>
            </CardHeader>
            <CardBody>
              <div style={{ width: "100%", height: 250 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={annotatorData}
                    layout="vertical"
                    margin={{ left: 60, right: 30 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal
                      vertical={false}
                    />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={120} />
                    <Tooltip />
                    <Bar
                      dataKey="taskCount"
                      fill="#4b38b3"
                      name="Số task hoàn thành"
                      barSize={24}
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default DashboardAnalytics;

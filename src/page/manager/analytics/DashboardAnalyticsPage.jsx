import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  Spinner,
  Table,
  Badge,
  Progress,
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

const COLORS = ["#0ab39c", "#f7b84b", "#405189", "#f06548", "#299cdb"];

const EMPTY_STATS = {
  totalAssigned: 0,
  completed: 0,
  pending: 0,
  submitted: 0,
  rejected: 0,
};

const DashboardAnalytics = () => {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [projectChartData, setProjectChartData] = useState([]);
  const [annotatorData, setAnnotatorData] = useState([]);
  const [totalAnnotators, setTotalAnnotators] = useState(0);
  const [loading, setLoading] = useState(true);

  const [rejectionRate, setRejectionRate] = useState(0);
  const [errorBreakdown, setErrorBreakdown] = useState([]);
  const [annotatorPerformances, setAnnotatorPerformances] = useState([]);
  const [labelDistributions, setLabelDistributions] = useState([]);

  const { user } = useSelector((state) => state.auth);
  const managerId = user?.nameid;

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        const resProjects = await analyticsService.getMyProjects(managerId);
        const projects = resProjects.data || [];

        let totalAssigned = 0;
        let completed = 0;
        let pending = 0;
        let submitted = 0;
        let rejected = 0;

        let totalRejRate = 0;
        let rejRateCount = 0;
        const allErrors = {};
        const allAnnotators = [];
        const allLabels = {};

        for (const project of projects) {
          try {
            const res = await analyticsService.getProjectStats(project.id);
            const s = res.data;

            totalAssigned += s.totalAssignments ?? 0;
            completed += s.approvedAssignments ?? 0;
            pending += s.pendingAssignments ?? 0;
            submitted += s.submittedAssignments ?? 0;
            rejected += s.rejectedAssignments ?? 0;

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
          } catch (err) {
            if (err.response?.status === 400) continue;
            throw err;
          }
        }

        setStats({ totalAssigned, completed, pending, submitted, rejected });
        setRejectionRate(
          rejRateCount > 0 ? (totalRejRate / rejRateCount).toFixed(1) : 0,
        );
        setErrorBreakdown(
          Object.entries(allErrors).map(([name, value]) => ({ name, value })),
        );
        setLabelDistributions(
          Object.entries(allLabels).map(([name, value]) => ({ name, value })),
        );

        const uniqueAnnotators = {};
        allAnnotators.forEach((a) => {
          if (!uniqueAnnotators[a.annotatorId]) {
            uniqueAnnotators[a.annotatorId] = { ...a };
          } else {
            const existing = uniqueAnnotators[a.annotatorId];
            existing.tasksAssigned += a.tasksAssigned;
            existing.tasksCompleted += a.tasksCompleted;
            existing.tasksRejected += a.tasksRejected;
            existing.totalCriticalErrors += a.totalCriticalErrors;
          }
        });
        setAnnotatorPerformances(Object.values(uniqueAnnotators));

        setProjectChartData(
          projects.map((p) => ({
            name: p.name,
            total: Number(p.totalDataItems || 0),
            completed: Math.round(
              (Number(p.totalDataItems || 0) * Number(p.progress || 0)) / 100,
            ),
          })),
        );

        const resUsers = await analyticsService.getUsers();
        const users = resUsers.data || [];
        const annotators = users.filter((u) => u.role === "Annotator");
        setTotalAnnotators(annotators.length);
        setAnnotatorData(
          annotators
            .map((u) => ({
              name: u.fullName || u.email?.split("@")[0],
              taskCount: u.assignments?.length || 0,
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
            title="Tổng Task"
            value={stats.totalAssigned}
            icon={Database}
            color="primary"
          />
        </Col>
        <Col md={2}>
          <StatCard
            title="Hoàn thành"
            value={stats.completed}
            icon={CheckCircle}
            color="success"
          />
        </Col>
        <Col md={2}>
          <StatCard
            title="Đang chờ"
            value={stats.pending}
            icon={Clock}
            color="warning"
          />
        </Col>
        <Col md={2}>
          <StatCard
            title="Bị từ chối"
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
            value={totalAnnotators}
            icon={Users}
            color="info"
          />
        </Col>
      </Row>

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
              <h5 className="mb-0">Cơ cấu trạng thái Task</h5>
            </CardHeader>
            <CardBody>
              <div style={{ width: "100%", height: 280 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Hoàn thành", value: stats.completed },
                        { name: "Đang chờ", value: stats.pending },
                        { name: "Đã nộp", value: stats.submitted },
                        { name: "Bị từ chối", value: stats.rejected },
                      ]}
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

        {labelDistributions.length > 0 && (
          <Col xl={errorBreakdown.length > 0 ? 6 : 12}>
            <Card className="shadow-sm border-0 h-100">
              <CardHeader className="bg-white border-bottom">
                <h5 className="mb-0">
                  <i className="ri-price-tag-3-line me-2 text-primary"></i>
                  Phân bố nhãn (Label Distribution)
                </h5>
              </CardHeader>
              <CardBody>
                <div style={{ width: "100%", height: 250 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={labelDistributions}
                        innerRadius={60}
                        outerRadius={90}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {labelDistributions.map((_, index) => (
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
              </CardBody>
            </Card>
          </Col>
        )}
      </Row>

      {annotatorPerformances.length > 0 && (
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
                <div className="table-responsive">
                  <Table className="table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Annotator</th>
                        <th className="text-center">Được giao</th>
                        <th className="text-center">Hoàn thành</th>
                        <th className="text-center">Bị từ chối</th>
                        <th className="text-center">Quality Score</th>
                        <th className="text-center">Lỗi nghiêm trọng</th>
                        <th>Tiến độ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {annotatorPerformances.map((a) => {
                        const completionRate =
                          a.tasksAssigned > 0
                            ? Math.round(
                                (a.tasksCompleted / a.tasksAssigned) * 100,
                              )
                            : 0;
                        return (
                          <tr key={a.annotatorId}>
                            <td className="fw-semibold">
                              {a.annotatorName || a.annotatorId}
                            </td>
                            <td className="text-center">{a.tasksAssigned}</td>
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
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}

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
                      name="Số task được giao"
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

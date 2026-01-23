import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  Spinner,
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
import { Database, CheckCircle, Clock, Users } from "lucide-react";
import StatCard from "../../../components/manager/analytics/StatCard";
import { analyticsService } from "../../../services/manager/analytics/analyticsService";

const COLORS = ["#0ab39c", "#f7b84b", "#f06548", "#405189"];

const DashboardAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [projectChartData, setProjectChartData] = useState([]);
  const [annotatorData, setAnnotatorData] = useState([]);
  const [totalAnnotators, setTotalAnnotators] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [resStats, resProjects, resUsers] = await Promise.all([
          analyticsService.getDashboardStats(),
          analyticsService.getMyProjects(),
          analyticsService.getUsers(),
        ]);

        const s = resStats.data || resStats;
        setStats(s);

        const projects = resProjects.data || resProjects || [];
        setProjectChartData(
          projects.map((p) => ({
            name: p.name,
            total: Number(p.totalDataItems || 0),
            completed: Math.round(
              (Number(p.totalDataItems || 0) * Number(p.progress || 0)) / 100,
            ),
          })),
        );

        const users = resUsers.data || resUsers || [];
        const annotators = users.filter((u) => u.role === "Annotator");
        setTotalAnnotators(annotators.length);

        const topAnnotators = annotators
          .map((u) => ({
            name: u.fullName || u.email.split("@")[0],
            taskCount: u.assignments?.length || 0,
          }))
          .sort((a, b) => b.taskCount - a.taskCount)
          .slice(0, 5);
        setAnnotatorData(topAnnotators);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu Analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  if (loading) {
    return (
      <div className="p-5 text-center">
        <Spinner color="primary" className="me-2" />
        <span>Đang phân tích dữ liệu hệ thống...</span>
      </div>
    );
  }

  return (
    <div className="page-content">
      <Container fluid>
        <div className="mb-4">
          <h4 className="text-uppercase fw-bold text-primary">
            Hệ thống phân tích dự án
          </h4>
          <p className="text-muted">
            Theo dõi tiến độ và năng suất gán nhãn thời gian thực.
          </p>
        </div>

        <Row>
          <Col md={3}>
            <StatCard
              title="Tổng Task Gán"
              value={stats?.totalAssigned}
              icon={Database}
              color="primary"
            />
          </Col>

          <Col md={3}>
            <StatCard
              title="Hoàn thành"
              value={stats?.completed}
              icon={CheckCircle}
              color="success"
            />
          </Col>

          <Col md={3}>
            <StatCard
              title="Đang chờ"
              value={stats?.pending}
              icon={Clock}
              color="warning"
            />
          </Col>

          <Col md={3}>
            <StatCard
              title="Nhân sự"
              value={totalAnnotators}
              icon={Users}
              color="info"
            />
          </Col>
        </Row>

        <Row className="mt-4">
          <Col xl={8}>
            <Card className="shadow-sm border-0 h-100">
              <CardHeader className="bg-white border-bottom d-flex align-items-center">
                <h5 className="mb-0 flex-grow-1">
                  So sánh quy mô dữ liệu dự án
                </h5>
              </CardHeader>
              <CardBody>
                <div style={{ width: "100%", height: 350 }}>
                  <ResponsiveContainer>
                    <BarChart data={projectChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" stroke="#888" fontSize={12} />
                      <YAxis
                        stroke="#888"
                        fontSize={12}
                        allowDecimals={false}
                      />
                      <Tooltip cursor={{ fill: "#f3f6f9" }} />
                      <Legend verticalAlign="top" align="right" />
                      <Bar
                        dataKey="total"
                        fill="#405189"
                        name="Tổng dữ liệu (Items)"
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
                <div style={{ width: "100%", height: 350 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "Hoàn thành",
                            value: Number(stats?.completed || 0),
                          },
                          {
                            name: "Đang chờ",
                            value: Number(stats?.pending || 0),
                          },
                          {
                            name: "Đã nộp",
                            value: Number(stats?.submitted || 0),
                          },
                          {
                            name: "Bị từ chối",
                            value: Number(stats?.rejected || 0),
                          },
                        ]}
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {COLORS.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
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
        </Row>

        <Row className="mt-4">
          <Col xl={12}>
            <Card className="shadow-sm border-0">
              <CardHeader className="bg-white border-bottom d-flex align-items-center">
                <h5 className="mb-0">
                  Top 5 Annotators làm việc hiệu quả nhất
                </h5>
              </CardHeader>
              <CardBody>
                <div style={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={annotatorData}
                      layout="vertical"
                      margin={{ left: 50, right: 30 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={true}
                        vertical={false}
                      />
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="name"
                        type="category"
                        stroke="#6c757d"
                        width={100}
                      />
                      <Tooltip />
                      <Bar
                        dataKey="taskCount"
                        fill="#4b38b3"
                        name="Số lượng ảnh đã gán"
                        barSize={25}
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default DashboardAnalytics;

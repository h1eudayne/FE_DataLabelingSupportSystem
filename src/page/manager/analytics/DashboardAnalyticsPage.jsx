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
import analyticsService from "../../../services/manager/analytics/analyticsService";

const COLORS = ["#0ab39c", "#f7b84b", "#405189", "#f06548"];

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

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        const resProjects = await analyticsService.getMyProjects();
        const projects = resProjects.data || [];

        let totalAssigned = 0;
        let completed = 0;
        let pending = 0;
        let submitted = 0;
        let rejected = 0;

        for (const project of projects) {
          try {
            const res = await analyticsService.getProjectStats(project.id);
            const s = res.data;

            totalAssigned += s.totalAssignments ?? 0;
            completed += s.approvedAssignments ?? 0;
            pending += s.pendingAssignments ?? 0;
            submitted += s.submittedAssignments ?? 0;
            rejected += s.rejectedAssignments ?? 0;
          } catch (err) {
            if (err.response?.status === 400) {
              console.warn(`⚠️ Project ${project.id} chưa có task → stats = 0`);
              continue;
            }
            throw err;
          }
        }

        const finalStats = {
          totalAssigned,
          completed,
          pending,
          submitted,
          rejected,
        };

        setStats(finalStats);

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
        console.error("❌ Analytics error:", err);
        setStats(EMPTY_STATS);
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
        <Row>
          <Col md={3}>
            <StatCard
              title="Tổng Task Gán"
              value={stats.totalAssigned}
              icon={Database}
              color="primary"
            />
          </Col>

          <Col md={3}>
            <StatCard
              title="Hoàn thành"
              value={stats.completed}
              icon={CheckCircle}
              color="success"
            />
          </Col>

          <Col md={3}>
            <StatCard
              title="Đang chờ"
              value={stats.pending}
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
              <CardHeader className="bg-white border-bottom">
                <h5 className="mb-0">So sánh quy mô dữ liệu dự án</h5>
              </CardHeader>
              <CardBody>
                <div style={{ width: "100%", height: 350 }}>
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

        <Row className="mt-4">
          <Col xl={12}>
            <Card className="shadow-sm border-0">
              <CardHeader className="bg-white border-bottom">
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
      </Container>
    </div>
  );
};

export default DashboardAnalytics;

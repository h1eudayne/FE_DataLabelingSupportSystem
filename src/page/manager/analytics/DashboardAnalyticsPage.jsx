import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
  Collapse,
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
  Target,
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
  const { t } = useTranslation();
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
  const [expandedAnnotators, setExpandedAnnotators] = useState({});
  const [expandedReviewers, setExpandedReviewers] = useState({});
  const [projectProgressData, setProjectProgressData] = useState([]);
  const [expandedProjects, setExpandedProjects] = useState({});
  const [avgProjectAccuracy, setAvgProjectAccuracy] = useState(null);
  const [projectAccuracies, setProjectAccuracies] = useState([]);

  const { user } = useSelector((state) => state.auth);
  const managerId = user?.id;

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        const [resProjects, resManagerStats] = await Promise.all([
          analyticsService.getMyProjects(managerId),
          analyticsService.getManagerStats(managerId).catch((err) => {
            console.warn("getManagerStats failed:", err?.message || err);
            return { data: null };
          }),
        ]);
        const projects = resProjects.data || [];
        const managerStats = resManagerStats.data;
        console.log("Manager stats API response:", managerStats);

        let completed = 0;
        let inProgress = 0;
        let submitted = 0;
        let rejected = 0;

        let totalRejRate = 0;
        let rejRateCount = 0;
        const allErrors = {};
        const allAnnotators = [];
        const allLabels = {};
        const allReviewerPerformances = [];
        let totalAccItems = 0;
        let totalAccWeighted = 0;

        const reviewerMap = {};
        const alerts = [];
        const chartStatsArr = [];
        const projectProgressArr = [];
        const projectAccuraciesArr = [];

        for (const project of projects) {
          try {
            const res = await analyticsService.getProjectStats(project.id);
            const s = res.data;

            const totalAsgn = s.totalAssignments ?? 0;
            const approvedAsgn = s.approvedAssignments ?? 0;
            const rejAsgn = s.rejectedAssignments ?? 0;
            const subAsgn = s.submittedAssignments ?? 0;

            if (totalAsgn === 0) {
            } else if (approvedAsgn === totalAsgn) {
              completed++;
            } else if (approvedAsgn === 0 && subAsgn === 0 && rejAsgn > 0) {
              rejected++;
            } else {
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
              s.annotatorPerformances.forEach((a) => {
                allAnnotators.push({
                  ...a,
                  _projectName: project.name,
                  _projectId: project.id,
                });
              });
            }

            if (s.reviewerPerformances?.length) {
              s.reviewerPerformances.forEach((rp) => {
                allReviewerPerformances.push({
                  ...rp,
                  _projectName: project.name,
                  _projectId: project.id,
                });
              });
            }

            if (s.projectAccuracy != null && s.totalItems > 0) {
              totalAccWeighted += s.projectAccuracy * s.totalItems;
              totalAccItems += s.totalItems;
            }
            projectAccuraciesArr.push({
              projectId: project.id,
              projectName: project.name,
              accuracy: s.projectAccuracy ?? 0,
              totalItems: s.totalItems ?? 0,
              completedItems: s.completedItems ?? 0,
            });

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
                message: t('analytics.alertHighRejectProject', { name: project.name, rate: s.rejectionRate.toFixed(1) }),
              });
            }

            const progressPct =
              s.totalItems > 0 ? (s.completedItems / s.totalItems) * 100 : 0;
            chartStatsArr.push({
              name: project.name,
              total: Number(s.totalItems ?? project.totalDataItems ?? 0),
              completed: Number(s.completedItems ?? 0),
            });

            const pendingAsgn = s.pendingAssignments ?? 0;
            const projAnnotators = (s.annotatorPerformances || []).map((ap) => {
              const annTotal = ap.tasksAssigned || 0;
              const annCompleted = ap.tasksCompleted || 0;
              const annRejected = ap.tasksRejected || 0;
              const annApproved = Math.max(0, annCompleted - annRejected);
              const annRemaining = Math.max(0, annTotal - annCompleted);
              const annPendingEst =
                totalAsgn > 0
                  ? Math.round((pendingAsgn * annTotal) / totalAsgn)
                  : 0;
              const annSubmittedEst = Math.max(0, annRemaining - annPendingEst);
              const annDone = annApproved + annSubmittedEst;
              return {
                id: ap.annotatorId,
                name: ap.annotatorName || ap.annotatorId,
                role: "Annotator",
                done: annDone,
                total: annTotal,
                approved: annApproved,
                submitted: annSubmittedEst,
                progress:
                  annTotal > 0 ? Math.round((annDone / annTotal) * 100) : 0,
              };
            });

            projectProgressArr.push({
              projectId: project.id,
              projectName: project.name,
              totalAssignments: totalAsgn,
              approvedAssignments: approvedAsgn,
              submittedAssignments: subAsgn,
              rejectedAssignments: rejAsgn,
              overallProgress:
                totalAsgn > 0
                  ? Math.round((approvedAsgn / totalAsgn) * 100)
                  : 0,
              annotators: projAnnotators,
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
                message: t('analytics.alertDeadlineRisk', { name: project.name, days: daysLeft, progress: progressPct.toFixed(0) }),
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
                  totalAssigned: 0,
                  overridden: 0,
                  disputeCount: 0,
                  projectDetails: {},
                };
              }
              if (!reviewerMap[reviewerKey].projectDetails[project.id]) {
                reviewerMap[reviewerKey].projectDetails[project.id] = {
                  projectName: project.name,
                  reviews: 0,
                  assigned: 0,
                  overridden: 0,
                  disputes: 0,
                };
              }
              reviewerMap[reviewerKey].totalAssigned++;
              reviewerMap[reviewerKey].projectDetails[project.id].assigned++;

              const reviewStatus = r.status || "";
              if (reviewStatus === "Approved" || reviewStatus === "Rejected") {
                reviewerMap[reviewerKey].totalReviews++;
                reviewerMap[reviewerKey].projectDetails[project.id].reviews++;
                if (
                  r.managerAuditDecision !== undefined &&
                  r.managerAuditDecision !== null &&
                  r.managerAuditDecision === false
                ) {
                  reviewerMap[reviewerKey].overridden++;
                  reviewerMap[reviewerKey].projectDetails[project.id]
                    .overridden++;
                }
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
                  projectDetails: {},
                };
              }
              reviewerMap[reviewerKey].disputeCount++;
              if (!reviewerMap[reviewerKey].projectDetails[project.id]) {
                reviewerMap[reviewerKey].projectDetails[project.id] = {
                  projectName: project.name,
                  reviews: 0,
                  overridden: 0,
                  disputes: 0,
                };
              }
              reviewerMap[reviewerKey].projectDetails[project.id].disputes++;
            });
          } catch {}
        }

        projectProgressArr.forEach((pp) => {
          const apiReviewersForProject = allReviewerPerformances.filter(
            (rp) => rp._projectId === pp.projectId,
          );

          const projectReviewers = [];
          const seenReviewers = new Set();

          apiReviewersForProject.forEach((rp) => {
            const revTotal = rp.totalReviews || 0;
            const mapData = Object.values(reviewerMap).find(
              (rm) => rm.name === rp.reviewerName,
            );
            const mapPd = mapData?.projectDetails[pp.projectId];
            const assignedTotal = mapPd?.assigned || 0;
            const effectiveTotal = Math.max(revTotal, assignedTotal);

            projectReviewers.push({
              id: rp.reviewerId,
              name: rp.reviewerName,
              role: "Reviewer",
              done: revTotal,
              total: effectiveTotal,
              progress:
                effectiveTotal > 0
                  ? Math.round((revTotal / effectiveTotal) * 100)
                  : 0,
            });
            seenReviewers.add(rp.reviewerName);
          });

          Object.values(reviewerMap).forEach((rev) => {
            if (seenReviewers.has(rev.name)) return;
            const pd = rev.projectDetails[pp.projectId];
            if (pd) {
              const revTotal = pd.assigned || 0;
              const revDone = pd.reviews || 0;
              projectReviewers.push({
                id: rev.name,
                name: rev.name,
                role: "Reviewer",
                done: revDone,
                total: revTotal,
                progress:
                  revTotal > 0 ? Math.round((revDone / revTotal) * 100) : 0,
              });
            }
          });

          pp.reviewers = projectReviewers;
        });

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
            message: t('analytics.alertHighRejectAvg', { rate: avgRejRate }),
          });
        }

        const uniqueAnnotators = {};
        allAnnotators.forEach((a) => {
          const isTaskCompleted =
            (a.tasksAssigned || 0) > 0 &&
            (a.tasksCompleted || 0) === (a.tasksAssigned || 0);

          const projectDetail = {
            projectId: a._projectId,
            projectName: a._projectName,
            totalImages: a.tasksAssigned || 0,
            completedImages: a.tasksCompleted || 0,
            rejectedImages: a.tasksRejected || 0,
            isCompleted: isTaskCompleted,
          };

          if (!uniqueAnnotators[a.annotatorId]) {
            uniqueAnnotators[a.annotatorId] = {
              annotatorId: a.annotatorId,
              annotatorName: a.annotatorName,
              totalTasks: 1,
              completedTasks: isTaskCompleted ? 1 : 0,
              totalImages: a.tasksAssigned || 0,
              completedImages: a.tasksCompleted || 0,
              rejectedImages: a.tasksRejected || 0,
              averageQualityScore: a.averageQualityScore ?? 100,
              annotatorAccuracy: a.annotatorAccuracy ?? 0,
              totalCriticalErrors: a.totalCriticalErrors || 0,
              _qualityScores: [a.averageQualityScore ?? 100],
              _accuracyScores: [
                {
                  score: a.annotatorAccuracy ?? 0,
                  weight: a.tasksAssigned || 1,
                },
              ],
              projectDetails: [projectDetail],
            };
          } else {
            const existing = uniqueAnnotators[a.annotatorId];
            existing.totalTasks += 1;
            existing.completedTasks += isTaskCompleted ? 1 : 0;
            existing.totalImages += a.tasksAssigned || 0;
            existing.completedImages += a.tasksCompleted || 0;
            existing.rejectedImages += a.tasksRejected || 0;
            existing.totalCriticalErrors += a.totalCriticalErrors || 0;
            existing._qualityScores.push(a.averageQualityScore ?? 100);
            existing.averageQualityScore =
              existing._qualityScores.reduce((s, v) => s + v, 0) /
              existing._qualityScores.length;
            existing._accuracyScores.push({
              score: a.annotatorAccuracy ?? 0,
              weight: a.tasksAssigned || 1,
            });
            const totalWeight = existing._accuracyScores.reduce(
              (s, v) => s + v.weight,
              0,
            );
            existing.annotatorAccuracy =
              totalWeight > 0
                ? existing._accuracyScores.reduce(
                    (s, v) => s + v.score * v.weight,
                    0,
                  ) / totalWeight
                : 0;
            existing.projectDetails.push(projectDetail);
          }
        });
        const annotatorsArr = Object.values(uniqueAnnotators);
        setAnnotatorPerformances(annotatorsArr);

        annotatorsArr.forEach((a) => {
          if (a.totalCriticalErrors > 5) {
            alerts.push({
              type: "warning",
              icon: "ri-alarm-warning-line",
              message: t('analytics.alertCriticalErrors', { name: a.annotatorName || a.annotatorId, count: a.totalCriticalErrors }),
            });
          }
        });

        setQualityAlerts(alerts);

        const reviewerAccuracyMap = {};
        allReviewerPerformances.forEach((rp) => {
          if (!reviewerAccuracyMap[rp.reviewerName]) {
            reviewerAccuracyMap[rp.reviewerName] = {
              totalCorrect: 0,
              totalMgrDecisions: 0,
              projectAccuracies: [],
            };
          }
          reviewerAccuracyMap[rp.reviewerName].totalCorrect +=
            rp.correctDecisions || 0;
          reviewerAccuracyMap[rp.reviewerName].totalMgrDecisions +=
            rp.totalManagerDecisions || 0;
          reviewerAccuracyMap[rp.reviewerName].projectAccuracies.push({
            projectName: rp._projectName,
            reviewerAccuracy: rp.reviewerAccuracy ?? 0,
            totalReviews: rp.totalReviews || 0,
            correctDecisions: rp.correctDecisions || 0,
            totalManagerDecisions: rp.totalManagerDecisions || 0,
          });
        });

        const reviewerEvals = Object.values(reviewerMap).map((r) => {
          const accData = reviewerAccuracyMap[r.name];
          const apiTotalReviews =
            accData?.projectAccuracies?.reduce(
              (sum, pa) => sum + (pa.totalReviews || 0),
              0,
            ) || 0;
          const effectiveTotalReviews = Math.max(
            r.totalReviews,
            apiTotalReviews,
          );

          const reviewerAccuracy =
            accData && accData.totalMgrDecisions > 0
              ? (
                  (accData.totalCorrect / accData.totalMgrDecisions) *
                  100
                ).toFixed(1)
              : "—";
          return {
            ...r,
            totalReviews: effectiveTotalReviews,
            overrideRate:
              effectiveTotalReviews > 0
                ? ((r.overridden / effectiveTotalReviews) * 100).toFixed(1)
                : "0.0",
            disputeRate:
              effectiveTotalReviews > 0
                ? ((r.disputeCount / effectiveTotalReviews) * 100).toFixed(1)
                : "0.0",
            totalProjects: Object.keys(r.projectDetails || {}).length,
            projectDetailsList: Object.values(r.projectDetails || {}),
            reviewerAccuracy,
            projectAccuracies: accData?.projectAccuracies || [],
          };
        });
        setReviewerEvaluations(reviewerEvals);

        setProjectChartData(chartStatsArr);
        setProjectProgressData(projectProgressArr);

        const allStaffIds = new Set([
          ...annotatorsArr.map((a) => a.annotatorId),
          ...Object.keys(reviewerMap),
        ]);
        const frontendStaffCount = allStaffIds.size;
        const apiMembers = managerStats?.totalMembers || 0;
        setTotalMembers(Math.max(apiMembers, frontendStaffCount));

        setAvgProjectAccuracy(
          totalAccItems > 0
            ? Math.round((totalAccWeighted / totalAccItems) * 10) / 10
            : null,
        );
        setProjectAccuracies(projectAccuraciesArr);

        setAnnotatorData(
          annotatorsArr
            .map((a) => ({
              name: a.annotatorName || a.annotatorId,
              taskCount: a.completedImages || 0,
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
        <span>{t('analytics.analyzing')}</span>
      </div>
    );
  }

  return (
    <>
      <Row>
        <Col md={2}>
          <StatCard
            title={t('analytics.totalProjects')}
            value={stats.totalProjects}
            icon={Database}
            color="primary"
          />
        </Col>
        <Col md={2}>
          <StatCard
            title={t('analytics.completedProjects')}
            value={stats.completed}
            icon={CheckCircle}
            color="success"
          />
        </Col>
        <Col md={2}>
          <StatCard
            title={t('analytics.inProgress')}
            value={stats.inProgress}
            icon={Clock}
            color="warning"
          />
        </Col>
        <Col md={2}>
          <StatCard
            title={t('analytics.rejectedProjects')}
            value={stats.rejected}
            icon={AlertTriangle}
            color="danger"
          />
        </Col>

        <Col md={2}>
          <StatCard
            title={t('analytics.rejectionRate')}
            value={`${rejectionRate}%`}
            icon={TrendingDown}
            color="danger"
          />
        </Col>
        <Col md={2}>
          <StatCard
            title={t('analytics.staff')}
            value={totalMembers}
            icon={Users}
            color="info"
          />
        </Col>
      </Row>

      {/* 1. Cảnh báo Chất lượng */}
      {qualityAlerts.length > 0 && (
        <Row className="mt-3">
          <Col xl={12}>
            <Card className="shadow-sm border-0">
              <CardHeader className="bg-white border-bottom">
                <h5 className="mb-0">
                  <i className="ri-alarm-warning-line me-2 text-danger"></i>
                  {t('analytics.qualityAlerts')}
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

      {/* 2. Charts: So sánh quy mô + Cơ cấu trạng thái */}
      <Row className="mt-3">
        <Col xl={8}>
          <Card className="shadow-sm border-0 h-100">
            <CardHeader className="bg-white border-bottom">
              <h5 className="mb-0">{t('analytics.compareDataSize')}</h5>
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
                      name={t('analytics.totalDataChart')}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="completed"
                      fill="#0ab39c"
                      name={t('analytics.completedChart')}
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
              <h5 className="mb-0">{t('analytics.projectStatusStructure')}</h5>
            </CardHeader>
            <CardBody>
              <div style={{ width: "100%", height: 280 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={[
                        { name: t('analytics.statusCompleted'), value: stats.completed },
                        { name: t('analytics.statusInProgress'), value: stats.inProgress },
                        { name: t('analytics.statusRejected'), value: stats.rejected },
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

      {/* 3. Độ chính xác dự án (PA) */}
      {projectAccuracies.length > 0 && (
        <Row className="mt-3">
          <Col xl={12}>
            <Card className="shadow-sm border-0">
              <CardHeader className="bg-white border-bottom">
                <div className="d-flex align-items-center justify-content-between">
                  <h5 className="mb-0">
                    <Target size={18} className="me-2 text-primary" />
                    {t('analytics.projectAccuracy')}
                  </h5>
                  {avgProjectAccuracy !== null && (
                    <Badge
                      color={
                        avgProjectAccuracy >= 80
                          ? "success"
                          : avgProjectAccuracy >= 50
                            ? "warning"
                            : "danger"
                      }
                      className="fs-12 px-3 py-1"
                    >
                      {t('analytics.average')}: {avgProjectAccuracy}%
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardBody>
                <p className="text-muted small mb-3">
                  <i className="ri-information-line me-1"></i>
                  PA = Tỷ lệ approved đúng từ lần review đầu tiên / Tổng data
                  items.
                </p>
                <div className="table-responsive">
                  <Table className="table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>{t('analytics.project')}</th>
                        <th className="text-center">{t('analytics.totalImages')}</th>
                        <th className="text-center">{t('analytics.completedImages')}</th>
                        <th className="text-center">Accuracy (PA)</th>
                        <th style={{ minWidth: "200px" }}>{t('analytics.accuracyProgress')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectAccuracies.map((pa) => (
                        <tr key={pa.projectId}>
                          <td className="fw-semibold">
                            <i className="ri-folder-line me-1 text-primary"></i>
                            {pa.projectName}
                          </td>
                          <td className="text-center">{pa.totalItems}</td>
                          <td className="text-center text-success fw-bold">
                            {pa.completedItems}
                          </td>
                          <td className="text-center">
                            <Badge
                              color={
                                pa.accuracy >= 80
                                  ? "success"
                                  : pa.accuracy >= 50
                                    ? "warning"
                                    : "danger"
                              }
                            >
                              {pa.accuracy > 0 ? `${pa.accuracy}%` : "—"}
                            </Badge>
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <Progress
                                value={pa.accuracy}
                                color={
                                  pa.accuracy >= 80
                                    ? "success"
                                    : pa.accuracy >= 50
                                      ? "warning"
                                      : "danger"
                                }
                                className="flex-grow-1"
                                style={{ height: "6px" }}
                              />
                              <small
                                className="text-muted fw-bold"
                                style={{ minWidth: "40px" }}
                              >
                                {pa.accuracy}%
                              </small>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}

      {/* 4. Hiệu suất Annotator */}
      <Row className="mt-3">
        <Col xl={12}>
          <Card className="shadow-sm border-0">
            <CardHeader className="bg-white border-bottom">
              <h5 className="mb-0">
                <i className="ri-user-star-line me-2 text-success"></i>
                {t('analytics.annotatorPerformance')}
              </h5>
            </CardHeader>
            <CardBody>
              {annotatorPerformances.length > 0 ? (
                <div className="table-responsive">
                  <p className="text-muted small mb-2">
                    <i className="ri-information-line me-1"></i>
                    {t('analytics.clickAnnotatorHint')}
                  </p>
                  <Table className="table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>{t('statusCommon.annotator')}</th>
                        <th className="text-center">{t('analytics.assignedTasks')}</th>
                        <th className="text-center">{t('analytics.completedTasks')}</th>
                        <th className="text-center">{t('analytics.imagesTotal')}</th>
                        <th className="text-center">{t('analytics.imagesDone')}</th>
                        <th className="text-center">{t('statusCommon.qualityScore')}</th>
                        <th className="text-center">{t('analytics.criticalErrors')}</th>
                        <th className="text-center">{t('statusCommon.accuracy')}</th>
                        <th>{t('analytics.progressImages')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {annotatorPerformances.map((a) => {
                        const completionRate =
                          a.totalImages > 0
                            ? Math.round(
                                (a.completedImages / a.totalImages) * 100,
                              )
                            : 0;
                        const isExpanded = expandedAnnotators[a.annotatorId];
                        return (
                          <React.Fragment key={a.annotatorId}>
                            {/* Summary row - per person */}
                            <tr
                              style={{ cursor: "pointer" }}
                              onClick={() =>
                                setExpandedAnnotators((prev) => ({
                                  ...prev,
                                  [a.annotatorId]: !prev[a.annotatorId],
                                }))
                              }
                              className={isExpanded ? "table-active" : ""}
                            >
                              <td className="fw-semibold">
                                <i
                                  className={`ri-arrow-${isExpanded ? "down" : "right"}-s-line me-1`}
                                ></i>
                                {a.annotatorName || a.annotatorId}
                              </td>
                              <td className="text-center">{a.totalTasks}</td>
                              <td className="text-center text-success fw-bold">
                                {a.completedTasks}
                              </td>
                              <td className="text-center">{a.totalImages}</td>
                              <td className="text-center text-info fw-bold">
                                {a.completedImages}
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
                                  {a.averageQualityScore > 0
                                    ? a.averageQualityScore.toFixed(1)
                                    : "—"}
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
                              <td className="text-center">
                                <Badge
                                  color={
                                    a.annotatorAccuracy >= 80
                                      ? "success"
                                      : a.annotatorAccuracy >= 50
                                        ? "warning"
                                        : "danger"
                                  }
                                >
                                  {a.annotatorAccuracy > 0
                                    ? `${a.annotatorAccuracy.toFixed(1)}%`
                                    : "—"}
                                </Badge>
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
                            {/* Expanded: per-project detail rows */}
                            {isExpanded &&
                              a.projectDetails?.map((pd) => {
                                const pdRate =
                                  pd.totalImages > 0
                                    ? Math.round(
                                        (pd.completedImages / pd.totalImages) *
                                          100,
                                      )
                                    : 0;
                                return (
                                  <tr
                                    key={pd.projectId}
                                    className="bg-light"
                                    style={{ fontSize: "0.85em" }}
                                  >
                                    <td className="ps-4 text-muted" colSpan={3}>
                                      <i className="ri-folder-line me-1"></i>
                                      {pd.projectName}
                                      {pd.isCompleted ? (
                                        <Badge
                                          color="success"
                                          pill
                                          className="ms-2"
                                        >
                                          {t('analytics.done')}
                                        </Badge>
                                      ) : (
                                        <Badge
                                          color="warning"
                                          pill
                                          className="ms-2"
                                        >
                                          {t('analytics.working')}
                                        </Badge>
                                      )}
                                    </td>
                                    <td className="text-center text-muted">
                                      {pd.totalImages} {t('analytics.imagesUnit')}
                                    </td>
                                    <td className="text-center text-muted">
                                      {pd.completedImages} {t('analytics.doneUnit')}
                                    </td>
                                    <td className="text-center text-muted">
                                      —
                                    </td>
                                    <td className="text-center text-muted">
                                      —
                                    </td>
                                    <td className="text-center text-muted">
                                      —
                                    </td>
                                    <td style={{ minWidth: "150px" }}>
                                      <div className="d-flex align-items-center gap-2">
                                        <Progress
                                          value={pdRate}
                                          color={
                                            pdRate >= 80
                                              ? "success"
                                              : pdRate >= 50
                                                ? "warning"
                                                : "danger"
                                          }
                                          className="flex-grow-1"
                                          style={{ height: "5px" }}
                                        />
                                        <small className="text-muted">
                                          {pd.completedImages}/{pd.totalImages}
                                        </small>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center text-muted py-5">
                  <i className="ri-user-star-line display-5 mb-3 d-block"></i>
                  <p>{t('analytics.noAnnotatorAssigned')}</p>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* 5. Đánh giá Reviewer */}
      <Row className="mt-3">
        <Col xl={12}>
          <Card className="shadow-sm border-0">
            <CardHeader className="bg-white border-bottom">
              <h5 className="mb-0">
                <i className="ri-shield-star-line me-2 text-info"></i>
                {t('analytics.reviewerEvaluation')}
              </h5>
            </CardHeader>
            <CardBody>
              <Alert color="light" className="border py-2 mb-3">
                <i className="ri-information-line me-1"></i>
                <strong>{t('analytics.reviewerAccuracyDesc')}</strong>{t('analytics.reviewerAccuracyExplain')}
                <strong> {t('analytics.disputeRateDesc')}</strong>{t('analytics.disputeRateExplain')}
              </Alert>
              {reviewerEvaluations.length > 0 ? (
                <div className="table-responsive">
                  <Table className="table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>{t('statusCommon.reviewer')}</th>
                        <th className="text-center">{t('analytics.totalReview')}</th>
                        <th className="text-center">{t('analytics.overridden')}</th>
                        <th className="text-center">{t('statusCommon.overrideRate')}</th>
                        <th className="text-center">{t('statusCommon.disputes')}</th>
                        <th className="text-center">{t('statusCommon.disputeRate')}</th>
                        <th className="text-center">{t('statusCommon.accuracy')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviewerEvaluations.map((r, idx) => {
                        const overrideHigh = parseFloat(r.overrideRate) > 20;
                        const disputeHigh = parseFloat(r.disputeRate) > 15;
                        const accValue = r.reviewerAccuracy;
                        const accNum = parseFloat(accValue);
                        const isExpanded = expandedReviewers[r.name];
                        return (
                          <React.Fragment key={idx}>
                            {/* Summary row */}
                            <tr
                              style={{ cursor: "pointer" }}
                              onClick={() =>
                                setExpandedReviewers((prev) => ({
                                  ...prev,
                                  [r.name]: !prev[r.name],
                                }))
                              }
                              className={isExpanded ? "table-active" : ""}
                            >
                              <td className="fw-semibold">
                                <i
                                  className={`ri-arrow-${isExpanded ? "down" : "right"}-s-line me-1`}
                                ></i>
                                {r.name}
                                <small className="text-muted ms-1">
                                  ({t('analytics.projectsCount', { count: r.totalProjects })})
                                </small>
                              </td>
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
                                  <Badge color="warning">
                                    {r.disputeCount}
                                  </Badge>
                                ) : (
                                  <span className="text-muted">0</span>
                                )}
                              </td>
                              <td className="text-center">
                                <Badge
                                  color={disputeHigh ? "danger" : "success"}
                                >
                                  {r.disputeRate}%
                                </Badge>
                              </td>
                              <td className="text-center">
                                <Badge
                                  color={
                                    isNaN(accNum)
                                      ? "secondary"
                                      : accNum >= 80
                                        ? "success"
                                        : accNum >= 50
                                          ? "warning"
                                          : "danger"
                                  }
                                  className="fs-12"
                                >
                                  {isNaN(accNum) ? "—" : `${accValue}%`}
                                </Badge>
                              </td>
                            </tr>
                            {/* Expanded: per-project detail */}
                            {isExpanded &&
                              r.projectDetailsList?.map((pd, pdIdx) => (
                                <tr
                                  key={pdIdx}
                                  className="bg-light"
                                  style={{ fontSize: "0.85em" }}
                                >
                                  <td className="ps-4 text-muted">
                                    <i className="ri-folder-line me-1"></i>
                                    {pd.projectName}
                                  </td>
                                  <td className="text-center">{pd.reviews}</td>
                                  <td className="text-center">
                                    {pd.overridden > 0 ? pd.overridden : "—"}
                                  </td>
                                  <td className="text-center">
                                    {pd.reviews > 0
                                      ? (
                                          (pd.overridden / pd.reviews) *
                                          100
                                        ).toFixed(1) + "%"
                                      : "—"}
                                  </td>
                                  <td className="text-center">
                                    {pd.disputes > 0 ? pd.disputes : "—"}
                                  </td>
                                  <td className="text-center">
                                    {pd.reviews > 0
                                      ? (
                                          (pd.disputes / pd.reviews) *
                                          100
                                        ).toFixed(1) + "%"
                                      : "—"}
                                  </td>
                                  <td className="text-center text-muted">—</td>
                                </tr>
                              ))}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center text-muted py-5">
                  <i className="ri-shield-star-line display-5 mb-3 d-block"></i>
                  <p>{t('analytics.noReviewerData')}</p>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* 6. Error Breakdown + Label Distribution + Top 5 */}
      <Row className="mt-3">
        {errorBreakdown.length > 0 && (
          <Col xl={6}>
            <Card className="shadow-sm border-0 h-100">
              <CardHeader className="bg-white border-bottom">
                <h5 className="mb-0">
                  <i className="ri-bug-line me-2 text-danger"></i>
                  {t('analytics.errorBreakdown')}
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
                        name={t('analytics.errorCount')}
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
                {t('analytics.labelDistribution')}
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
                        ? t('analytics.hasLabelsNoAnnotation')
                        : t('analytics.noLabelData')}
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
              <h5 className="mb-0">{t('analytics.top5Annotators')}</h5>
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
                      name={t('analytics.imagesCompleted')}
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

      {/* Section: Tiến độ cá nhân theo dự án */}
      <Row className="mt-3">
        <Col xl={12}>
          <Card className="shadow-sm border-0">
            <CardHeader className="bg-white border-bottom">
              <h5 className="mb-0">
                <i className="ri-bar-chart-grouped-line me-2 text-primary"></i>
                {t('analytics.individualProgress')}
              </h5>
            </CardHeader>
            <CardBody>
              {projectProgressData.length > 0 ? (
                <div className="table-responsive">
                  <p className="text-muted small mb-2">
                    <i className="ri-information-line me-1"></i>
                    {t('analytics.clickProjectHint')}
                    <strong className="ms-2">{t('statusCommon.overall')}</strong> {t('analytics.overallExplain')}
                  </p>
                  <Table className="table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>{t('analytics.project')}</th>
                        <th className="text-center">{t('statusCommon.total')}</th>
                        <th className="text-center">{t('statusCommon.approved')}</th>
                        <th className="text-center">{t('statusCommon.submitted')}</th>
                        <th className="text-center">{t('statusCommon.rejected')}</th>
                        <th>{t('statusCommon.overallProgress')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectProgressData.map((pp) => {
                        const isExpanded = expandedProjects[pp.projectId];
                        return (
                          <React.Fragment key={pp.projectId}>
                            {/* Project summary row */}
                            <tr
                              style={{ cursor: "pointer" }}
                              onClick={() =>
                                setExpandedProjects((prev) => ({
                                  ...prev,
                                  [pp.projectId]: !prev[pp.projectId],
                                }))
                              }
                              className={isExpanded ? "table-active" : ""}
                            >
                              <td className="fw-semibold">
                                <i
                                  className={`ri-arrow-${isExpanded ? "down" : "right"}-s-line me-1`}
                                ></i>
                                {pp.projectName}
                                <small className="text-muted ms-1">
                                  ({pp.annotators.length} annotator,{" "}
                                  {pp.reviewers.length} reviewer)
                                </small>
                              </td>
                              <td className="text-center">
                                {pp.totalAssignments}
                              </td>
                              <td className="text-center text-success fw-bold">
                                {pp.approvedAssignments}
                              </td>
                              <td className="text-center text-info">
                                {pp.submittedAssignments}
                              </td>
                              <td className="text-center text-danger">
                                {pp.rejectedAssignments}
                              </td>
                              <td style={{ minWidth: "180px" }}>
                                <div className="d-flex align-items-center gap-2">
                                  <Progress
                                    value={pp.overallProgress}
                                    color={
                                      pp.overallProgress >= 80
                                        ? "success"
                                        : pp.overallProgress >= 50
                                          ? "warning"
                                          : "danger"
                                    }
                                    className="flex-grow-1"
                                    style={{ height: "8px" }}
                                  />
                                  <small
                                    className="fw-bold"
                                    style={{ minWidth: "40px" }}
                                  >
                                    {pp.overallProgress}%
                                  </small>
                                </div>
                              </td>
                            </tr>
                            {/* Expanded: per-person rows */}
                            {isExpanded && (
                              <>
                                {pp.annotators.map((person) => (
                                  <tr
                                    key={`a-${person.id}`}
                                    className="bg-light"
                                    style={{ fontSize: "0.85em" }}
                                  >
                                    <td className="ps-4">
                                      <Badge
                                        color="primary"
                                        pill
                                        className="me-1"
                                        style={{ fontSize: "0.7em" }}
                                      >
                                        Annotator
                                      </Badge>
                                      {person.name}
                                    </td>
                                    <td className="text-center text-muted">
                                      {person.total}
                                    </td>
                                    <td className="text-center" colSpan={3}>
                                      <small className="text-muted">
                                        Submitted: {person.submitted} |
                                        Approved: {person.approved} →{" "}
                                        {person.done}/{person.total}
                                      </small>
                                    </td>
                                    <td style={{ minWidth: "180px" }}>
                                      <div className="d-flex align-items-center gap-2">
                                        <Progress
                                          value={person.progress}
                                          color="primary"
                                          className="flex-grow-1"
                                          style={{ height: "5px" }}
                                        />
                                        <small
                                          className="text-muted"
                                          style={{ minWidth: "40px" }}
                                        >
                                          {person.progress}%
                                        </small>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                                {pp.reviewers.map((person) => (
                                  <tr
                                    key={`r-${person.id}`}
                                    className="bg-light"
                                    style={{ fontSize: "0.85em" }}
                                  >
                                    <td className="ps-4">
                                      <Badge
                                        color="info"
                                        pill
                                        className="me-1"
                                        style={{ fontSize: "0.7em" }}
                                      >
                                        Reviewer
                                      </Badge>
                                      {person.name}
                                    </td>
                                    <td className="text-center text-muted">
                                      {person.total}
                                    </td>
                                    <td className="text-center" colSpan={3}>
                                      <small className="text-muted">
                                        {t('analytics.reviewed')}: {person.done}/{person.total}
                                      </small>
                                    </td>
                                    <td style={{ minWidth: "180px" }}>
                                      <div className="d-flex align-items-center gap-2">
                                        <Progress
                                          value={person.progress}
                                          color="info"
                                          className="flex-grow-1"
                                          style={{ height: "5px" }}
                                        />
                                        <small
                                          className="text-muted"
                                          style={{ minWidth: "40px" }}
                                        >
                                          {person.progress}%
                                        </small>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                                {/* Overall row */}
                                <tr
                                  className="bg-light border-bottom"
                                  style={{ fontSize: "0.85em" }}
                                >
                                  <td className="ps-4 fw-semibold">
                                    <Badge
                                      color="success"
                                      pill
                                      className="me-1"
                                      style={{ fontSize: "0.7em" }}
                                    >
                                      Overall
                                    </Badge>
                                    {t('analytics.totalProject')}
                                  </td>
                                  <td className="text-center text-muted">
                                    {pp.totalAssignments}
                                  </td>
                                  <td
                                    className="text-center fw-bold text-success"
                                    colSpan={3}
                                  >
                                    Approved: {pp.approvedAssignments}/
                                    {pp.totalAssignments}
                                  </td>
                                  <td style={{ minWidth: "180px" }}>
                                    <div className="d-flex align-items-center gap-2">
                                      <Progress
                                        value={pp.overallProgress}
                                        color="success"
                                        className="flex-grow-1"
                                        style={{ height: "5px" }}
                                      />
                                      <small
                                        className="fw-bold text-success"
                                        style={{ minWidth: "40px" }}
                                      >
                                        {pp.overallProgress}%
                                      </small>
                                    </div>
                                  </td>
                                </tr>
                              </>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center text-muted py-5">
                  <i className="ri-bar-chart-grouped-line display-5 mb-3 d-block"></i>
                  <p>{t('analytics.noProgressData')}</p>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default DashboardAnalytics;

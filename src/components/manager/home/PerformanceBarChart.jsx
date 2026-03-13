import React from "react";
import { Card, Badge } from "react-bootstrap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useTranslation } from "react-i18next";

const PerformanceBarChart = ({ weeklyData }) => {
  const { t } = useTranslation();
  const defaultData = [
    { name: t('performanceBar.mon'), total: 40 },
    { name: t('performanceBar.tue'), total: 30 },
    { name: t('performanceBar.wed'), total: 65 },
    { name: t('performanceBar.thu'), total: 45 },
    { name: t('performanceBar.fri'), total: 90 },
    { name: t('performanceBar.sat'), total: 55 },
    { name: t('performanceBar.sun'), total: 20 },
  ];

  const chartData = weeklyData || defaultData;

  return (
    <Card className="border-0 shadow-sm rounded-4 overflow-hidden h-100">
      <Card.Header className="bg-white py-3 border-0 d-flex justify-content-between align-items-center">
        <div>
          <h6 className="fw-bold mb-0">{t('performanceBar.title')}</h6>
          <small className="text-muted">{t('performanceBar.weeklyData')}</small>
        </div>
        <Badge bg="primary" className="bg-opacity-10 text-primary px-3">
          {t('performanceBar.performanceUp')}
        </Badge>
      </Card.Header>
      <Card.Body className="pt-0">
        <div style={{ width: "100%", height: 250 }}>
          <ResponsiveContainer>
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f1f1"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#abb9e8", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#abb9e8", fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: "#f3f6f9" }}
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              />
              <Bar dataKey="total" radius={[4, 4, 0, 0]} barSize={30}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 4 ? "#405189" : "#40518980"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card.Body>
    </Card>
  );
};

export default PerformanceBarChart;

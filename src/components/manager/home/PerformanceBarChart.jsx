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

const PerformanceBarChart = ({ weeklyData }) => {
  const defaultData = [
    { name: "Thứ 2", total: 40 },
    { name: "Thứ 3", total: 30 },
    { name: "Thứ 4", total: 65 },
    { name: "Thứ 5", total: 45 },
    { name: "Thứ 6", total: 90 },
    { name: "Thứ 7", total: 55 },
    { name: "CN", total: 20 },
  ];

  const chartData = weeklyData || defaultData;

  return (
    <Card className="border-0 shadow-sm rounded-4 overflow-hidden h-100">
      <Card.Header className="bg-white py-3 border-0 d-flex justify-content-between align-items-center">
        <div>
          <h6 className="fw-bold mb-0">Hiệu suất gán nhãn</h6>
          <small className="text-muted">Dữ liệu theo tuần</small>
        </div>
        <Badge bg="primary" className="bg-opacity-10 text-primary px-3">
          +12% Hiệu suất
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

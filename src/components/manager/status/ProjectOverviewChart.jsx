import React from "react";
import { Card, CardHeader, CardBody } from "reactstrap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const ProjectOverviewChart = ({ projects }) => {
  const chartData = projects.slice(0, 8).map((p) => ({
    name: p.name.length > 10 ? p.name.substring(0, 10) + "..." : p.name,
    "Đã xong": Math.round((p.totalDataItems * p.progress) / 100),
    "Còn lại":
      p.totalDataItems - Math.round((p.totalDataItems * p.progress) / 100),
  }));

  return (
    <Card className="shadow-sm border-0">
      <CardHeader className="bg-white py-3">
        <h5 className="mb-0">Quy mô & Tiến độ Projects</h5>
      </CardHeader>
      <CardBody>
        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="Đã xong" stackId="a" fill="#0ab39c" />
              <Bar dataKey="Còn lại" stackId="a" fill="#eff2f7" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  );
};

export default ProjectOverviewChart;

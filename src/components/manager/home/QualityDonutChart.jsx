import React from "react";
import { Card } from "react-bootstrap";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const QualityDonutChart = ({ data }) => {
  const chartData = [
    { name: "Hoàn thành", value: data[0] || 0 },
    { name: "Đang chờ", value: data[1] || 0 },
    { name: "Bị từ chối", value: data[2] || 0 },
  ];

  const COLORS = ["#0ab39c", "#f7b84b", "#f06548"];

  return (
    <Card className="border-0 shadow-sm rounded-4 h-100">
      <Card.Header className="bg-white border-0 py-3">
        <h6 className="fw-bold mb-0">Chất lượng dữ liệu</h6>
      </Card.Header>
      <Card.Body>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={70}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card.Body>
    </Card>
  );
};

export default QualityDonutChart;

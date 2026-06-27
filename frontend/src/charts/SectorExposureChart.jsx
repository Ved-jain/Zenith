import React from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { pieColors } from "./chartTheme";
import { formatCurrency } from "../utils/formatters";

const SectorExposureChart = ({ data }) => {
  if (!data?.length) {
    return (
      <div className="empty-state">
        <h3>No sector exposure</h3>
        <p>Sector exposure appears after holdings match seeded stocks.</p>
      </div>
    );
  }

  return (
    <div className="chart-panel chart-panel--recharts">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220} debounce={50}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="sector"
            innerRadius="52%"
            outerRadius="78%"
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell
                key={entry.sector}
                fill={pieColors[index % pieColors.length]}
              />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
            itemStyle={{ color: 'var(--text-primary)' }}
            formatter={(value) => [formatCurrency(value), "Value"]} 
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SectorExposureChart;

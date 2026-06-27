import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { chartColors } from "./chartTheme";
import { formatCurrency } from "../utils/formatters";

const AllocationChart = ({ data }) => {
  if (!data?.length) {
    return (
      <div className="empty-state">
        <h3>No allocation data</h3>
        <p>Allocation appears after this user has holdings.</p>
      </div>
    );
  }

  return (
    <div className="chart-panel chart-panel--recharts">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220} debounce={50}>
        <BarChart data={data} margin={{ top: 12, right: 18, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={chartColors.border} vertical={false} />
          <XAxis dataKey="symbol" tick={{ fill: chartColors.muted, fontSize: 12 }} />
          <YAxis tick={{ fill: chartColors.muted, fontSize: 12 }} width={74} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
            itemStyle={{ color: 'var(--text-primary)' }}
            formatter={(value) => [formatCurrency(value), "Value"]} 
          />
          <Bar dataKey="value" fill={chartColors.primary} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AllocationChart;

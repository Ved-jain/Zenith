import React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { chartColors } from "./chartTheme";
import { formatCurrency, formatDate } from "../utils/formatters";

const PortfolioPerformanceChart = ({ data }) => {
  if (!data?.length) {
    return (
      <div className="empty-state">
        <h3>No performance history</h3>
        <p>Portfolio performance appears after holdings have price history.</p>
      </div>
    );
  }

  return (
    <div className="chart-panel chart-panel--recharts">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240} debounce={50}>
        <AreaChart data={data} margin={{ top: 12, right: 18, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={chartColors.border} vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: chartColors.muted, fontSize: 12 }}
            tickFormatter={formatDate}
          />
          <YAxis tick={{ fill: chartColors.muted, fontSize: 12 }} width={74} />
          <Tooltip
            contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
            itemStyle={{ color: 'var(--text-primary)' }}
            formatter={(value) => [formatCurrency(value), "Value"]}
            labelFormatter={formatDate}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={chartColors.positive}
            fill={chartColors.surfaceMuted}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PortfolioPerformanceChart;

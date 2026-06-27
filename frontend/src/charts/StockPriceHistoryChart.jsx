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

const StockPriceHistoryChart = ({ data }) => {
  if (!data?.length) {
    return (
      <div className="empty-state">
        <h3>No price history</h3>
        <p>Price history will appear when this stock has chart data.</p>
      </div>
    );
  }

  return (
    <div className="chart-panel chart-panel--compact chart-panel--recharts">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220} debounce={50}>
        <AreaChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={chartColors.border} vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: chartColors.muted, fontSize: 11 }}
            tickFormatter={formatDate}
          />
          <YAxis tick={{ fill: chartColors.muted, fontSize: 11 }} width={62} />
          <Tooltip
            contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
            itemStyle={{ color: 'var(--text-primary)' }}
            formatter={(value) => [formatCurrency(value), "Close"]}
            labelFormatter={formatDate}
          />
          <Area
            type="monotone"
            dataKey="close"
            stroke={chartColors.positive}
            fill={chartColors.surfaceMuted}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StockPriceHistoryChart;

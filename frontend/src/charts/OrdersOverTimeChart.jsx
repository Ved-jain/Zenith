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
import { formatCompactNumber, formatCurrency, formatDate } from "../utils/formatters";

const OrdersOverTimeChart = ({ data }) => {
  if (!data?.length) {
    return (
      <div className="empty-state">
        <h3>No order timeline</h3>
        <p>Orders over time will appear after trades are placed.</p>
      </div>
    );
  }

  return (
    <div className="chart-panel chart-panel--recharts orders-timeline-chart">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240} debounce={50}>
        <AreaChart data={data} margin={{ top: 12, right: 18, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={chartColors.border} vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: chartColors.muted, fontSize: 12 }}
            tickFormatter={formatDate}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: chartColors.muted, fontSize: 12 }}
            tickFormatter={formatCompactNumber}
            width={64}
          />
          <Tooltip
            contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
            itemStyle={{ color: 'var(--text-primary)' }}
            formatter={(value, name) => {
              if (name === "totalValue") {
                return [formatCurrency(value), "Order value"];
              }

              return [formatCompactNumber(value), "Orders"];
            }}
            labelFormatter={formatDate}
          />
          <Area
            type="monotone"
            dataKey="totalOrders"
            stroke={chartColors.positive}
            fill={chartColors.surfaceMuted}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OrdersOverTimeChart;

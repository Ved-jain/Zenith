import React from "react";

export function DoughnutChart({ data }) {
  const labels = data?.labels || [];
  const values = data?.datasets?.[0]?.data || [];
  const total = values.reduce((sum, value) => sum + value, 0) || 1;

  return (
    <div className="allocation-list" aria-label="Allocation summary">
      {labels.map((label, index) => {
        const percent = Math.round((values[index] / total) * 100);
        return (
          <div className="allocation-list__row" key={label}>
            <span>{label}</span>
            <strong>{percent}%</strong>
          </div>
        );
      })}
    </div>
  );
}

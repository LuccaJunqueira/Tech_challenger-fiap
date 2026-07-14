"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface DistributionDataPoint {
  name: string;
  value: number;
}

interface TransactionDistributionChartProps {
  data: DistributionDataPoint[];
}

const COLORS = ["var(--color-neon-green)", "var(--color-neon-pink)"];

export function TransactionDistributionChart({
  data,
}: TransactionDistributionChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
          label
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--color-bg-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
          }}
          itemStyle={{ color: "var(--color-foreground)" }}
          formatter={(value: number, name: string) => [`R$ ${value.toFixed(2)}`, name]}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

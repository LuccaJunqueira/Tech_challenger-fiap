"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface BalanceDataPoint {
  date: string;
  balance: number;
}

interface BalanceLineChartProps {
  data: BalanceDataPoint[];
  title?: string;
  description?: string;
}

export function BalanceLineChart({
  data,
  title = "Gráfico de Evolução do Saldo",
  description = "Este gráfico mostra a variação do saldo total da conta ao longo do tempo. Os valores estão em Reais.",
}: BalanceLineChartProps) {
  return (
    <div>
      <h3 className="sr-only" id="balance-chart-title">
        {title}
      </h3>
      <p className="sr-only" id="balance-chart-description">
        {description}
      </p>

      <ResponsiveContainer
        width="100%"
        height={300}
        minWidth={300} 
        role="img"
        aria-labelledby="balance-chart-title balance-chart-description"
      >
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="date"
            stroke="var(--color-muted-foreground)"
            tickFormatter={(value) =>
              new Date(value).toLocaleDateString("pt-BR", {
                month: "short",
                day: "numeric",
              })
            }
          />
          <YAxis
            stroke="var(--color-muted-foreground)"
            tickFormatter={(value) => `R$ ${value.toFixed(2)}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-bg-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "var(--color-foreground)" }}
            formatter={(value: number) => `R$ ${value.toFixed(2)}`}
          />
          <Line
            type="monotone"
            dataKey="balance"
            stroke="var(--color-neon-cyan)"
            activeDot={{ r: 8, fill: "var(--color-neon-pink)" }}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

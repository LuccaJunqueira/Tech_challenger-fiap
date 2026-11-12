"use client";

import { Card } from "@bytebank/ui";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

type BalancePoint = { date: string; balance: number };
type DistributionPoint = { name: string; value: number };

function ChartSkeleton() {
  return (
    <div
      data-testid="chart-skeleton"
      aria-hidden="true"
      className="h-[300px] rounded-card bg-white/5 animate-pulse"
    />
  );
}

// Um único ponto de pré-carregamento. Os caminhos literais são os mesmos usados
// dentro do dynamic() abaixo, para o bundler resolver o mesmo módulo (um chunk).
const prefetchCharts = () => {
  void import("@/components/charts/BalanceLineChart");
  void import("@/components/charts/TransactionDistributionChart");
};

const BalanceLineChart = dynamic(
  () =>
    import("@/components/charts/BalanceLineChart").then(
      (module) => module.BalanceLineChart,
    ),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

const TransactionDistributionChart = dynamic(
  () =>
    import("@/components/charts/TransactionDistributionChart").then(
      (module) => module.TransactionDistributionChart,
    ),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

export function ChartsSection({
  balanceHistory,
  distribution,
}: {
  balanceHistory: BalancePoint[];
  distribution: DistributionPoint[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  // Renderiza só quando a seção chega perto do viewport.
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      const id = window.setTimeout(() => setVisible(true), 0);
      return () => window.clearTimeout(id);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Pré-carrega os chunks quando o navegador estiver ocioso (um gatilho só).
  useEffect(() => {
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(prefetchCharts, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }

    const id = window.setTimeout(prefetchCharts, 1500);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div
      ref={containerRef}
      className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4"
    >
      <Card className="p-4">
        <h2 className="text-base font-semibold text-foreground mb-4">
          Evolução do saldo
        </h2>
        {visible ? (
          <BalanceLineChart data={balanceHistory} />
        ) : (
          <ChartSkeleton />
        )}
      </Card>
      <Card className="p-4">
        <h2 className="text-base font-semibold text-foreground mb-4">
          Distribuição Crédito / Débito
        </h2>
        {visible ? (
          <TransactionDistributionChart data={distribution} />
        ) : (
          <ChartSkeleton />
        )}
      </Card>
    </div>
  );
}

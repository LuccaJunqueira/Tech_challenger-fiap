"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

export function TransactionFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramsString = searchParams.toString();

  const currentType = searchParams.get("type") ?? "";
  const currentPeriod = searchParams.get("period") ?? "30d";
  const currentMin = searchParams.get("min") ?? "";
  const currentMax = searchParams.get("max") ?? "";
  const currentStartDate = searchParams.get("startDate") ?? "";
  const currentEndDate = searchParams.get("endDate") ?? "";

  const [localMin, setLocalMin] = useState(currentMin);
  const [localMax, setLocalMax] = useState(currentMax);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(paramsString);
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      router.replace(`/transactions?${params.toString()}`);
    },
    [router, paramsString],
  );

  const clearFilters = useCallback(() => {
    router.replace("/transactions");
    setLocalMin("");
    setLocalMax("");
  }, [router]);

  const hasActiveFilters = currentType || currentMin || currentMax || currentPeriod !== "30d" || currentStartDate || currentEndDate;

  const isCustomPeriod = currentPeriod === "custom";

  return (
    <div className="flex gap-2 flex-wrap items-center">
      {/* Filtro por período */}
      <select
        aria-label="Filtrar por período"
        value={currentPeriod}
        onChange={(e) => {
          const value = e.target.value;
          if (value === "custom") {
            updateParams({ period: "custom" });
          } else {
            updateParams({ period: value, startDate: "", endDate: "" });
          }
        }}
        className="px-3 py-1.5 rounded-pill text-xs font-mono font-semibold bg-bg-surface border border-white/10 text-muted-foreground focus:outline-none focus:border-neon-cyan/30 focus:ring-2 focus:ring-neon-cyan/30 transition-all"
      >
        <option value="7d">Últimos 7 dias</option>
        <option value="30d">Últimos 30 dias</option>
        <option value="3m">Últimos 3 meses</option>
        <option value="all">Todo o período</option>
        <option value="custom">Personalizado</option>
      </select>

      {/* Datas personalizadas */}
      {isCustomPeriod && (
        <>
          <input
            type="date"
            aria-label="Data inicial"
            value={currentStartDate}
            onChange={(e) => updateParams({ startDate: e.target.value })}
            className="px-3 py-1.5 rounded-pill text-xs font-mono bg-bg-surface border border-white/10 text-foreground focus:outline-none focus:border-neon-cyan/30 focus:ring-2 focus:ring-neon-cyan/30 transition-all"
          />
          <input
            type="date"
            aria-label="Data final"
            value={currentEndDate}
            onChange={(e) => updateParams({ endDate: e.target.value })}
            className="px-3 py-1.5 rounded-pill text-xs font-mono bg-bg-surface border border-white/10 text-foreground focus:outline-none focus:border-neon-cyan/30 focus:ring-2 focus:ring-neon-cyan/30 transition-all"
          />
        </>
      )}

      {/* Filtro por valor mínimo */}
      <input
        type="number"
        aria-label="Valor mínimo"
        placeholder="Min R$"
        value={localMin}
        onChange={(e) => setLocalMin(e.target.value)}
        onBlur={() => updateParams({ min: localMin })}
        className="w-24 px-3 py-1.5 rounded-pill text-xs font-mono bg-bg-surface border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-neon-cyan/30 focus:ring-2 focus:ring-neon-cyan/30 transition-all"
      />

      {/* Filtro por valor máximo */}
      <input
        type="number"
        aria-label="Valor máximo"
        placeholder="Max R$"
        value={localMax}
        onChange={(e) => setLocalMax(e.target.value)}
        onBlur={() => updateParams({ max: localMax })}
        className="w-24 px-3 py-1.5 rounded-pill text-xs font-mono bg-bg-surface border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-neon-cyan/30 focus:ring-2 focus:ring-neon-cyan/30 transition-all"
      />

      {/* Limpar filtros */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="px-3 py-1.5 rounded-pill text-xs font-mono font-semibold text-neon-pink border border-neon-pink/30 hover:bg-neon-pink/10 transition-colors"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}

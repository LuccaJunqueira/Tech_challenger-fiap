"use client";

import { Search } from "lucide-react";

import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";

export function SearchBar() {
  const { inputValue, setInputValue } = useDebouncedSearch();

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input
        type="text"
        aria-label="Buscar transações"
        placeholder="Buscar por nome..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="w-full pl-9 pr-3 py-1.5 rounded-pill text-xs font-mono bg-bg-surface border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-neon-cyan/30 focus:ring-2 focus:ring-neon-cyan/30 transition-all"
      />
    </div>
  );
}

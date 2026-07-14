"use client";

import { Input } from "@bytebank/ui";
import { useMemo } from "react";

import { suggestCategory } from "@/lib/category-suggestions";

interface CategorySuggestionFieldProps {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  history: string[];
}

export function CategorySuggestionField({
  label,
  id,
  value,
  onChange,
  history,
}: CategorySuggestionFieldProps) {
  const suggestedCategory = useMemo(() => suggestCategory(value), [value]);
  const datalistId = `${id}-history`;
  const uniqueHistory = useMemo(
    () => Array.from(new Set(history.filter(Boolean))),
    [history],
  );

  return (
    <div className="space-y-1.5">
      <Input
        label={label}
        id={id}
        type="text"
        list={datalistId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <datalist id={datalistId}>
        {uniqueHistory.map((item) => (
          <option key={item} value={item} />
        ))}
      </datalist>
      {suggestedCategory && (
        <p className="text-xs text-neon-cyan flex items-center gap-1">
          <span aria-hidden="true">•</span>
          Categoria sugerida: <strong>{suggestedCategory}</strong>
        </p>
      )}
    </div>
  );
}

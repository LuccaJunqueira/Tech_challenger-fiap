"use client";

import { Children, useEffect, useRef, useState } from "react";

import { AriaLiveRegion } from "@/components/ui/AriaLiveRegion";

const PAGE_SIZE = 10;

interface TransactionListProps {
  children: React.ReactNode;
}

export function TransactionList({ children }: TransactionListProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [liveMessage, setLiveMessage] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const items = Children.toArray(children);
  const visible = items.slice(0, visibleCount);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && visibleCount < items.length) {
          const next = Math.min(visibleCount + PAGE_SIZE, items.length);
          const added = next - visibleCount;
          setVisibleCount(next);
          setLiveMessage(`${added} novas transações carregadas.`);
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [visibleCount, items.length]);

  return (
    <>
      <AriaLiveRegion message={liveMessage} id="infinite-scroll-status" />
      <ul className="space-y-2" aria-label="Lista de transações">
        {visible.length === 0 && (
          <li className="text-sm text-muted-foreground py-4 text-center">
            Nenhuma transação encontrada.
          </li>
        )}
        {visible}
      </ul>

      {visibleCount < items.length && (
        <div
          ref={sentinelRef}
          className="py-4 text-center text-sm text-muted-foreground"
          aria-hidden="true"
        >
          Carregando mais...
        </div>
      )}

      {visibleCount >= items.length && items.length > 0 && (
        <p className="py-4 text-center text-sm text-muted-foreground">
          Fim das transações
        </p>
      )}
    </>
  );
}

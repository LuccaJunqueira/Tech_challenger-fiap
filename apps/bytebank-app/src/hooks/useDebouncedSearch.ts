"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Subject } from "rxjs";

import { createDebouncedQuery } from "@/lib/search-pipeline";

export function useDebouncedSearch(delay = 300) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [inputValue, setInputValueState] = useState(
    searchParams.get("q") ?? "",
  );
  const subjectRef = useRef<Subject<string> | null>(null);
  const paramsRef = useRef(searchParams.toString());

  if (subjectRef.current === null) {
    subjectRef.current = new Subject<string>();
  }

  // Mantém os params atuais sem recriar a subscription a cada navegação.
  useEffect(() => {
    paramsRef.current = searchParams.toString();
  }, [searchParams]);

  // Sincroniza o input apenas em navegação externa (voltar/avançar).
  // O nosso router.replace não dispara popstate, então não há corrida
  // entre a digitação e a URL que está sendo atualizada.
  useEffect(() => {
    function onPopState() {
      const q = new URLSearchParams(window.location.search).get("q") ?? "";
      setInputValueState(q);
    }

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    const subscription = createDebouncedQuery(
      subjectRef.current!,
      delay,
    ).subscribe((value) => {
      const params = new URLSearchParams(paramsRef.current);

      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }

      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });

    return () => subscription.unsubscribe();
  }, [delay, pathname, router]);

  const setInputValue = useCallback((value: string) => {
    setInputValueState(value);
    subjectRef.current?.next(value);
  }, []);

  return { inputValue, setInputValue };
}

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function useDebouncedSearch(delay = 300) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [inputValue, setInputValue] = useState(searchParams.get("q") ?? "");
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const isFirstRender = useRef(true);
  const paramsString = searchParams.toString();

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams(paramsString);
      if (inputValue) {
        params.set("q", inputValue);
      } else {
        params.delete("q");
      }
      router.replace(`/transactions?${params.toString()}`);
    }, delay);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [inputValue, delay, router, paramsString]);

  return { inputValue, setInputValue };
}

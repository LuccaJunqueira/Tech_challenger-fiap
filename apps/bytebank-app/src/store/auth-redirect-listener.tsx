"use client";

import { useEffect } from "react";

import { homeUrl } from "@/lib/home-url";

import { selectIsAuthenticated } from "./authSlice";
import { useAppSelector } from "./hooks";

/**
 * 401/logout em tempo real: o Redux limpa o estado, mas nada navega sozinho —
 * o redirect do layout só roda em navegação RSC. Este listener centraliza o
 * guard que vivia dentro do new/page.tsx.
 */
export function AuthRedirectListener() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      // Full reload, não router: /login vive na bytebank-home (multizone)
      window.location.replace(homeUrl("/login"));
    }
  }, [isAuthenticated]);

  return null;
}

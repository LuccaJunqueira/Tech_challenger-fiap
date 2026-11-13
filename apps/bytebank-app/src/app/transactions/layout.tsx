import {
  type AccountOverview,
  isBackendUnavailableError,
  isUnauthorizedError,
} from "@bytebank/core";
import { redirect } from "next/navigation";

import { Sidebar } from "@/components/layout/sidebar";
import { getAccountOverview } from "@/lib/getAccountOverview";
import { homeUrl } from "@/lib/home-url";
import { toAccountOverviewDto } from "@/lib/serializers/account";
import type { RootState } from "@/store";
import { buildAccountPreloadedState } from "@/store/serverSnapshot";
import StoreProvider from "@/store/StoreProvider";

export default async function TransactionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let overview: AccountOverview | null = null;

  try {
    overview = await getAccountOverview();
  } catch (error) {
    if (isUnauthorizedError(error)) {
      redirect(homeUrl("/login"));
    }

    if (!isBackendUnavailableError(error)) {
      throw error;
    }
  }

  const dto = overview ? toAccountOverviewDto(overview) : undefined;

  // AWAIT antes de renderizar: é isso que coloca o dado no HTML (D4-2 = Snapshot).
  const preloadedState: Partial<RootState> = {
    auth: {
      user: null,
      isAuthenticated: true,
      loading: false,
      error: null,
    },
    ...(dto ? await buildAccountPreloadedState(dto) : {}),
  };

  return (
    <StoreProvider preloadedState={preloadedState}>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto lg:ml-0"
        >
          {children}
        </main>
      </div>
    </StoreProvider>
  );
}

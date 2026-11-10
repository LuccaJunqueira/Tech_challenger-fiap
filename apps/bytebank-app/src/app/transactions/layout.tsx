import { redirect } from "next/navigation";

import { Sidebar } from "@/components/layout/sidebar";
import { getAccountOverview } from "@/lib/getAccountOverview";
import { toAccountOverviewDto } from "@/lib/serializers/account";
import { getSession } from "@/lib/session";
import StoreProvider from "@/store/StoreProvider";

export default async function TransactionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session.backendToken) {
    redirect("/login");
  }

  const overview = await getAccountOverview(session.backendToken);
  const initialAccountData = overview
    ? toAccountOverviewDto(overview)
    : undefined;

  return (
    <StoreProvider
      preloadedState={{
        auth: {
          user: null,
          isAuthenticated: true,
          loading: false,
          error: null,
        },
      }}
      initialAccountData={initialAccountData}
    >
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

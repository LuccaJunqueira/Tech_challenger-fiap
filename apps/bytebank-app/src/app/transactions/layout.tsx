import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { Sidebar } from "@/components/layout/sidebar";
import { getServerAccount } from "@/lib/getServerAccount";
import { JWT_COOKIE_NAME } from "@/store/constants";
import StoreProvider from "@/store/StoreProvider";

export default async function TransactionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(JWT_COOKIE_NAME)?.value;

  if (!token) {
    redirect("/login");
  }

  const initialAccountData = await getServerAccount(token);

  return (
    <StoreProvider
      preloadedState={{
        auth: {
          token,
          user: null,
          isAuthenticated: true,
          loading: false,
          error: null,
        },
      }}
      initialAccountData={initialAccountData ?? undefined}
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

// Antes: envolvia children com TransactionsProvider (Context API)
// Depois: o Provider já está no layout raiz (StoreProvider com Redux),
// então removemos o wrapper desnecessário

import { Sidebar } from "@/components/layout/sidebar";

export default function TransactionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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
  );
}

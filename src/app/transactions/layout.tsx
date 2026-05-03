
import { Sidebar } from "@/components/layout/sidebar";
import { TransactionsProvider } from "@/context/transactions-context";

export default function TransactionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TransactionsProvider>
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
    </TransactionsProvider>
  );
}

import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { getServerAccount } from "@/lib/getServerAccount";
import { JWT_COOKIE_NAME } from "@/store/constants";

import { EditForm } from "./edit-form";

export default async function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get(JWT_COOKIE_NAME)?.value;

  if (!token) {
    redirect("/login");
  }

  const accountData = await getServerAccount(token);

  if (!accountData) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <p className="text-neon-pink">Erro ao carregar dados da conta.</p>
      </div>
    );
  }

  const transaction = accountData.transactions.find((t) => t.id === id);

  if (!transaction) {
    notFound();
  }

  const transactionHistory = accountData.transactions.flatMap((t) =>
    [t.from, t.to].filter((v): v is string => !!v && v.trim().length > 0),
  );

  return (
    <EditForm transaction={transaction} transactionHistory={transactionHistory} />
  );
}

import {
  type AccountOverview,
  isBackendUnavailableError,
  isUnauthorizedError,
} from "@bytebank/core";
import { notFound, redirect } from "next/navigation";

import { getAccountOverview } from "@/lib/getAccountOverview";
import { homeUrl } from "@/lib/home-url";
import { toAccountOverviewDto } from "@/lib/serializers/account";

import { EditForm } from "./edit-form";

export default async function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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

  if (!overview) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <p className="text-neon-pink">Erro ao carregar dados da conta.</p>
      </div>
    );
  }

  const dto = toAccountOverviewDto(overview);
  const transaction = dto.transactions.find((t) => t.id === id);

  if (!transaction) {
    notFound();
  }

  const transactionHistory = dto.transactions.flatMap((t) =>
    [t.from, t.to].filter((v): v is string => !!v && v.trim().length > 0),
  );

  return (
    <EditForm transaction={transaction} transactionHistory={transactionHistory} />
  );
}

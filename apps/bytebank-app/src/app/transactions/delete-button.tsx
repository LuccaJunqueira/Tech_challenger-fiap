"use client";

import { Button } from "@bytebank/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useDeleteTransactionMutation } from "@/store/apiSlice";

export function DeleteButton({ transactionId }: { transactionId: string }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [deleteTransaction, { isLoading }] = useDeleteTransactionMutation();

  const handleDelete = async () => {
    try {
      await deleteTransaction(transactionId).unwrap();
      setShowModal(false);
      router.refresh();
    } catch {
      // erro tratado pelo RTK Query
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        className="text-xs px-2 py-1 text-neon-pink"
        onClick={() => setShowModal(true)}
      >
        Excluir
      </Button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-bg-surface border border-border rounded-xl p-6 max-w-sm w-full mx-4 space-y-4">
            <p className="text-foreground text-sm">
              Tem certeza que deseja excluir esta transação?
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowModal(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="primary"
                className="bg-neon-pink text-black"
                disabled={isLoading}
                onClick={handleDelete}
              >
                {isLoading ? "Excluindo..." : "Excluir"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { Button } from "@bytebank/ui";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { useDeleteTransactionMutation } from "@/store/apiSlice";

interface DeleteButtonProps {
  transactionId: string;
  transactionLabel: string;
}

export function DeleteButton({ transactionId, transactionLabel }: DeleteButtonProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [deleteTransaction, { isLoading }] = useDeleteTransactionMutation();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const closeModal = useCallback(() => {
    setShowModal(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!showModal) return;

    cancelButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
        return;
      }

      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showModal, closeModal]);

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
        ref={triggerRef}
        aria-label={`Excluir transação de ${transactionLabel}`}
      >
        Excluir
      </Button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            className="bg-bg-surface border border-border rounded-xl p-6 max-w-sm w-full mx-4 space-y-4"
          >
            <p id="delete-dialog-title" className="text-foreground text-sm">
              Tem certeza que deseja excluir esta transação?
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={closeModal}
                disabled={isLoading}
                ref={cancelButtonRef}
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

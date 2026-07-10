"use client";

import { Button, Header } from "@bytebank/ui";
import { useRouter } from "next/navigation";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <div>
      <Header showLogin={false} />
      <main
        className="relative flex flex-col min-h-[90vh] bg-cover bg-center rounded-lg"
        style={{ backgroundImage: "url('/images/erro_4042.webp')" }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-start pt-16">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-modal px-16 py-4 flex flex-col items-center gap-2 text-center w-full max-w-2xl">
            <h2 className="text-2xl font-bold text-foreground">
              Algo deu errado
            </h2>
            <p className="text-sm text-muted-foreground">
              {error.message || 'Erro desconhecido'}
            </p>
          </div>
        </div>

        <div className="absolute bottom-30 left-0 right-0 flex justify-center gap-4">
          <Button onClick={() => reset()} variant="primary">
            Tentar novamente
          </Button>
          <Button onClick={() => router.back()} variant="secondary">
            Voltar
          </Button>
        </div>
      </main>
    </div>
  );
}

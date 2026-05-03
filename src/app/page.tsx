import Link from "next/link";

import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div>
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-1">
        <div
          className="
            flex flex-col items-center justify-center
            min-h-[90vh] rounded-lg bg-cover bg-center
            p-4 sm:p-6 lg:p-8
          "
          style={{ backgroundImage: "url('/images/Credit_card.webp')" }}
        >
          <div className="
            glass rounded-modal text-center
            p-6 sm:p-8 lg:p-10
            flex flex-col items-center gap-3 sm:gap-4
            w-full max-w-xs sm:max-w-md lg:max-w-lg
            mx-4
          ">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
              Bem-vindo ao ByteBank
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Gerencie suas finanças de forma fácil e eficiente.
            </p>
            <Link href="/transactions">
              <Button variant="primary" size="md">
                Comece agora
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

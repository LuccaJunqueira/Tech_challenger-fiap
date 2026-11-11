import { getSession } from "@/lib/session";

/**
 * Fronteira de credencial da infraestrutura.
 *
 * O adapter do backend depende desta interface, não de `next/headers` nem de
 * `iron-session`. O container decide qual implementação injetar, o que mantém
 * o adapter testável e o core totalmente alheio a token.
 */
export interface CredentialProvider {
  getToken(): Promise<string | null>;
}

export class SessionCredentialProvider implements CredentialProvider {
  async getToken(): Promise<string | null> {
    const session = await getSession();
    return session.backendToken ?? null;
  }
}

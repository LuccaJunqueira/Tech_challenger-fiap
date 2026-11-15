import { getErrorMessage } from "@bytebank/ui";

/**
 * O teste mora no workspace do app porque é ele que tem o Jest configurado no
 * monorepo (mesmo padrão de `src/__tests__/core`). O helper é consumido pelas
 * telas de login e de cadastro da home.
 */
describe("getErrorMessage", () => {
  it("retorna a própria string quando o erro já é texto", () => {
    expect(getErrorMessage("Falha inesperada")).toBe("Falha inesperada");
  });

  it("extrai data.error do erro do RTK Query (401 do BFF)", () => {
    expect(
      getErrorMessage({ status: 401, data: { error: "Credenciais inválidas" } }),
    ).toBe("Credenciais inválidas");
  });

  it("extrai data.message quando o BFF usa esse campo", () => {
    expect(
      getErrorMessage({ status: 400, data: { message: "Payload inválido" } }),
    ).toBe("Payload inválido");
  });

  it("extrai a string de um Error nativo", () => {
    expect(getErrorMessage(new Error("Falha inesperada"))).toBe(
      "Falha inesperada",
    );
  });

  it("payload exato que quebrava o React: { data: { error: { message, code } } }", () => {
    const message = getErrorMessage({
      data: { error: { message: "Requisição inválida", code: "BAD_REQUEST" } },
    });

    expect(message).toBe("Requisição inválida");
    expect(typeof message).toBe("string");
  });

  it("lida com { message, code } no próprio data", () => {
    expect(
      getErrorMessage({
        status: 401,
        data: { message: "Não autorizado", code: "UNAUTHORIZED" },
      }),
    ).toBe("Não autorizado");
  });

  it("usa o fallback quando não há mensagem utilizável", () => {
    const fallback = "Erro ao fazer login.";

    expect(getErrorMessage(undefined, { fallback })).toBe(fallback);
    expect(getErrorMessage({ status: 500, data: {} }, { fallback })).toBe(
      fallback,
    );
    expect(getErrorMessage({ status: 500, data: { code: 42 } }, { fallback })).toBe(
      fallback,
    );
  });

  it("nunca retorna algo que não seja string", () => {
    const shapes: unknown[] = [
      undefined,
      null,
      {},
      { data: null },
      { data: { error: {} } },
      { data: { error: { message: { code: 1 } } } },
      { status: 502 },
      0,
      true,
    ];

    for (const shape of shapes) {
      expect(typeof getErrorMessage(shape)).toBe("string");
    }
  });

  it("não repassa texto técnico do backend (ECONNREFUSED, stack, HTML)", () => {
    const fallback = "Erro ao fazer login.";

    expect(
      getErrorMessage(
        { status: 500, data: { error: "Error: connect ECONNREFUSED 127.0.0.1:3001" } },
        { fallback },
      ),
    ).toBe(fallback);

    expect(
      getErrorMessage(
        { status: 500, data: { error: "TypeError: Failed to fetch" } },
        { fallback },
      ),
    ).toBe(fallback);

    expect(
      getErrorMessage(
        {
          status: 500,
          data: {
            error: "Error: algo quebrou\n    at handler (file.js:1:2)\n    at next (file.js:3:4)",
          },
        },
        { fallback },
      ),
    ).toBe(fallback);

    expect(
      getErrorMessage(
        { status: 502, data: "<!DOCTYPE html><html><body>Bad Gateway</body></html>" },
        { fallback },
      ),
    ).toBe(fallback);

    expect(
      getErrorMessage({ status: 500, data: { error: "x".repeat(300) } }, { fallback }),
    ).toBe(fallback);
  });

  it("troca o texto do 502 pela mensagem de servidor acordando", () => {
    expect(
      getErrorMessage(
        { status: 502, data: { error: "Serviço indisponível" } },
        { statusMessages: { 502: "O servidor está acordando." } },
      ),
    ).toBe("O servidor está acordando.");
  });

  it("explica erro de rede (FETCH_ERROR) sem vazar mensagem técnica", () => {
    expect(
      getErrorMessage({
        status: "FETCH_ERROR",
        error: "TypeError: Failed to fetch",
      }),
    ).toContain("Não foi possível conectar");
  });
});

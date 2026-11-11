import {
  BackendUnavailableError,
  isBackendUnavailableError,
  isUnauthorizedError,
  UnauthorizedError,
} from "@bytebank/core";

describe("erros tipados do core", () => {
  it("reconhece as instâncias reais", () => {
    expect(isUnauthorizedError(new UnauthorizedError())).toBe(true);
    expect(isBackendUnavailableError(new BackendUnavailableError())).toBe(true);
  });

  it("reconhece o discriminante mesmo com outra cópia da classe", () => {
    // Simula um bundle duplicado: mesma forma, identidade de classe diferente.
    const duplicated = Object.assign(new Error("Não autenticado"), {
      name: "UnauthorizedError",
      code: "UNAUTHORIZED",
    });

    expect(duplicated).not.toBeInstanceOf(UnauthorizedError);
    expect(isUnauthorizedError(duplicated)).toBe(true);
  });

  it("não confunde erros comuns nem o outro tipo", () => {
    expect(isUnauthorizedError(new Error("boom"))).toBe(false);
    expect(isUnauthorizedError(new BackendUnavailableError())).toBe(false);
    expect(isBackendUnavailableError(new UnauthorizedError())).toBe(false);
  });
});

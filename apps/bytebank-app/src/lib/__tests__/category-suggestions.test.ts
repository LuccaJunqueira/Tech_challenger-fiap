import { suggestCategory } from "../category-suggestions";

describe("suggestCategory", () => {
  it("reconhece alimentação sem acento", () => {
    expect(suggestCategory("Padaria do bairro")).toBe("Alimentação");
  });

  it("reconhece transporte", () => {
    expect(suggestCategory("UBER *TRIP")).toBe("Transporte");
  });

  it("retorna null para texto curto", () => {
    expect(suggestCategory("ab")).toBeNull();
  });

  it("retorna null quando não há regra", () => {
    expect(suggestCategory("transferencia recebida")).toBeNull();
  });
});

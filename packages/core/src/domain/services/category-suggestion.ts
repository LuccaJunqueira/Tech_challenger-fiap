export interface CategoryRule {
  category: string;
  keywords: RegExp;
}

export const CATEGORY_RULES: CategoryRule[] = [
  { category: "Alimentação", keywords: /mercado|supermercado|ifood|restaurante|padaria|acougue|feira/i },
  { category: "Transporte", keywords: /uber|99|taxi|combustivel|posto|estacionamento|onibus|metro/i },
  { category: "Moradia", keywords: /aluguel|condominio|iptu|luz|energia|agua|gas/i },
  { category: "Renda", keywords: /salario|salário|pagamento|freelance|honorario/i },
  { category: "Saúde", keywords: /farmacia|farmácia|hospital|clinica|consulta|plano de saude/i },
  { category: "Lazer", keywords: /cinema|streaming|netflix|spotify|show|viagem|hotel/i },
  { category: "Educação", keywords: /faculdade|curso|escola|livro|mensalidade/i },
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function suggestCategory(text: string): string | null {
  if (!text || text.trim().length < 3) return null;
  const normalized = normalize(text);
  const match = CATEGORY_RULES.find((rule) => rule.keywords.test(normalized));
  return match?.category ?? null;
}

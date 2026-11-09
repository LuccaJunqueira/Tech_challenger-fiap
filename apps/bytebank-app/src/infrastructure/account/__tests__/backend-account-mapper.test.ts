import type { GetAccountResult } from "@bytebank/types";

import { mapAccountResponse } from "../backend-account-mapper";

const CARD_NUMBER = "4111 1111 1111 1118";
const CARD_DIGITS = "4111111111111118";
const CVC = "739"; // raro de propósito: não aparece em nenhum outro campo

function makeDto(overrides: Partial<GetAccountResult> = {}): GetAccountResult {
  return {
    account: [{ id: "acc-1", type: "Debit", userId: "user-1" }],
    transactions: [],
    cards: [
      {
        id: "card-1",
        accountId: "acc-1",
        type: "Debit",
        is_blocked: false,
        number: CARD_NUMBER,
        dueDate: "2027-01-07T00:00:00.000Z",
        functions: "Debit",
        cvc: CVC,
        paymentDate: "2027-02-07T00:00:00.000Z",
        name: "Fulana",
      },
    ],
    ...overrides,
  };
}

describe("mapAccountResponse", () => {
  it("mantém só os 4 últimos dígitos do cartão", () => {
    const { cards } = mapAccountResponse(makeDto());

    expect(cards).toHaveLength(1);
    expect(cards[0]?.last4).toBe("1118");
  });

  it("não deixa número completo nem CVC em lugar nenhum do resultado", () => {
    const serialized = JSON.stringify(mapAccountResponse(makeDto()));

    expect(serialized).not.toContain(CARD_NUMBER);
    expect(serialized).not.toContain(CARD_DIGITS);
    expect(serialized).not.toContain(CVC);
  });

  it("devolve account nulo quando o backend não traz conta", () => {
    const result = mapAccountResponse(makeDto({ account: [] }));

    expect(result.account).toBeNull();
  });
});
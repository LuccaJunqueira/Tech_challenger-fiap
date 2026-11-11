/**
 * @jest-environment node
 */

jest.mock("@/lib/backend-fetch", () => ({
  fetchBackend: jest.fn(),
}));

import {
  BackendUnavailableError,
  UnauthorizedError,
} from "@bytebank/core";
import type { GetAccountResult } from "@bytebank/types";

import { fetchBackend } from "@/lib/backend-fetch";

import { BackendAccountRepository } from "../backend-account-repository";

const fetchBackendMock = jest.mocked(fetchBackend);

const result: GetAccountResult = {
  account: [{ id: "acc-1", type: "Debit", userId: "user-1" }],
  transactions: [],
  cards: [],
};

function makeRepository(token: string | null) {
  return new BackendAccountRepository({
    getToken: jest.fn().mockResolvedValue(token),
  });
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

describe("BackendAccountRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("lança UnauthorizedError sem token e não chama o backend", async () => {
    const repository = makeRepository(null);

    await expect(repository.getOverview()).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
    expect(fetchBackendMock).not.toHaveBeenCalled();
  });

  it("lança UnauthorizedError quando o backend responde 401", async () => {
    fetchBackendMock.mockResolvedValue(new Response(null, { status: 401 }));

    await expect(makeRepository("token").getOverview()).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
  });

  it("lança BackendUnavailableError quando o fetch falha", async () => {
    fetchBackendMock.mockRejectedValue(new Error("timeout"));

    await expect(makeRepository("token").getOverview()).rejects.toBeInstanceOf(
      BackendUnavailableError,
    );
  });

  it("lança BackendUnavailableError quando o backend responde 5xx", async () => {
    fetchBackendMock.mockResolvedValue(new Response(null, { status: 503 }));

    await expect(makeRepository("token").getOverview()).rejects.toBeInstanceOf(
      BackendUnavailableError,
    );
  });

  it("devolve null quando o backend responde 404", async () => {
    fetchBackendMock.mockResolvedValue(new Response(null, { status: 404 }));

    await expect(makeRepository("token").getOverview()).resolves.toBeNull();
  });

  it("devolve o snapshot e envia o Bearer token resolvido pela credencial", async () => {
    fetchBackendMock.mockResolvedValue(jsonResponse({ result }));

    const snapshot = await makeRepository("token-abc").getOverview();

    expect(snapshot?.account?.id).toBe("acc-1");
    expect(fetchBackendMock).toHaveBeenCalledWith("/account", {
      headers: { Authorization: "Bearer token-abc" },
    });
  });
});

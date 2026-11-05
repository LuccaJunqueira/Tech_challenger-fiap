const accountResult = {
  account: [{ id: "acc-1", type: "checking", userId: "user-1" }],
  transactions: [],
  cards: [],
};

describe("getServerAccount", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    global.fetch = jest.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it("prioriza INTERNAL_API_URL e envia Bearer", async () => {
    process.env.INTERNAL_API_URL = "http://backend:3000";
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3002";

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ message: "ok", result: accountResult }),
    });

    const { getServerAccount } = await import("../getServerAccount");
    const result = await getServerAccount("token-123");

    expect(global.fetch).toHaveBeenCalledWith(
      "http://backend:3000/account",
      expect.objectContaining({
        headers: { Authorization: "Bearer token-123" },
        cache: "no-store",
      }),
    );
    expect(result).toEqual(accountResult);
  });

  it("retorna null quando a resposta não é ok", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false });

    const { getServerAccount } = await import("../getServerAccount");

    await expect(getServerAccount("token-123")).resolves.toBeNull();
  });
});

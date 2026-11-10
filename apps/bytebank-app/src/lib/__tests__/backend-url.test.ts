import { getBackendUrl } from "../backend-url";

describe("getBackendUrl", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("lança sem INTERNAL_API_URL, mesmo com NEXT_PUBLIC_API_URL definida", () => {
    delete process.env.INTERNAL_API_URL;
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3002";

    expect(() => getBackendUrl()).toThrow("INTERNAL_API_URL não configurada");
  });

  it("remove barras finais do INTERNAL_API_URL", () => {
    process.env.INTERNAL_API_URL = "http://backend:3000///";

    expect(getBackendUrl()).toBe("http://backend:3000");
  });
});

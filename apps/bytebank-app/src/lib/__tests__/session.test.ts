/**
 * @jest-environment node
 */

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

jest.mock("iron-session", () => ({
  getIronSession: jest.fn(),
}));

import { getSessionOptions } from "../session";

const originalEnv = process.env;

describe("getSessionOptions", () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("lança quando SESSION_SECRET está ausente", () => {
    delete process.env.SESSION_SECRET;

    expect(() => getSessionOptions()).toThrow(
      "SESSION_SECRET ausente ou com menos de 32 caracteres",
    );
  });

  it("lança quando SESSION_SECRET tem menos de 32 caracteres", () => {
    process.env.SESSION_SECRET = "curto-demais";

    expect(() => getSessionOptions()).toThrow(
      "SESSION_SECRET ausente ou com menos de 32 caracteres",
    );
  });

  it("devolve as opções seguras do cookie de sessão", () => {
    process.env.SESSION_SECRET = "a".repeat(32);

    const options = getSessionOptions();

    expect(options.cookieName).toBe("bytebank_session");
    expect(options.ttl).toBe(20 * 60);
    expect(options.cookieOptions?.httpOnly).toBe(true);
    expect(options.cookieOptions?.sameSite).toBe("lax");
    expect(options.cookieOptions?.secure).toBe(false);
    expect(options.cookieOptions?.path).toBe("/");
  });
});

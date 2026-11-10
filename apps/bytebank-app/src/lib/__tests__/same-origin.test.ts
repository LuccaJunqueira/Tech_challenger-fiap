/**
 * @jest-environment node
 */

import { isAllowedOrigin } from "../same-origin";

const originalEnv = process.env;

function makeRequest(origin?: string | null, host?: string) {
  const headers: Record<string, string> = {};

  if (origin !== undefined && origin !== null) {
    headers.origin = origin;
  }
  if (host) {
    headers.host = host;
  }

  return new Request("http://localhost:3001/api/test", { headers });
}

describe("isAllowedOrigin", () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("rejeita request sem Origin", () => {
    expect(isAllowedOrigin(makeRequest())).toBe(false);
  });

  it("rejeita Origin: null", () => {
    expect(isAllowedOrigin(makeRequest("null"))).toBe(false);
  });

  it("rejeita origem malformada", () => {
    expect(isAllowedOrigin(makeRequest("nao-e-url"))).toBe(false);
  });

  it("aceita quando o Origin é o próprio host da request", () => {
    expect(
      isAllowedOrigin(makeRequest("http://localhost:3001", "localhost:3001")),
    ).toBe(true);
  });

  it("aceita origem presente na ALLOWED_ORIGINS", () => {
    process.env.ALLOWED_ORIGINS = "http://localhost:3000";

    expect(isAllowedOrigin(makeRequest("http://localhost:3000"))).toBe(true);
  });

  it("rejeita origem fora da ALLOWED_ORIGINS", () => {
    process.env.ALLOWED_ORIGINS = "http://localhost:3000";

    expect(isAllowedOrigin(makeRequest("https://evil.example"))).toBe(false);
  });

  it("normaliza barra final e espaços da ALLOWED_ORIGINS", () => {
    process.env.ALLOWED_ORIGINS = " http://localhost:3000/ , http://foo:1/ ";

    expect(isAllowedOrigin(makeRequest("http://localhost:3000"))).toBe(true);
  });
});

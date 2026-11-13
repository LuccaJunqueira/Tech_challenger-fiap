import { homeUrl } from "../home-url";

const originalEnv = process.env;

describe("homeUrl", () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.NEXT_PUBLIC_HOME_URL;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("mantém o path relativo quando a home não está configurada", () => {
    expect(homeUrl("/login")).toBe("/login");
  });

  it("monta a URL absoluta da home", () => {
    process.env.NEXT_PUBLIC_HOME_URL = "https://bytebank-home.vercel.app";

    expect(homeUrl("/login")).toBe(
      "https://bytebank-home.vercel.app/login",
    );
  });

  it("remove barras finais da base", () => {
    process.env.NEXT_PUBLIC_HOME_URL = "https://bytebank-home.vercel.app///";

    expect(homeUrl("/login")).toBe(
      "https://bytebank-home.vercel.app/login",
    );
  });

  it("usa a raiz como path padrão", () => {
    process.env.NEXT_PUBLIC_HOME_URL = "https://bytebank-home.vercel.app";

    expect(homeUrl()).toBe("https://bytebank-home.vercel.app/");
  });
});

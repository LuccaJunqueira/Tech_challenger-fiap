import reducer, { logout, setCredentials } from "../authSlice";

describe("authSlice", () => {
  it("setCredentials marca autenticado", () => {
    const state = reducer(undefined, setCredentials({ token: "abc" }));

    expect(state.token).toBe("abc");
    expect(state.isAuthenticated).toBe(true);
  });

  it("logout limpa a sessão", () => {
    const logged = reducer(undefined, setCredentials({ token: "abc" }));
    const state = reducer(logged, logout());

    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});

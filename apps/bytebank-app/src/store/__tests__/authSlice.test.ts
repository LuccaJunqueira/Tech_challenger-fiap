import reducer, { logout, setAuthenticated } from "../authSlice";

describe("authSlice", () => {
  it("setAuthenticated marca autenticado sem guardar token", () => {
    const state = reducer(undefined, setAuthenticated());

    expect(state.isAuthenticated).toBe(true);
    expect("token" in state).toBe(false);
  });

  it("logout limpa a sessão", () => {
    const logged = reducer(undefined, setAuthenticated());
    const state = reducer(logged, logout());

    expect(state.isAuthenticated).toBe(false);
  });
});

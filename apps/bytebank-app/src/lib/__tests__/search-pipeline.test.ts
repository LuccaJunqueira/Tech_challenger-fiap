import { TestScheduler } from "rxjs/testing";

import { createDebouncedQuery } from "../search-pipeline";

describe("createDebouncedQuery", () => {
  it("faz debounce e suprime valores repetidos", () => {
    const scheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });

    scheduler.run(({ cold, expectObservable }) => {
      // duas emissões iguais: a primeira sai em 2; a segunda (em 10) é suprimida
      const input$ = cold("a---------a", { a: "alu" });

      expectObservable(createDebouncedQuery(input$, 2)).toBe("--a-----------", {
        a: "alu",
      });
    });
  });
});

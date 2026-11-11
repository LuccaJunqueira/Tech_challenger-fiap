import { debounceTime, distinctUntilChanged, type Observable } from "rxjs";

export function createDebouncedQuery(
  input$: Observable<string>,
  delay = 300,
): Observable<string> {
  return input$.pipe(debounceTime(delay), distinctUntilChanged());
}

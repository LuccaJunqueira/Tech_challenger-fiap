import { act, renderHook } from "@testing-library/react";
import { StrictMode } from "react";

const mockReplace = jest.fn();
const mockRouter = { replace: mockReplace };
let mockParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  usePathname: () => "/transactions",
  useSearchParams: () => mockParams,
}));

import { useDebouncedSearch } from "../useDebouncedSearch";

function emitAndWait(
  result: { current: { setInputValue: (value: string) => void } },
  value: string,
) {
  act(() => {
    result.current.setInputValue(value);
  });
  act(() => {
    jest.advanceTimersByTime(300);
  });
}

describe("useDebouncedSearch", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockReplace.mockClear();
    mockParams = new URLSearchParams();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("emite uma vez após 300ms", () => {
    const { result } = renderHook(() => useDebouncedSearch(300));

    act(() => {
      result.current.setInputValue("a");
      result.current.setInputValue("al");
      result.current.setInputValue("alu");
    });

    act(() => {
      jest.advanceTimersByTime(299);
    });
    expect(mockReplace).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });

    expect(mockReplace).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith("/transactions?q=alu", {
      scroll: false,
    });
  });

  it("não emite após desmontar", () => {
    const { result, unmount } = renderHook(() => useDebouncedSearch(300));

    act(() => {
      result.current.setInputValue("alu");
    });

    unmount();

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("distinctUntilChanged: o mesmo texto não reemite", () => {
    const { result } = renderHook(() => useDebouncedSearch(300));

    emitAndWait(result, "alu");
    emitAndWait(result, "alu");

    expect(mockReplace).toHaveBeenCalledTimes(1);
  });

  it("apagar o texto remove ?q= e preserva outros params", () => {
    mockParams = new URLSearchParams("type=Debit&q=old");
    const { result } = renderHook(() => useDebouncedSearch(300));

    emitAndWait(result, "");

    expect(mockReplace).toHaveBeenCalledWith("/transactions?type=Debit", {
      scroll: false,
    });
  });

  it("preserva ?type=Debit ao buscar", () => {
    mockParams = new URLSearchParams("type=Debit");
    const { result } = renderHook(() => useDebouncedSearch(300));

    emitAndWait(result, "alu");

    expect(mockReplace).toHaveBeenCalledWith(
      "/transactions?type=Debit&q=alu",
      { scroll: false },
    );
  });

  it("StrictMode não duplica a emissão", () => {
    const { result } = renderHook(() => useDebouncedSearch(300), {
      wrapper: StrictMode,
    });

    emitAndWait(result, "alu");

    expect(mockReplace).toHaveBeenCalledTimes(1);
  });
});

import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

jest.mock("@bytebank/ui", () => ({
  Card: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

jest.mock("next/dynamic", () => ({
  __esModule: true,
  default: () => ({ data }: { data: unknown[] }) => (
    <div data-testid="chart" data-length={data.length} />
  ),
}));

jest.mock("@/components/charts/BalanceLineChart", () => ({
  BalanceLineChart: () => null,
}));
jest.mock("@/components/charts/TransactionDistributionChart", () => ({
  TransactionDistributionChart: () => null,
}));

import { ChartsSection } from "../charts-section";

let mockIsIntersecting = true;

class MockIntersectionObserver {
  private callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }

  observe() {
    this.callback(
      [{ isIntersecting: mockIsIntersecting } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }

  disconnect() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
  root = null;
  rootMargin = "";
  thresholds = [];
}

beforeAll(() => {
  global.IntersectionObserver =
    MockIntersectionObserver as unknown as typeof IntersectionObserver;
});

beforeEach(() => {
  mockIsIntersecting = true;
});

const balanceHistory = [
  { date: "2026-01-01T00:00:00.000Z", balance: 100 },
  { date: "2026-01-02T00:00:00.000Z", balance: 60 },
];
const distribution = [
  { name: "Entradas", value: 100 },
  { name: "Saídas", value: 40 },
];

it("renderiza títulos e repassa as props", () => {
  render(
    <ChartsSection
      balanceHistory={balanceHistory}
      distribution={distribution}
    />,
  );

  expect(screen.getByText("Evolução do saldo")).toBeInTheDocument();
  expect(
    screen.getByText("Distribuição Crédito / Débito"),
  ).toBeInTheDocument();
  const charts = screen.getAllByTestId("chart");
  expect(charts).toHaveLength(2);
  expect(charts.map((chart) => chart.getAttribute("data-length"))).toEqual([
    "2",
    "2",
  ]);
});

it("mostra o skeleton antes de entrar no viewport", () => {
  mockIsIntersecting = false;

  render(
    <ChartsSection
      balanceHistory={balanceHistory}
      distribution={distribution}
    />,
  );

  expect(screen.getAllByTestId("chart-skeleton")).toHaveLength(2);
  expect(screen.queryAllByTestId("chart")).toHaveLength(0);
});

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BalanceLineChart } from "./BalanceLineChart";

const meta: Meta<typeof BalanceLineChart> = {
  title: "Charts/BalanceLineChart",
  component: BalanceLineChart,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: [
      { date: "2026-01-01", balance: 5000 },
      { date: "2026-01-15", balance: 6200 },
      { date: "2026-02-01", balance: 5800 },
      { date: "2026-02-15", balance: 7100 },
      { date: "2026-03-01", balance: 6900 },
    ],
  },
};

export const Declinio: Story = {
  args: {
    data: [
      { date: "2026-01-01", balance: 10000 },
      { date: "2026-01-15", balance: 8500 },
      { date: "2026-02-01", balance: 7200 },
      { date: "2026-02-15", balance: 6400 },
    ],
  },
};

export const Volatil: Story = {
  args: {
    data: [
      { date: "2026-01-01", balance: 5000 },
      { date: "2026-01-10", balance: 8000 },
      { date: "2026-01-20", balance: 3000 },
      { date: "2026-02-01", balance: 9000 },
      { date: "2026-02-10", balance: 4000 },
    ],
  },
};

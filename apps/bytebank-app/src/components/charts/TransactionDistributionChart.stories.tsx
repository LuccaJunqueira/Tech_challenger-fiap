import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { TransactionDistributionChart } from "./TransactionDistributionChart";

const meta: Meta<typeof TransactionDistributionChart> = {
  title: "Charts/TransactionDistributionChart",
  component: TransactionDistributionChart,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Equilibrado: Story = {
  args: {
    data: [
      { name: "Entradas", value: 5000 },
      { name: "Saídas", value: 3800 },
    ],
  },
};

export const MaisCreditos: Story = {
  args: {
    data: [
      { name: "Entradas", value: 12000 },
      { name: "Saídas", value: 3000 },
    ],
  },
};

export const MaisDebitos: Story = {
  args: {
    data: [
      { name: "Entradas", value: 2000 },
      { name: "Saídas", value: 8500 },
    ],
  },
};

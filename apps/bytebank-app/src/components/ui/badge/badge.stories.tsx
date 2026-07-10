import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Badge } from ".";

const meta: Meta<typeof Badge> = {
  title: "Components/UI/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["cyan", "purple", "pink", "green", "red", "blue"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Deposito: Story = {
  args: { variant: "green", children: "↑ depósito" },
};

export const Transferencia: Story = {
  args: { variant: "cyan", children: "transferência" },
};

export const Pagamento: Story = {
  args: { variant: "purple", children: "pagamento" },
};

export const Saque: Story = {
  args: { variant: "red", children: "↓ saque" },
};

export const Positivo: Story = {
  args: { variant: "green", children: "↑ +3,2%" },
};

export const Negativo: Story = {
  args: { variant: "red", children: "↓ -1,8%" },
};

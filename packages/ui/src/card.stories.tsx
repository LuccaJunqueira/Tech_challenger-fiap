import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Card } from "./card";

const meta: Meta<typeof Card> = {
  title: "Components/UI/Card",
  component: Card,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: { children: "Conteúdo do card" },
};

export const WithContent: Story = {
  args: {
    children: (
      <>
        <h3 className="text-base font-semibold text-foreground mb-1">
          Título do Card
        </h3>
        <p className="text-sm text-muted-foreground">
          Descrição do card com texto secundário.
        </p>
      </>
    ),
  },
};

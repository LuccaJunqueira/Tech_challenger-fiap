import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "Components/UI/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "outline", "danger"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { variant: "primary", children: "Confirmar" },
};

export const Secondary: Story = {
  args: { variant: "secondary", children: "Cancelar" },
};

export const Outline: Story = {
  args: { variant: "outline", children: "Filtrar" },
};

export const Danger: Story = {
  args: { variant: "danger", children: "Excluir" },
};

export const Small: Story = {
  args: { variant: "primary", size: "sm", children: "Pequeno" },
};

export const Large: Story = {
  args: { variant: "primary", size: "lg", children: "Grande" },
};

export const Disabled: Story = {
  args: { variant: "primary", children: "Desabilitado", disabled: true },
};

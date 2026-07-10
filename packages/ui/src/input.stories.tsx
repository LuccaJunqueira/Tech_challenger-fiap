import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Input } from "./input";

const meta: Meta<typeof Input> = {
  title: "Components/UI/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    error: { control: "text" },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "date"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: "Digite algo...",
  },
};

export const WithLabel: Story = {
  args: {
    label: "Nome completo",
    placeholder: "Seu nome",
  },
};

export const WithError: Story = {
  args: {
    label: "Email",
    defaultValue: "email-invalido",
    error: "Email inválido",
  },
};

export const Password: Story = {
  args: {
    label: "Senha",
    type: "password",
    placeholder: "••••••••",
  },
};

export const NumberInput: Story = {
  args: {
    label: "Valor (R$)",
    type: "number",
    placeholder: "0,00",
    min: "0.01",
    step: "0.01",
  },
};

export const DateInput: Story = {
  args: {
    label: "Data",
    type: "date",
  },
};

export const Disabled: Story = {
  args: {
    label: "Campo desabilitado",
    placeholder: "Não editável",
    disabled: true,
  },
};

import "../apps/bytebank-app/src/app/globals.css";

import type { Preview } from "@storybook/nextjs-vite";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /background|color|stroke/i as RegExp,
        date: /Date$/i as RegExp,
      },
    },
    backgrounds: {
      default: "dark",
      values: [
        { name: "dark", value: "#020617" },
        { name: "surface", value: "#1E293B" },
        { name: "card", value: "#0F172A" },
      ],
    },
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div style={{ fontFamily: "var(--font-sans)", padding: "2rem" }}>
        <Story />
      </div>
    ),
  ],
};

export default preview;

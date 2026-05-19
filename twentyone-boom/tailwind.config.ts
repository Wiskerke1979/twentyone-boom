import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FAF7F2",
        paper: "#F4EFE6",
        ink: "#2C2418",
        muted: "#8B7E6E",
        line: "#E8E0D3",
        forest: "#2D5043",
        leaf: "#4F7A5C",
        bark: "#6B4F38",
        basis: "#6BA368",
        gevorderd: "#D89B5D",
        expert: "#C74E3A",
        bloom: "#E8A0B8",
        sky: "#DDE9F0",
        sun: "#F2C57C",
      },
      fontFamily: {
        serif: ["Fraunces", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;

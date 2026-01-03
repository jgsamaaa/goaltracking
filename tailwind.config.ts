import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontSize: {
        "ui": ["18px", { lineHeight: "28px" }],
        "ui-lg": ["20px", { lineHeight: "30px" }]
      }
    }
  },
  plugins: []
} satisfies Config;

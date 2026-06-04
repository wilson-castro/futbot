import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-roboto)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

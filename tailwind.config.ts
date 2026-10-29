import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        nbred: { 50: "#FDF1F2", 100: "#FADDE0", 500: "#D33A4A", 600: "#B82536", 700: "#931B2A" },
        nbblue: { 50: "#EEF4FC", 100: "#D8E6F8", 500: "#2F6FC7", 600: "#1F57A8", 700: "#184484" },
        ink: { 900: "#1C2230", 700: "#3D4557", 500: "#6B7385", 300: "#C9CED8", 100: "#EEF0F4", 50: "#F7F8FA" },
      },
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"], display: ["'Fraunces'", "Georgia", "serif"] },
    },
  },
  plugins: [],
};
export default config;

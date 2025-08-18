import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0b132b",
          accent: "#1c2541",
          highlight: "#3a506b"
        }
      }
    }
  },
  plugins: []
} satisfies Config;
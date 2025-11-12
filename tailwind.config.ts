import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#0b3d2e",
          accent: "#0e7a66"
        }
      },
      fontFamily: {
        sans: ['"Didact Gothic"', 'Arial', 'sans-serif'],
        heading: ['var(--font-inter)', 'sans-serif'],
      }
    }
  },
  plugins: []
};

export default config;


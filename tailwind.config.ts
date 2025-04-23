import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        chefchaouen_blue: {
          DEFAULT: "#4a90e2",
          100: "#081d34",
          200: "#113968",
          300: "#19569b",
          400: "#2273cf",
          500: "#4a90e2",
          600: "#6fa7e8",
          700: "#93bded",
          800: "#b7d3f3",
          900: "#dbe9f9",
        },
        celadon: {
          DEFAULT: "#7ed6a3",
          100: "#10341f",
          200: "#21683e",
          300: "#319c5e",
          400: "#4bc67e",
          500: "#7ed6a3",
          600: "#99dfb6",
          700: "#b2e7c8",
          800: "#ccefda",
          900: "#e5f7ed",
        },
        "anti-flash_white": {
          DEFAULT: "#f7f9fc",
          100: "#1b2d48",
          200: "#375b91",
          300: "#678cc5",
          400: "#afc3e1",
          500: "#f7f9fc",
          600: "#f9fbfd",
          700: "#fbfcfd",
          800: "#fcfdfe",
          900: "#fefefe",
        },
        jet: {
          DEFAULT: "#333333",
          100: "#0a0a0a",
          200: "#141414",
          300: "#1f1f1f",
          400: "#292929",
          500: "#333333",
          600: "#5c5c5c",
          700: "#858585",
          800: "#adadad",
          900: "#d6d6d6",
        },
        charcoal: {
          DEFAULT: "#2c3e50",
          100: "#090c10",
          200: "#111820",
          300: "#1a252f",
          400: "#23313f",
          500: "#2c3e50",
          600: "#476481",
          700: "#698bac",
          800: "#9bb1c8",
          900: "#cdd8e3",
        },
      },
    },
  },
  plugins: [],
};

export default config;

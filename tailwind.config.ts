import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        background: "rgb(0, 0, 0)",  // Force black background
        foreground: "rgb(255, 255, 255)",  // Force white text
      },
    },
  },
  plugins: [],
} satisfies Config;

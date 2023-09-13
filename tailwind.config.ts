import { type Config } from "tailwindcss";

export default {
  darkMode: "class",
  important: true,
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  purge: {
    enabled: true,
    options: {
      safelist: ["dark"], //specific classes
    },
  },
  theme: {
    // typography: (theme) => ({}),
    // extend: {
    //   typography: (theme) => ({
    //     dark: {
    //       css: {
    //         color: "white",
    //       },
    //     },
    //   }),
    // },
  },
  variants: {
    typography: ["dark"],
  },
  plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
} satisfies Config;

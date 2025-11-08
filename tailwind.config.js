/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        blue: {
          bg1: "#011326",
          bg2: "#002952",
          midnight: "#001A33",
          accent: "#0059ff",
        },
      },
      fontFamily: {
        // 🅰 For headings, buttons, etc.
        bebas: ['"Bebas Neue"', ...defaultTheme.fontFamily.sans],
        // 🅱 For labels, paragraphs, and body text
        titillium: ['"Titillium Web"', ...defaultTheme.fontFamily.sans],
        // (optional) make Titillium your default sans:
        sans: ['"Titillium Web"', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bebas Neue"', "display"],
        body: ['"DM Sans"', "sans-serif"],
      },
      colors: {
        accent: "#ff4f1f",
      },
    },
  },
  plugins: [],
};
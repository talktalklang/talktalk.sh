/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{html,ts,tsx}"],
  theme: {
    fontFamily: {
      italic: ["Cascadia Code Italic", "sans-serif"],
    },
    extend: {
      fontFamily: {
        mono: ["Cascadia Code", "monospaced"],
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "../templates/**/*.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FF2D55",
        accent: "#22D3EE",
        gold: "#F59E0B",
        ink: "#0A0A0B",
        paper: "#F7F8FA",
      }
    },
  },
  plugins: [],
};



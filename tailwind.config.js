/** @type {import('tailwindcss').Config} */

export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    colors: {
      blue: "#2d0896ff",
      purple: {
        100: "#f0ecfd",
        900: "#694fc6",
      },
      gray: "#efefef",
      black: "#2e1c2e",
      white: "#ffffff",
    },
    fontFamily: {
      dm: ["DmSans", "sans-serif"],
      raleway: ["Raleway", "sans-serif"],
    },
  },
  plugins: [],
};

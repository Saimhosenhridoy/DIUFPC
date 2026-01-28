/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
     colors: {
  brand: {
    light: "#1d2c3eff",   // light blue (default)
    primary: "#1E3A8A", // deep navy blue (active)
  },
},
    },
  },
  plugins: [],
};

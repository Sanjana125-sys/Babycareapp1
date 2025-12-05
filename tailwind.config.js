/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // This is the essential part: ensure it covers all your source code
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}", // <--- IMPORTANT: Assumes your files are in a 'src' folder
    "./components/**/*.{js,jsx,ts,tsx}", // Include your components folder
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
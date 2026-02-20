/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
      "./app/**/*.{js,ts,jsx,tsx}",
      "./pages/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
              border: "hsl(var(--border))",
              input: "hsl(var(--input))",
              ring: "hsl(var(--ring))",
              background: "hsl(var(--background))",
              foreground: "hsl(var(--foreground))",
          
              cg: {
                bg: "hsl(var(--cg-bg))",
                surface: "hsl(var(--cg-surface))",
                charcoal: "hsl(var(--cg-charcoal))",
                "charcoal-light": "hsl(var(--cg-charcoal-light))",
                electric: "hsl(var(--cg-electric))",
                "electric-bright": "hsl(var(--cg-electric-bright))",
              },
            },
          },
    },
    plugins: [require("tailwindcss-animate")],
  }
  
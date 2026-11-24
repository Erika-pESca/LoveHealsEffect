import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Oficial Hawái (Love Heals Effect)
        "veranda-blue": "#6BB1AD",
        "lagoon-deep": "#239BA2",
        "sky-cloud": "#A7BCBD",
        "lychee": "#EDECDB",
        "blush-sand": "#FDF3EF",
        "melon": "#E5A9A9",
        "sunset-coral": "#F49678",
        "cupid-pink": "#E6748E",

        // Colores base de lectura y armonía
        cream: "#FAF7F2",
        espresso: "#262322",
        "rose-brand": "#E6748E",
        "rose-soft": "#FDF3EF",
        "rose-dark": "#C9526D",
        sage: "#6BB1AD",
        "sage-light": "#E7F2F1",
        "sage-dark": "#239BA2",
        primary: "#E6748E",
        "primary-container": "#E5A9A9",
        "primary-fixed": "#FDF3EF",
        secondary: "#F49678",
        "secondary-container": "#FDE6E9",
        tertiary: "#6BB1AD",
        "tertiary-dark": "#239BA2",
        "tertiary-fixed": "#DCECEB",
        background: "#FCFBF7",
        surface: "#FAF7F2",
        "surface-container": "#EDECDB",
        "surface-container-low": "#F4F8F8",
        "surface-container-lowest": "#ffffff",
        "on-surface": "#262322",
        "on-surface-variant": "#4D5558",
      },
      fontFamily: {
        // Sistema tipográfico unificado (máximo 2 familias en toda la web, igual que Inicio)
        sans: ["var(--font-jakarta)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Playfair Display", "Georgia", "serif"],
        mono: ["var(--font-jakarta)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      animation: {
        marquee: "marquee 30s linear infinite",
        "sheet-up": "sheetUp 0.28s ease-out",
        "fade-in": "fadeIn 0.35s ease-out both",
        breathe: "breathe 8s ease-in-out infinite",
        wave: "wave 1.1s ease-in-out infinite",
        pop: "pop 0.3s ease-out",
      },
      keyframes: {
        sheetUp: {
          "0%": { transform: "translateY(40px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(0.78)" },
          "50%": { transform: "scale(1.12)" },
        },
        wave: {
          "0%, 100%": { transform: "scaleY(0.35)" },
          "50%": { transform: "scaleY(1)" },
        },
        pop: {
          "0%": { transform: "scale(0.9)" },
          "60%": { transform: "scale(1.08)" },
          "100%": { transform: "scale(1)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

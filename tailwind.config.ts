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
        cream: "#FAF7F2",
        espresso: "#262322",
        "rose-brand": "#E27D90",
        "rose-soft": "#FBE9ED",
        "rose-dark": "#C4546A",
        sage: "#5D7A52",
        "sage-light": "#E6EFE3",
        "sage-dark": "#415938",
        terracotta: "#DC9A7E",
        "terracotta-light": "#EBC2AE",
        primary: "#8f4b3d",
        "primary-container": "#d48372",
        "primary-fixed": "#ffdad3",
        secondary: "#7c5357",
        "secondary-container": "#fdc7cb",
        tertiary: "#456558",
        "tertiary-dark": "#2e4d40",
        "tertiary-fixed": "#c7ead9",
        background: "#FCFBF7",
        surface: "#FAF7F2",
        "surface-container": "#f3ece4",
        "surface-container-low": "#f3f2ff",
        "surface-container-lowest": "#ffffff",
        "on-surface": "#171b2b",
        "on-surface-variant": "#534340",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Playfair Display", "Georgia", "serif"],
      },
      animation: {
        marquee: "marquee 30s linear infinite",
      },
      keyframes: {
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

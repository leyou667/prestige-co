import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.25rem", md: "2rem" },
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        ink: "#0A0A0A",
        anthracite: "#1A1A1A",
        graphite: "#242424",
        gold: { DEFAULT: "#C8A96A", soft: "#D9C193", deep: "#A88B4E" },
        silver: "#BFC3C8",
        border: "rgba(255,255,255,0.1)",
        background: "#0A0A0A",
        foreground: "#FFFFFF",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        luxe: "0.35em",
        wide2: "0.2em",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.8s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;

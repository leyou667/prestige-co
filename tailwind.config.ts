import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  // Le container est défini dans globals.css (fluide jusqu'à 1400px, marges 20px → 32px dès md)
  corePlugins: { container: false },
  theme: {
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
        // Niveaux de texte secondaires (contraste AA garanti sur #0A0A0A et #1A1A1A)
        muted: "rgba(255,255,255,0.62)",
        subtle: "rgba(255,255,255,0.75)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Plancher de lisibilité pour les micro-libellés (11px)
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
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
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.8s ease-out both",
        "fade-in": "fade-in 0.9s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;

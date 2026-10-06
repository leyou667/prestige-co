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
        // Blanc « phare » des titres : moins dur que le blanc pur sur le noir
        headline: "#F4F5F7",
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
      // Courbe commune : départ rapide, arrivée douce (pas de « ease » générique)
      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0.23, 1, 0.32, 1)",
        out: "cubic-bezier(0.23, 1, 0.32, 1)",
        "in-out": "cubic-bezier(0.77, 0, 0.175, 1)",
      },
      transitionDuration: {
        DEFAULT: "200ms",
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
        "sheet-up": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.23, 1, 0.32, 1) both",
        "fade-in": "fade-in 0.6s cubic-bezier(0.23, 1, 0.32, 1) both",
        // Feuille mobile : courbe « tiroir », 400 ms
        "sheet-up": "sheet-up 0.4s cubic-bezier(0.32, 0.72, 0, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;

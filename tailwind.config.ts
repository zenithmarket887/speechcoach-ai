import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Palette officielle Parole + AI ──
        p: {
          blue:        "#1E5BB8",
          "blue-dark": "#103E85",
          "blue-bg":   "#E5EEFB",
          green:       "#197A4B",
          "green-bg":  "#E2F1E8",
          amber:       "#A85A00",
          "amber-bg":  "#FBEFD9",
          terra:       "#9A4A12",
          "terra-bg":  "#F8E2D2",
          red:         "#A8261D",
          "red-bg":    "#F7E1DE",
          ink:         "#0E1B2C",
          "ink-soft":  "#324158",
          "ink-mute":  "#5B6B82",
          border:      "#D6DEEA",
          "border-str":"#9FB0C6",
          surface:     "#FFFFFF",
          "surface-soft":"#F4F6FA",
          "surface-dim": "#EEF2F8",
        },
      },
      fontFamily: {
        sans:  ["var(--font-atkinson)", "Atkinson Hyperlegible", "Open Sans", "system-ui", "sans-serif"],
        mono:  ["var(--font-mono)", "JetBrains Mono", "monospace"],
        serif: ["var(--font-fraunces)", "Fraunces", "Georgia", "serif"],
      },
      borderRadius: {
        "sm-p": "10px",
        "md-p": "14px",
        "lg-p": "18px",
        "xl-p": "24px",
      },
      boxShadow: {
        card:    "0 2px 4px rgba(14,27,44,0.06)",
        "card-md":"0 6px 18px rgba(14,27,44,0.10)",
        "btn":   "0 4px 0 #103E85",
        "btn-green":"0 4px 0 #0E5C36",
      },
      backgroundImage: {
        "app-gradient": "linear-gradient(180deg, #EEF2F8 0%, #EEF2F8 100%)",
        "blue-gradient": "linear-gradient(135deg, #1E5BB8 0%, #2F75D8 100%)",
      },
      keyframes: {
        fadeIn:    { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp:   { from: { opacity: "0", transform: "translateY(20px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        slideUpSm: { from: { opacity: "0", transform: "translateY(8px)" },  to: { opacity: "1", transform: "translateY(0)" } },
        scaleIn:   { from: { opacity: "0", transform: "scale(0.95)" },      to: { opacity: "1", transform: "scale(1)" } },
      },
      animation: {
        "fade-in":     "fadeIn 0.4s ease both",
        "slide-up":    "slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both",
        "slide-up-sm": "slideUpSm 0.3s cubic-bezier(0.16,1,0.3,1) both",
        "scale-in":    "scaleIn 0.2s cubic-bezier(0.16,1,0.3,1) both",
      },
    },
  },
  plugins: [],
};
export default config;

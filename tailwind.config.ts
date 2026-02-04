import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Cactus Classical Serif", "Georgia", "serif"],
        sans: ["Satoshi", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      colors: {
        // Cool off-white theme palette
        background: {
          DEFAULT: "#F8F9FA",
          secondary: "#F1F3F5",
          elevated: "#FFFFFF",
        },
        foreground: {
          DEFAULT: "#1A1A2E",
          secondary: "#6B7280",
          muted: "#9CA3AF",
        },
        // Semantic accent colors
        blue: {
          DEFAULT: "#3B82F6",
          muted: "rgba(59, 130, 246, 0.08)",
        },
        green: {
          DEFAULT: "#10B981",
          muted: "rgba(16, 185, 129, 0.08)",
        },
        purple: {
          DEFAULT: "#8B5CF6",
          muted: "rgba(139, 92, 246, 0.08)",
        },
        amber: {
          DEFAULT: "#F59E0B",
          muted: "rgba(245, 158, 11, 0.08)",
        },
        red: {
          DEFAULT: "#EF4444",
          muted: "rgba(239, 68, 68, 0.08)",
        },
        // CSS variable mappings
        border: {
          DEFAULT: "var(--border)",
          subtle: "var(--border-subtle)",
          emphasis: "var(--border-emphasis)",
        },
        input: "var(--input)",
        ring: "var(--ring)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius)",
        sm: "calc(var(--radius) - 2px)",
      },
      spacing: {
        xs: "var(--space-xs)",
        sm: "var(--space-sm)",
        md: "var(--space-md)",
        lg: "var(--space-lg)",
        xl: "var(--space-xl)",
        "2xl": "var(--space-2xl)",
      },
      transitionTimingFunction: {
        premium: "var(--ease-premium)",
      },
      animation: {
        "fade-up": "fade-up 0.6s var(--ease-premium) forwards",
        "fade-in": "fade-in 0.4s var(--ease-premium) forwards",
        "slide-in-right": "slide-in-right 0.5s var(--ease-premium) forwards",
      },
    },
  },
  plugins: [],
};

export default config;

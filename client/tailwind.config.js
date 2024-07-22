/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        logo: ["Balsamiq Sans", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        logo: "hsl(14, 84%, 90%)",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        bubble:
          "radial-gradient(75% 75% at 55% 45%, hsl(var(--blue-bubble)) 65%, hsl(var(--shadow-bubble)) 68% 100%)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        focus: {
          "50%": {
            opacity: 0,
            transform: "scale(2)",
          },
          "100%": {
            opacity: 1,
            transform: "scale(1)",
          },
        },
        timer: {
          to: {
            "--pomodoro-gradient-value": "100%",
          },
        },
        bubble: {
          "0%": {
            transform: "translateY(0) scale(1)",
            opacity: 0,
          },
          "50%": { opacity: 1 },
          "90%": { opacity: 1, transform: "translateY(-290px) scale(1)" },
          "100%": {
            opacity: 0,
            transform: "scale(1.2) translateY(-290px)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        focus: "focus 10s ease-out infinite",
        timer: "timer 30s linear",
        bubble: "bubble 5s  infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

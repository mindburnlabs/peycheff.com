/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "24px",
        sm: "24px",
        lg: "32px",
      },
      screens: {
        "2xl": "1080px",
      },
    },
    extend: {
      colors: {
        // Apple-grade color system
        border: "var(--line, #1C1F26)",
        input: "#0F1115",
        ring: "#0A84FF",
        background: "var(--bg, #0B0C0F)",
        foreground: "var(--text, #F2F3F5)",
        primary: {
          DEFAULT: "#0A84FF",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#0F1115",
          foreground: "#F2F3F5",
        },
        destructive: {
          DEFAULT: "#FF453A",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#0F1115",
          foreground: "#A5ABB3",
        },
        accent: {
          DEFAULT: "#0A84FF",
          foreground: "#FFFFFF",
        },
        popover: {
          DEFAULT: "#0F1115",
          foreground: "#F2F3F5",
        },
        card: {
          DEFAULT: "#0F1115",
          foreground: "#F2F3F5",
        },
        surface: "#0F1115",
      },
      borderRadius: {
        lg: "var(--radius, 12px)",
        md: "10px",
        sm: "8px",
      },
      fontFamily: {
        sans: [
          "-apple-system", 
          "BlinkMacSystemFont", 
          "SF Pro Text", 
          "SF Pro Display", 
          "Inter", 
          "Segoe UI", 
          "Roboto", 
          "system-ui", 
          "sans-serif"
        ],
      },
      fontSize: {
        // Apple-grade typography scale
        'h1': ['56px', { lineHeight: '64px', letterSpacing: '-0.02em', fontWeight: '600' }],
        'h2': ['36px', { lineHeight: '44px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'h3': ['24px', { lineHeight: '32px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '26px', letterSpacing: '0', fontWeight: '400' }],
        'small': ['14px', { lineHeight: '22px', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '18px', fontWeight: '400' }],
      },
      spacing: {
        // 8px baseline grid
        '2': '8px',
        '4': '16px',
        '6': '24px',
        '8': '32px',
        '12': '48px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
      },
      maxWidth: {
        'container': '1080px',
      },
      backdropBlur: {
        'apple': '10px',
      },
      backdropSaturate: {
        'apple': '130%',
      },
      animation: {
        "fade-in": "fadeIn 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-down": "slideDown 0.12s cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-up": "slideUp 0.12s cubic-bezier(0.4, 0, 0.2, 1)",
      },
      keyframes: {
        fadeIn: {
          "0%": {
            opacity: "0",
            transform: "translateY(2px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        slideDown: {
          "0%": {
            opacity: "0",
            transform: "translateY(-2px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        slideUp: {
          "0%": {
            opacity: "0",
            transform: "translateY(2px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
      transitionTimingFunction: {
        'apple': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        '120': '120ms',
        '150': '150ms',
        '160': '160ms',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
}
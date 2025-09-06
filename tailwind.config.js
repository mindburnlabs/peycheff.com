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
        // Apple-grade color system with nuanced grays
        border: "#1C1F26",
        input: "#1A1D23",
        ring: "#0A84FF",
        background: "#0B0C0F",
        foreground: "#F2F3F5",
        primary: {
          DEFAULT: "#0A84FF",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#1A1D23",
          foreground: "#F2F3F5",
        },
        destructive: {
          DEFAULT: "#FF453A",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#1A1D23",
          foreground: "#98A2B3",
        },
        accent: {
          DEFAULT: "#0A84FF",
          foreground: "#FFFFFF",
        },
        popover: {
          DEFAULT: "#1A1D23",
          foreground: "#F2F3F5",
        },
        card: {
          DEFAULT: "#1A1D23",
          foreground: "#F2F3F5",
        },
        surface: "#1A1D23",
        // Apple's nuanced gray scale
        gray: {
          50: "#F8F9FA",
          100: "#E9ECEF",
          200: "#CED4DA",
          300: "#98A2B3",
          400: "#6C757D",
          500: "#495057",
          600: "#343A40",
          700: "#212529",
          800: "#1A1D23",
          850: "#161920",
          900: "#0F1115",
          950: "#0B0C0F",
        },
        // Refined text colors
        text: {
          primary: "#F2F3F5",
          secondary: "#D1D5DB",
          tertiary: "#98A2B3",
          quaternary: "#6B7280",
        },
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
        '250': '250ms',
        '400': '400ms',
      },
      // Apple-inspired gradients
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh': 'radial-gradient(at 40% 20%, hsla(228, 100%, 74%, 0.2) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189, 100%, 56%, 0.2) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355, 100%, 93%, 0.2) 0px, transparent 50%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        'gradient-surface': 'linear-gradient(145deg, rgba(26,29,35,0.4) 0%, rgba(26,29,35,0.1) 100%)',
      },
      // Enhanced shadows with Apple-like depth
      boxShadow: {
        'apple-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'apple': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'apple-md': '0 8px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 20px -6px rgba(0, 0, 0, 0.1)',
        'apple-lg': '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'apple-xl': '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
        'glass': 'inset 0 1px 0 0 rgba(255,255,255,0.1), 0 1px 3px 0 rgba(0,0,0,0.1)',
        'inner-glass': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      },
      // Advanced blur effects
      backdropBlur: {
        'apple': '10px',
        'apple-lg': '20px',
        'apple-xl': '40px',
      },
      // Improved border radius scale
      borderRadius: {
        'apple': '12px',
        'apple-lg': '16px',
        'apple-xl': '20px',
        'apple-2xl': '24px',
      },
      // Enhanced scale and transform utilities
      scale: {
        '102': '1.02',
        '103': '1.03',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
}
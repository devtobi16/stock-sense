/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#f8fafb',
          secondary: '#ffffff',
          tertiary: '#f0f7f2',
        },
        surface: {
          DEFAULT: '#ffffff',
          hover: '#f0f9f3',
          active: '#dcfce7',
          border: '#d1fae5',
        },
        green: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        accent: {
          green: '#16a34a',
          'green-bright': '#22c55e',
          'green-dim': '#15803d',
          'green-soft': '#dcfce7',
          red: '#dc2626',
          amber: '#d97706',
          blue: '#2563eb',
          cyan: '#0891b2',
        },
        text: {
          primary: '#0f172a',
          secondary: '#334155',
          muted: '#94a3b8',
          accent: '#16a34a',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'green-glow': 'radial-gradient(ellipse at center, rgba(22,163,74,0.12) 0%, transparent 70%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(240,249,243,1) 100%)',
      },
      boxShadow: {
        'card': '0 1px 8px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04)',
        'card-hover': '0 8px 32px rgba(22,163,74,0.12), 0 4px 12px rgba(0,0,0,0.06)',
        'green-glow': '0 0 24px rgba(22,163,74,0.25)',
        'sidebar': '2px 0 12px rgba(0,0,0,0.06)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f6fe',
          100: '#ddeafd',
          200: '#c3dbfc',
          300: '#9ac3fa',
          400: '#6aa2f6',
          500: '#437ef0',
          600: '#2c60e4',
          700: '#1d48c8',
          800: '#1c3da5',
          900: '#1c3682',
          950: '#122151',
        },
        entry: {
          light: '#dcfce7',
          DEFAULT: '#16a34a',
          dark: '#15803d',
        },
        exit: {
          light: '#e0f2fe',
          DEFAULT: '#0284c7',
          dark: '#0369a1',
        },
        alert: {
          light: '#fef3c7',
          DEFAULT: '#d97706',
          dark: '#b45309',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'pop-in': 'popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-subtle': 'pulseSubtle 2s infinite',
        'scan-line': 'scanLine 2.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.02)' },
        },
        scanLine: {
          '0%': { transform: 'translateY(0%)' },
          '50%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0%)' },
        }
      }
    },
  },
  plugins: [],
}

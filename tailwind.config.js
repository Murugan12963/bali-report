/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Futuristic theme colors
        primary: {
          50: '#E6FFF9',
          100: '#B3FFF0',
          200: '#80FFE6',
          300: '#4DFFDD',
          400: '#1AFFD4',
          500: '#00FFCC', // Main teal
          600: '#00CCB3',
          700: '#009980',
          800: '#00664D',
          900: '#00332B',
        },
        secondary: {
          50: '#FFE6E6',
          100: '#FFB3B3',
          200: '#FF8080',
          300: '#FF4D4D',
          400: '#FF4040', // Main red
          500: '#FF0000',
          600: '#CC0000',
          700: '#990000',
          800: '#660000',
          900: '#330000',
        },
        accent: {
          50: '#E6F2FF',
          100: '#B3D9FF',
          200: '#80BFFF',
          300: '#4DA6FF',
          400: '#1A8CFF',
          500: '#0073E6', // Main blue
          600: '#005CB3',
          700: '#004480',
          800: '#002D4D',
          900: '#00161A',
        },
        // Dark theme colors
        dark: {
          bg: '#1A1F2E',        // Main background
          surface: '#232838',    // Surface/card background
          border: '#2E354A',     // Borders
          text: '#E6E8ED',       // Primary text
          muted: '#9BA1B0',      // Secondary text
          highlight: '#39405F'   // Highlighted elements
        }
      },
      fontFamily: {
        sans: ['var(--font-orbitron)', 'Orbitron', 'system-ui', 'sans-serif'],
        body: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'scan': 'scan 2s ease-in-out infinite',
        'grid-flow': 'gridFlow 20s linear infinite',
        'data-stream': 'dataStream 1s linear infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { textShadow: '0 0 10px rgba(0,255,204,0.5), 0 0 20px rgba(0,255,204,0.2)' },
          '50%': { textShadow: '0 0 20px rgba(0,255,204,0.8), 0 0 30px rgba(0,255,204,0.4)' },
        },
        scan: {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '0% 100%' },
        },
        gridFlow: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-50%)' },
        },
        dataStream: {
          '0%': { transform: 'translateY(0)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { 
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': { 
            transform: 'translateY(-5px)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 20px rgba(0, 255, 204, 0.5)',
        'glow-lg': '0 0 30px rgba(0, 255, 204, 0.7)',
        'neon': '0 0 5px rgba(0, 255, 204, 0.2), 0 0 20px rgba(0, 255, 204, 0.4), 0 0 40px rgba(0, 255, 204, 0.6)',
        'neon-red': '0 0 5px rgba(255, 64, 64, 0.2), 0 0 20px rgba(255, 64, 64, 0.4), 0 0 40px rgba(255, 64, 64, 0.6)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
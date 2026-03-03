import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0C',
        surface: {
          DEFAULT: '#121216',
          elevated: '#1A1A1E',
        },
        border: {
          DEFAULT: '#28282C',
          hover: '#38383D',
        },
        text: {
          primary: '#EAE7E0',
          secondary: '#A09D96',
          muted: '#6E6B65',
        },
        accent: {
          DEFAULT: '#D97A44',
          hover: '#ECA173',
        },
        success: '#3A7A5B',
        warning: '#C47A20',
        danger: '#A33B3B',
        info: '#4A6C8C',
      },
      fontFamily: {
        display: ['var(--font-instrument)', 'Georgia', 'serif'],
        body: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
        data: ['var(--font-jetbrains)', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 20px -5px rgba(217, 122, 68, 0.3)',
      }
    },
  },
  plugins: [],
} satisfies Config
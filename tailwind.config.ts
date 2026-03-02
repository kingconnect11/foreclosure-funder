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
        background: '#040B14',
        surface: {
          DEFAULT: '#0A1628',
          elevated: '#112240',
        },
        border: '#1E324A',
        text: {
          primary: '#F0F4F8',
          secondary: '#8899AA',
          muted: '#556677',
        },
        accent: {
          DEFAULT: '#D4952A',
          hover: '#E8A83E',
        },
        success: '#2D8A5E',
        warning: '#C47A20',
        danger: '#E54D4D',
        info: '#3A7BD5',
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        body: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        data: ['var(--font-dm-mono)', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 20px -5px rgba(212, 149, 42, 0.3)',
      }
    },
  },
  plugins: [],
} satisfies Config
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
        background: '#F5F1E8',
        surface: {
          DEFAULT: '#FFFDF8',
          elevated: '#EFE8DA',
        },
        border: {
          DEFAULT: '#D8CCB4',
          hover: '#BCA98A',
        },
        text: {
          primary: '#1E1A13',
          secondary: '#584B36',
          muted: '#8A7760',
        },
        accent: {
          DEFAULT: '#0F766E',
          hover: '#0B5F58',
        },
        success: '#2F855A',
        warning: '#B7791F',
        danger: '#C53030',
        info: '#1D4E89',
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        body: ['var(--font-source)', 'ui-sans-serif', 'sans-serif'],
        data: ['var(--font-jetbrains)', 'monospace'],
      },
      borderRadius: {
        ledger: '14px',
      },
      keyframes: {
        floatIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        floatIn: 'floatIn 320ms ease-out',
      },
      boxShadow: {
        card: '0 8px 22px -14px rgba(30, 26, 19, 0.22)',
        lift: '0 14px 30px -18px rgba(30, 26, 19, 0.28)',
      }
    },
  },
  plugins: [],
} satisfies Config
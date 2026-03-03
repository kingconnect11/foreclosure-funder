import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        surface: {
          1: 'var(--surface-1)',
          2: 'var(--surface-2)',
        },
        border: 'var(--border)',
        accent: {
          pine: 'var(--accent-pine)',
          crimson: 'var(--accent-crimson)',
          slate: 'var(--accent-slate)',
        },
        muted: 'var(--muted)',
        danger: 'var(--danger)',
        warning: 'var(--warning)',
        info: 'var(--info)',
      },
      fontFamily: {
        serif: ['var(--font-playfair)'],
        sans: ['var(--font-dm-sans)'],
        mono: ['var(--font-jetbrains-mono)'],
      },
      borderRadius: {
        sharp: '2px',
      }
    },
  },
  plugins: [],
} satisfies Config

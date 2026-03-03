import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { clsx } from 'clsx'

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair'
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans'
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono'
})

export const metadata: Metadata = {
  title: 'Foreclosure Funder',
  description: 'Foreclosure property intelligence for real estate investors',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={clsx(
        playfair.variable, 
        dmSans.variable, 
        jetbrainsMono.variable,
        "min-h-screen bg-background font-sans antialiased selection:bg-accent-pine selection:text-white"
      )}>
        {children}
      </body>
    </html>
  )
}

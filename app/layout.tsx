import type { Metadata } from 'next'
import { Instrument_Serif, Manrope, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const instrument = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-instrument',
})

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-manrope',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
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
    <html lang="en">
      <body className={`${instrument.variable} ${manrope.variable} ${jetbrains.variable} font-body bg-background text-text-primary antialiased relative min-h-screen`}>
        <div className="noise-overlay pointer-events-none fixed inset-0 z-[-1] opacity-[0.03]"></div>
        {children}
      </body>
    </html>
  )
}

import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { UserProvider } from '@/contexts/user-context'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: '1st Buyer — Your Fair Advantage in Car Buying',
  description:
    '1st Buyer is an AI-powered car buying companion for South Africans. Know your rights under the NCA & CPA, check your credit, compare insurance, analyse quotations and find trusted dealerships.',
  generator: 'v0.app',
  applicationName: '1st Buyer',
  keywords: [
    'car buying South Africa',
    'NCA',
    'CPA',
    'vehicle finance',
    'credit score',
    'car insurance',
  ],
}

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} bg-background`}>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <UserProvider>{children}</UserProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

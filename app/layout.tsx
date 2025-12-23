import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Call Agent - Your Virtual Call Attendant',
  description: 'An AI-powered agent that attends all your calls automatically',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

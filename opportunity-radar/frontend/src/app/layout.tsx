import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Opportunity Radar AI | AI-Native Investing for India',
  description: 'Multi-agent AI that debates every stock so you don\'t have to. Bull vs Bear vs Judge — real signals, no noise.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-radar-bg text-radar-text min-h-screen">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#0D1F35',
              color: '#E8F4FD',
              border: '1px solid #1A3A5C',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '13px',
            },
          }}
        />
      </body>
    </html>
  )
}

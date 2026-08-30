import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next'
import './globals.css'
import { PostHogUserIdentifier } from './components/PostHogUserIdentifier'

export const metadata: Metadata = {
  title: 'Vertex Design System',
  description: 'Vertex learning platform design system.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang='en'
      className='h-full antialiased no-touch'
    >
      <body
        className='min-h-full flex flex-col'
        suppressHydrationWarning
      >
        <ClerkProvider>
          <PostHogUserIdentifier />
          {children}
        </ClerkProvider>
      </body>
    </html>
  )
}

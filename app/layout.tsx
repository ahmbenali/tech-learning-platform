import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Vertex Design System',
  description: 'Vertex learning platform design system.',
}

/**
 * Renders the root HTML structure for the application.
 *
 * @param children - The page content rendered inside the document body
 */
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
        {children}
      </body>
    </html>
  )
}

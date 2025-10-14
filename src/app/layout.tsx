import type { Metadata, Viewport } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CartProvider from '@/components/CartProvider'
import WhatsAppButton from '@/components/WhatsAppButton'

export const metadata: Metadata = {
  title: 'Namak Masaala — Home-made Tiffin Delivery',
  description: 'Home-made weekly & monthly tiffin plans delivered fresh.',
  icons: { icon: '/favicon.ico' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#F1E7DA',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-paper text-charcoal min-h-screen antialiased">
        <CartProvider>
          <Navbar />
          <main className="container-nm py-8">{children}</main>

          {/* Floating WhatsApp button (change side via position="left" if you want) */}
          <WhatsAppButton position="right" />

          <Footer />
        </CartProvider>
      </body>
    </html>
  )
}

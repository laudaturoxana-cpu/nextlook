import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: {
    default: 'NEXTLOOK - Haine și Încălțăminte Branded la Prețuri Accesibile',
    template: '%s | NEXTLOOK',
  },
  description:
    'Descoperă haine și sneakers branded 100% originale la prețuri care au sens. Livrare rapidă în 24-48h, retur gratuit 30 zile. Nike, Adidas, Puma și multe altele.',
  keywords: [
    'haine branded',
    'sneakers originali',
    'Nike Romania',
    'Adidas Romania',
    'incaltaminte originala',
    'haine dama',
    'haine barbati',
    'magazin online haine',
  ],
  authors: [{ name: 'NEXTLOOK' }],
  creator: 'NEXTLOOK',
  openGraph: {
    type: 'website',
    locale: 'ro_RO',
    url: 'https://nextlook.ro',
    siteName: 'NEXTLOOK',
    title: 'NEXTLOOK - Următorul Tău Stil',
    description: 'Arată bine. Fără stres, fără riscuri. Haine și sneakers branded 100% originale.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NEXTLOOK - Următorul Tău Stil',
    description: 'Arată bine. Fără stres, fără riscuri.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ro">
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#2D2D2D',
              color: '#fff',
              borderRadius: '12px',
            },
            success: {
              iconTheme: {
                primary: '#D4AF37',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  )
}

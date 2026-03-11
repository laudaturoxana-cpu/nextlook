import type { Metadata } from 'next'
import { Bebas_Neue, Montserrat } from 'next/font/google'
import Script from 'next/script'
import { Toaster } from 'react-hot-toast'
import '@/styles/globals.css'

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: {
    default: 'NEXTLOOK - Haine și Încălțăminte de Brand la Prețuri Accesibile',
    template: '%s | NEXTLOOK',
  },
  description:
    'Descoperă haine și sneakers de brand, 100% originale, la prețuri care au sens. Livrare rapidă în 24-48h, retur gratuit 30 zile. Nike, Adidas, Puma și multe altele.',
  keywords: [
    'haine de brand',
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
    description: 'Arată bine. Fără stres, fără riscuri. Haine și sneakers de brand, 100% originale.',
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
    <html lang="ro" className={`${bebasNeue.variable} ${montserrat.variable}`}>
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-P9F6X5P44N"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-P9F6X5P44N');
          `}
        </Script>

        {/* Facebook Pixel */}
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${process.env.NEXT_PUBLIC_FB_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
      </head>
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
                primary: '#A58625',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  )
}

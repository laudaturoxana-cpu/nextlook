/** @type {import('next').NextConfig} */

const cspHeader = [
  "default-src 'self'",
  // Scripts: Next.js needs unsafe-inline/eval; Stripe and FB Pixel are external
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://connect.facebook.net https://www.googletagmanager.com",
  // Styles: Tailwind + Google Fonts
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // Fonts: Google Fonts CDN
  "font-src 'self' https://fonts.gstatic.com",
  // Images: Supabase storage, data URIs, any HTTPS image
  "img-src 'self' data: blob: https:",
  // API calls: Supabase, Stripe, DPD, Resend
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://api.dpd.ro https://api.resend.com",
  // Stripe payment iframe
  "frame-src https://js.stripe.com https://hooks.stripe.com",
  // No plugins/objects
  "object-src 'none'",
  "base-uri 'self'",
].join('; ')

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: cspHeader },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

module.exports = nextConfig

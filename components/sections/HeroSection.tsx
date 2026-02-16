'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ChevronDown, Check } from 'lucide-react'

const GoldParticles = dynamic(() => import('@/components/GoldParticles'), {
  ssr: false,
})

const trustBadges = [
  'Produse 100% originale',
  'Livrare în 24-48h',
  'Retur gratuit 30 zile',
  'Plată securizată',
]

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-cream via-cream-100 to-cream-200">
      {/* Gold Particles - lazy loaded */}
      <GoldParticles count={25} />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 lg:px-8 text-center py-32">
        {/* Brand Label */}
        <p
          className="text-xs font-body font-bold uppercase tracking-[0.3em] text-text-secondary mb-8 animate-[fadeInUp_0.6s_ease-out_both]"
        >
          Următorul Tău Stil
        </p>

        {/* Main Title */}
        <h1
          className="font-display text-4xl md:text-6xl lg:text-7xl xl:text-8xl text-text leading-tight mb-6 animate-[fadeInUp_0.6s_ease-out_0.2s_both]"
        >
          NU MAI PIERDE TIMPUL ALEGÂND.
          <br />
          <span className="text-gold">GĂSEȘTE EXACT CE ȚI SE POTRIVEȘTE.</span>
        </h1>

        {/* Subtitle */}
        <p
          className="font-body text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed animate-[fadeInUp_0.6s_ease-out_0.4s_both]"
        >
          Haine și sneakers de brand. Originale. La prețuri care au sens.
        </p>

        {/* CTA */}
        <div
          className="animate-[fadeInUp_0.6s_ease-out_0.6s_both] mb-12"
        >
          <Link href="/shop" className="btn-primary min-w-[220px]">
            Vezi Colecția
          </Link>
        </div>

        {/* Trust Badges */}
        <div
          className="grid grid-cols-2 md:flex md:flex-wrap md:justify-center gap-x-8 gap-y-4 max-w-md md:max-w-none mx-auto animate-[fadeInUp_0.6s_ease-out_0.8s_both]"
        >
          {trustBadges.map((badge, index) => (
            <div
              key={index}
              className="flex items-center justify-center gap-2 text-sm text-text-secondary"
            >
              <Check className="h-4 w-4 text-gold flex-shrink-0" />
              <span>{badge}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        className="absolute bottom-8 inset-x-0 flex justify-center animate-[fadeInUp_0.6s_ease-out_1.2s_both]"
      >
        <a
          href="#categorii"
          className="flex flex-col items-center gap-2 text-text-secondary hover:text-gold transition-colors"
        >
          <span className="text-xs uppercase tracking-wider">Descoperă</span>
          <ChevronDown className="h-5 w-5 scroll-indicator" />
        </a>
      </div>
    </section>
  )
}

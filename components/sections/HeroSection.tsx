'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'
import GoldParticles from '@/components/GoldParticles'
import { Button } from '@/components/ui/Button'

const trustBadges = [
  'Produse 100% originale',
  'Livrare în 24-48h',
  'Retur gratuit 30 zile',
  'Plată securizată',
]

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-cream via-cream-100 to-cream-200">
      {/* Gold Particles */}
      <GoldParticles count={25} />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 lg:px-8 text-center py-32">
        {/* Brand Label */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-xs font-body font-bold uppercase tracking-[0.3em] text-text-secondary mb-8"
        >
          Următorul Tău Stil
        </motion.p>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-display text-4xl md:text-6xl lg:text-7xl xl:text-8xl text-text leading-tight mb-6"
        >
          NU MAI PIERDE TIMPUL ALEGÂND.
          <br />
          <span className="text-gold">GĂSEȘTE EXACT CE ȚI SE POTRIVEȘTE.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="font-body text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Haine și sneakers branded. Originale. La prețuri care au sens.
          <br />
          Fără stres, fără riscuri. Livrare rapidă și retur gratuit 30 zile.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          <Link href="/shop">
            <Button size="lg" className="min-w-[200px]">
              Vezi Colecția
            </Button>
          </Link>
          <a href="#cum-functioneaza">
            <Button variant="secondary" size="lg" className="min-w-[200px]">
              Cum Funcționează
            </Button>
          </a>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4"
        >
          {trustBadges.map((badge, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-sm text-text-secondary"
            >
              <Check className="h-4 w-4 text-gold" />
              <span>{badge}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <a
          href="#de-ce-noi"
          className="flex flex-col items-center gap-2 text-text-secondary hover:text-gold transition-colors"
        >
          <span className="text-xs uppercase tracking-wider">Descoperă</span>
          <ChevronDown className="h-5 w-5 scroll-indicator" />
        </a>
      </motion.div>
    </section>
  )
}

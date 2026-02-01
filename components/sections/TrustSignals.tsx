'use client'

import { motion } from 'framer-motion'
import { Truck, RefreshCw, Shield, Lock, MessageCircle, Star } from 'lucide-react'

const signals = [
  {
    icon: Truck,
    title: 'Livrare rapidă',
    description: 'În 24-48h în toată România',
  },
  {
    icon: RefreshCw,
    title: 'Retur gratuit 30 zile',
    description: 'Fără întrebări, fără costuri',
  },
  {
    icon: Shield,
    title: 'Produse 100% originale',
    description: 'Verificate și certificate',
  },
  {
    icon: Lock,
    title: 'Plată securizată',
    description: 'Card, PayPal, Ramburs, Rate',
  },
  {
    icon: MessageCircle,
    title: 'Suport răspuns rapid',
    description: 'Răspundem în max 2 ore (L-V 9-18)',
  },
  {
    icon: Star,
    title: '500+ clienți mulțumiți',
    description: 'Rating mediu 4.8/5',
  },
]

export default function TrustSignals() {
  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-title mb-4">
            DE CE SĂ NE ALEGI PE NOI
          </h2>
          <p className="section-subtitle">
            Totul e gândit pentru tine. Fără surprize neplăcute.
          </p>
        </motion.div>

        {/* Trust Signals Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {signals.map((signal, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="trust-badge text-center p-6 rounded-2xl bg-cream-50 hover:bg-cream-100 transition-colors"
            >
              <div className="w-14 h-14 mx-auto mb-4 bg-gold/10 rounded-full flex items-center justify-center">
                <signal.icon className="h-7 w-7 text-gold" />
              </div>
              <h3 className="font-display text-lg text-text mb-1">
                {signal.title}
              </h3>
              <p className="text-sm text-text-secondary">
                {signal.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

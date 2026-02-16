'use client'

import { Truck, RefreshCw, Shield, Lock } from 'lucide-react'

const signals = [
  { icon: Truck, text: 'Livrare 24-48h' },
  { icon: RefreshCw, text: 'Retur gratuit 30 zile' },
  { icon: Shield, text: '100% originale' },
  { icon: Lock, text: 'Plată securizată' },
]

export default function TrustBar() {
  return (
    <section className="py-8 bg-text">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {signals.map((signal, index) => (
            <div
              key={index}
              className="flex items-center justify-center gap-3 text-white"
            >
              <signal.icon className="h-5 w-5 text-gold flex-shrink-0" />
              <span className="text-sm font-medium">{signal.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

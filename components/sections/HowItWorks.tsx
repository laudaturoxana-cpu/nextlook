'use client'

import { motion } from 'framer-motion'
import { ShoppingBag, CheckCircle, Package, Lightbulb } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: ShoppingBag,
    title: 'ALEGE',
    description: 'Răsfoiești, filtrezi după mărime/culoare/preț. Găsești ce îți place. Click, adaugi în coș.',
  },
  {
    number: '02',
    icon: CheckCircle,
    title: 'COMANDĂ',
    description: 'Completezi adresa, alegi metoda de livrare și plată. Primești confirmare instant pe email.',
  },
  {
    number: '03',
    icon: Package,
    title: 'PRIMEȘTI',
    description: 'Livrare în 24-48h. Probezi acasă. Dacă nu îți place, retur gratuit în 30 zile.',
  },
]

export default function HowItWorks() {
  return (
    <section id="cum-functioneaza" className="py-20 lg:py-32 bg-cream">
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
            3 PAȘI. ZERO COMPLICAȚII.
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="text-center"
            >
              {/* Number Badge */}
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto bg-gold rounded-full flex items-center justify-center shadow-gold">
                  <step.icon className="h-8 w-8 text-white" />
                </div>
                <span className="absolute -top-2 -right-2 w-8 h-8 bg-text text-white font-display text-sm rounded-full flex items-center justify-center">
                  {step.number}
                </span>
              </div>

              {/* Content */}
              <h3 className="font-display text-2xl text-text mb-3">
                {step.title}
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {step.description}
              </p>

              {/* Connector Line (desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 right-0 w-1/2 h-0.5 bg-sand" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Tip Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-gold-light rounded-2xl p-6 flex items-start gap-4">
            <Lightbulb className="h-6 w-6 text-gold flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-text mb-1">Sfat:</p>
              <p className="text-text-secondary text-sm">
                Dacă nu ești sigură de mărime, poți comanda 2 mărimi. Le probezi acasă și returnezi ce nu îți vine. Fără bătăi de cap, fără costuri extra.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

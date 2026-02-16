'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const testimonials = [
  {
    text: 'Produse originale, livrare în 24h. Am comandat de 3 ori.',
    name: 'Andrei M.',
    city: 'București',
  },
  {
    text: 'Returul chiar e gratuit, am testat. Recomand!',
    name: 'Ioana P.',
    city: 'Cluj',
  },
  {
    text: 'Am probat acasă, am returnat ce nu mi-a venit. Zero stres.',
    name: 'Cristina L.',
    city: 'Timișoara',
  },
]

export default function Testimonials() {
  return (
    <section className="py-16 lg:py-24 bg-cream">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Overall Rating */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-1 mb-3" role="img" aria-label="Rating: 4.8 din 5 stele">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 text-gold fill-gold" aria-hidden="true" />
            ))}
          </div>
          <p className="font-display text-display-sm text-text">4.8 / 5</p>
          <p className="text-text-secondary text-sm mt-1">din 500+ recenzii verificate</p>
        </motion.div>

        {/* Testimonials Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-5 shadow-soft text-center"
            >
              <p className="text-text text-sm leading-relaxed mb-3">
                &ldquo;{testimonial.text}&rdquo;
              </p>
              <p className="text-xs text-text-secondary">
                <span className="font-medium text-text">{testimonial.name}</span> &middot; {testimonial.city}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

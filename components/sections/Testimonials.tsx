'use client'

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    rating: 5,
    text: 'Am comandat cu frică că o să fie fake, dar am primit exact ce vedeam în poze. Adidașii sunt originali, au venit în 24h, și mi s-au potrivit perfect. Recomand cu încredere!',
    name: 'Maria T.',
    details: '34 ani, Brașov',
  },
  {
    rating: 5,
    text: 'In sfarsit un magazin care nu te ia cu minciuni. Preturi corecte, livrare rapida, si daca nu iti place, returnezi usor. Am comandat de 3 ori pana acum.',
    name: 'Andrei M.',
    details: '28 ani, București',
  },
  {
    rating: 5,
    text: 'M-am săturat să caut prin 10 site-uri. Aici găsesc tot ce am nevoie, selecție bună, fără chestii dubioase. Și returul chiar e gratuit, am testat!',
    name: 'Ioana P.',
    details: '31 ani, Cluj',
  },
  {
    rating: 5,
    text: 'Am comandat 2 perechi de sneakers să văd care îmi place mai mult. Le-am probat acasă, am returnat una, zero stres. Super experiență!',
    name: 'Cristina L.',
    details: '29 ani, Timișoara',
  },
]

export default function Testimonials() {
  return (
    <section className="py-20 lg:py-32 bg-cream">
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
            CE SPUN CLIENȚII NOȘTRI
          </h2>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-soft relative"
            >
              {/* Quote Icon */}
              <Quote className="absolute top-4 right-4 h-8 w-8 text-gold/20" />

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-gold fill-gold" />
                ))}
              </div>

              {/* Text */}
              <p className="text-text leading-relaxed mb-6">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div>
                <p className="font-medium text-text">{testimonial.name}</p>
                <p className="text-sm text-text-secondary">{testimonial.details}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

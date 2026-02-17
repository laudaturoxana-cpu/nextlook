'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

const categories = [
  {
    name: 'Femei',
    title: 'Haine & Încălțăminte pentru Ea',
    href: '/shop?category=femei',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800',
  },
  {
    name: 'Bărbați',
    title: 'Haine & Încălțăminte pentru El',
    href: '/shop?category=barbati',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
  },
  {
    name: 'Sneakers',
    title: 'Adidași Originali Nike, Adidas, Puma',
    href: '/shop?category=sneakers',
    image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800',
  },
  {
    name: 'Noutăți',
    title: 'Ultimele Sosiri',
    href: '/shop?category=noutati',
    image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800',
    badge: 'NOU',
  },
]

export default function CategoriesSection() {
  return (
    <section id="categorii" className="py-20 lg:py-32 bg-cream">
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
            EXPLOREAZĂ COLECȚIILE
          </h2>
          <p className="section-subtitle">
            Găsește rapid ceea ce cauți. Filtrează după categorie și descoperă stilul tău.
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={category.href}>
                <div className="category-card group relative h-80 lg:h-96 rounded-2xl overflow-hidden">
                  {/* Background Image */}
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Overlay */}
                  <div className="category-overlay" />

                  {/* Badge */}
                  {category.badge && (
                    <div className="absolute top-4 right-4">
                      <Badge variant="new" pulse>{category.badge}</Badge>
                    </div>
                  )}

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                    <h3 className="font-display text-3xl lg:text-4xl text-white mb-2">
                      {category.name.toUpperCase()}
                    </h3>
                    <p className="text-white/90 text-sm mb-6 max-w-xs">
                      {category.title}
                    </p>
                    <span className="inline-flex items-center gap-2 px-6 py-3 bg-white text-text font-body font-bold text-sm uppercase tracking-wider rounded-full opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      Vezi Colecția
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

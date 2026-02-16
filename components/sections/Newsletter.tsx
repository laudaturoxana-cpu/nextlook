'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import toast from 'react-hot-toast'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast.error('Te rugăm să introduci adresa de email')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setIsSuccess(true)
        setEmail('')
        toast.success('Te-ai abonat cu succes!')
      } else {
        throw new Error('Failed to subscribe')
      }
    } catch {
      toast.error('A apărut o eroare. Te rugăm să încerci din nou.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="py-20 lg:py-32 bg-olive">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-xl mx-auto text-center"
        >
          {/* Title */}
          <h2 className="font-display text-display-md text-white mb-4">
            PRIMEȘTE OFERTE EXCLUSIVE
          </h2>

          {/* Subtitle */}
          <p className="text-white/80 mb-8">
            Fii primul care află de reduceri, noutăți și look-uri inspiraționale.
            <br />
            Promitem: fără spam, doar ce contează.
          </p>

          {/* Form */}
          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-3 text-white"
            >
              <CheckCircle className="h-6 w-6 text-gold" />
              <span className="font-medium">Perfect! Verifică emailul pentru confirmare.</span>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label htmlFor="newsletter-email" className="sr-only">Adresa ta de email</label>
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Adresa ta de email"
                  className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-full text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                />
              </div>
              <Button
                type="submit"
                isLoading={isLoading}
                className="whitespace-nowrap"
              >
                <Send className="h-4 w-4 mr-2" />
                Abonează-te
              </Button>
            </form>
          )}

          {/* Privacy Note */}
          <p className="mt-6 text-xs text-white/80">
            Prin abonare, ești de acord cu{' '}
            <a href="/confidentialitate" className="underline hover:text-white transition-colors">
              Politica de confidențialitate
            </a>
            . Poți să te dezabonezi oricând.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import toast from 'react-hot-toast'

const contactInfo = [
  {
    icon: Phone,
    title: 'Telefon',
    content: '+40 749 976 984',
    subtext: 'L-V: 9:00 - 18:00',
  },
  {
    icon: Mail,
    title: 'Email',
    content: 'contact@nextlook.ro',
    subtext: 'Răspundem în max 2 ore',
  },
  {
    icon: MapPin,
    title: 'Adresă',
    content: 'Brașov, Str. Carpaților nr. 6',
    subtext: 'Bl. E28, Ap. 27',
  },
  {
    icon: Clock,
    title: 'Program',
    content: 'Luni - Vineri',
    subtext: '9:00 - 18:00',
  },
]

const faq = [
  {
    question: 'Cum pot returna un produs?',
    answer: 'Ai 30 de zile să returnezi produsul gratuit. Completează formularul de retur din contul tău sau contactează-ne și te ghidăm pas cu pas.',
  },
  {
    question: 'Cât durează livrarea?',
    answer: 'Livrarea standard durează 24-48 ore în toată România. Pentru comenzi plasate înainte de ora 14:00, produsele pleacă în aceeași zi.',
  },
  {
    question: 'Produsele sunt originale?',
    answer: 'Da, 100%. Colaborăm doar cu furnizori autorizați și fiecare produs vine cu etichetă originală și certificat de garanție.',
  },
  {
    question: 'Cum aleg mărimea corectă?',
    answer: 'Fiecare produs are un ghid detaliat de mărimi. Dacă nu ești sigur/ă, poți comanda 2 mărimi și returna gratis ce nu îți vine.',
  },
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulare trimitere
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast.success('Mesajul a fost trimis! Îți vom răspunde în cel mai scurt timp.')
    setFormData({ name: '', email: '', subject: '', message: '' })
    setIsLoading(false)
  }

  return (
    <>
      <Header />
      <main className="pt-24 min-h-screen bg-cream">
        {/* Hero Section */}
        <section className="py-16 lg:py-24 bg-gradient-to-br from-cream via-cream-100 to-cream-200">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <h1 className="font-display text-display-lg text-text mb-4">
              HAI SĂ VORBIM
            </h1>
            <p className="text-lg text-text-secondary max-w-xl mx-auto">
              Ai întrebări? Suntem aici să te ajutăm. Răspundem rapid și ne place să găsim soluții.
            </p>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-12">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactInfo.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-soft text-center"
                >
                  <div className="w-14 h-14 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <item.icon className="h-7 w-7 text-gold" />
                  </div>
                  <h3 className="font-display text-lg text-text mb-1">
                    {item.title}
                  </h3>
                  <p className="font-medium text-text">{item.content}</p>
                  <p className="text-sm text-text-secondary">{item.subtext}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form & FAQ */}
        <section className="py-12 lg:py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="bg-white rounded-2xl shadow-soft p-6 lg:p-8">
                <h2 className="font-display text-display-sm text-text mb-6">
                  TRIMITE-NE UN MESAJ
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Nume"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                    <Input
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <Input
                    label="Subiect"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Mesaj <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 border border-sand rounded-xl font-body text-text placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all resize-none h-32"
                      required
                    />
                  </div>
                  <Button type="submit" isLoading={isLoading} className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Trimite Mesaj
                  </Button>
                </form>
              </div>

              {/* FAQ */}
              <div>
                <h2 className="font-display text-display-sm text-text mb-6">
                  ÎNTREBĂRI FRECVENTE
                </h2>
                <div className="space-y-4">
                  {faq.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-2xl p-6 shadow-soft"
                    >
                      <div className="flex items-start gap-4">
                        <MessageCircle className="h-5 w-5 text-gold flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="font-medium text-text mb-2">
                            {item.question}
                          </h3>
                          <p className="text-text-secondary text-sm">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

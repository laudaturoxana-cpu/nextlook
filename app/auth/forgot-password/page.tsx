'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const { error } = await resetPassword(email)

    if (error) {
      toast.error('A apărut o eroare. Încearcă din nou.')
      setIsLoading(false)
      return
    }

    setIsSubmitted(true)
    setIsLoading(false)
  }

  if (isSubmitted) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="font-display text-display-md text-text mb-4">
            VERIFICĂ EMAILUL
          </h1>
          <p className="text-text-secondary mb-8">
            Am trimis un link de resetare a parolei la <strong>{email}</strong>.
            Verifică și folderul de spam dacă nu găsești emailul.
          </p>
          <Link href="/auth/login">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Înapoi la conectare
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-12">
      <div className="max-w-md mx-auto">
        {/* Back Link */}
        <Link
          href="/auth/login"
          className="inline-flex items-center text-text-secondary hover:text-gold transition-colors mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Înapoi la conectare
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-display-md text-text mb-2">
            AI UITAT PAROLA?
          </h1>
          <p className="text-text-secondary">
            Introdu emailul și îți trimitem un link pentru a reseta parola.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-soft p-6 lg:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplu.ro"
              required
              autoComplete="email"
            />

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              <Mail className="mr-2 h-4 w-4" />
              Trimite link de resetare
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

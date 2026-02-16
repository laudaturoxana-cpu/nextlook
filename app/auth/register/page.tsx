'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

const benefits = [
  'Checkout rapid cu datele salvate',
  'Urmărește comenzile în timp real',
  'Acces la oferte exclusive',
  'Istoric complet al comenzilor',
]

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/account'
  const { signUp } = useAuth()

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [acceptNewsletter, setAcceptNewsletter] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('Parolele nu coincid')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Parola trebuie să aibă minim 6 caractere')
      return
    }

    if (!acceptTerms) {
      toast.error('Trebuie să accepți termenii și condițiile')
      return
    }

    setIsLoading(true)

    const { error } = await signUp(formData.email, formData.password, formData.fullName)

    if (error) {
      if (error.message.includes('already registered')) {
        toast.error('Acest email este deja înregistrat')
      } else {
        toast.error('A apărut o eroare. Încearcă din nou.')
      }
      setIsLoading(false)
      return
    }

    // Subscribe to newsletter if checked
    if (acceptNewsletter) {
      try {
        await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email }),
        })
      } catch (error) {
        // Don't fail registration if newsletter fails
      }
    }

    toast.success('Contul a fost creat! Verifică emailul pentru confirmare.')
    router.push(redirectTo)
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Benefits */}
          <div className="hidden lg:block">
            <h2 className="font-display text-2xl text-text mb-6">
              DE CE SĂ ÎȚI FACI CONT?
            </h2>
            <ul className="space-y-4">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-gold" />
                  </div>
                  <span className="text-text-secondary">{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 p-6 bg-gold/5 rounded-2xl border border-gold/20">
              <p className="text-gold font-medium mb-2">Ofertă de bun venit</p>
              <p className="text-text-secondary text-sm">
                Creează-ți cont și primești 10% reducere la prima comandă!
              </p>
            </div>
          </div>

          {/* Register Form */}
          <div>
            <div className="text-center lg:text-left mb-8">
              <h1 className="font-display text-display-md text-text mb-2">
                CREEAZĂ CONT
              </h1>
              <p className="text-text-secondary">
                Este gratuit și durează mai puțin de un minut.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-soft p-6 lg:p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Nume complet"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Maria Popescu"
                  required
                  autoComplete="name"
                />

                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemplu.ro"
                  required
                  autoComplete="email"
                />

                <div className="relative">
                  <Input
                    label="Parolă"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minim 6 caractere"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-text-secondary hover:text-text transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                <Input
                  label="Confirmă parola"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Repetă parola"
                  required
                  autoComplete="new-password"
                />

                <div className="space-y-3 pt-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="w-4 h-4 text-gold rounded focus:ring-gold mt-1"
                      required
                    />
                    <span className="text-sm text-text-secondary">
                      Accept{' '}
                      <Link href="/termeni" className="text-gold hover:underline">
                        Termenii și Condițiile
                      </Link>{' '}
                      și{' '}
                      <Link href="/confidentialitate" className="text-gold hover:underline">
                        Politica de Confidențialitate
                      </Link>
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptNewsletter}
                      onChange={(e) => setAcceptNewsletter(e.target.checked)}
                      className="w-4 h-4 text-gold rounded focus:ring-gold mt-1"
                    />
                    <span className="text-sm text-text-secondary">
                      Vreau să primesc oferte și noutăți pe email (opțional)
                    </span>
                  </label>
                </div>

                <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                  Creează Cont
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>

              {/* Login Link */}
              <p className="text-center text-text-secondary mt-6">
                Ai deja cont?{' '}
                <Link
                  href={`/auth/login${redirectTo !== '/account' ? `?redirect=${redirectTo}` : ''}`}
                  className="text-gold font-medium hover:underline"
                >
                  Conectează-te
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

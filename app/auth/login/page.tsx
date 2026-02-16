'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/account'
  const { signIn } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const { error } = await signIn(email, password)

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Email sau parolă incorectă')
      } else {
        toast.error('A apărut o eroare. Încearcă din nou.')
      }
      setIsLoading(false)
      return
    }

    toast.success('Te-ai conectat cu succes!')
    router.push(redirectTo)
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-12">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-display-md text-text mb-2">
            BINE AI REVENIT
          </h1>
          <p className="text-text-secondary">
            Conectează-te pentru a-ți vedea comenzile și a economisi timp la checkout.
          </p>
        </div>

        {/* Login Form */}
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

            <div className="relative">
              <Input
                label="Parolă"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-text-secondary hover:text-text transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-gold rounded focus:ring-gold"
                />
                <span className="text-text-secondary">Ține-mă minte</span>
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-gold hover:underline"
              >
                Ai uitat parola?
              </Link>
            </div>

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Conectează-te
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-sand"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-text-secondary">sau</span>
            </div>
          </div>

          {/* Register Link */}
          <p className="text-center text-text-secondary">
            Nu ai cont?{' '}
            <Link
              href={`/auth/register${redirectTo !== '/account' ? `?redirect=${redirectTo}` : ''}`}
              className="text-gold font-medium hover:underline"
            >
              Creează-ți cont gratuit
            </Link>
          </p>
        </div>

        {/* Benefits */}
        <div className="mt-8 grid grid-cols-2 gap-4 text-center">
          <div className="bg-white/50 rounded-xl p-4">
            <p className="font-medium text-text text-sm">Checkout rapid</p>
            <p className="text-xs text-text-secondary">Datele salvate</p>
          </div>
          <div className="bg-white/50 rounded-xl p-4">
            <p className="font-medium text-text text-sm">Istoric comenzi</p>
            <p className="text-xs text-text-secondary">Toate într-un loc</p>
          </div>
        </div>
      </div>
    </div>
  )
}

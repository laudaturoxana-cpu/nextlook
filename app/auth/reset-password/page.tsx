'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if we have a valid session from the reset link
  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient()
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        setError('Link-ul de resetare a expirat sau este invalid.')
      }
    }

    checkSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error('Parolele nu coincid')
      return
    }

    if (password.length < 6) {
      toast.error('Parola trebuie să aibă minim 6 caractere')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        if (error.message.includes('session')) {
          setError('Link-ul de resetare a expirat. Te rugăm să soliciți un nou link.')
        } else {
          setError('A apărut o eroare. Încearcă din nou.')
        }
        setIsLoading(false)
        return
      }

      setIsSuccess(true)
      toast.success('Parola a fost schimbată cu succes!')

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login')
      }, 3000)
    } catch (err) {
      setError('A apărut o eroare neașteptată.')
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-soft p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="font-display text-2xl text-text mb-4">
              Parola a fost schimbată!
            </h1>
            <p className="text-text-secondary mb-6">
              Parola ta a fost actualizată cu succes. Vei fi redirecționat către pagina de conectare.
            </p>
            <Link href="/auth/login">
              <Button className="w-full">
                Mergi la Conectare
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-soft p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="font-display text-2xl text-text mb-4">
              Link expirat
            </h1>
            <p className="text-text-secondary mb-6">
              {error}
            </p>
            <Link href="/auth/forgot-password">
              <Button className="w-full">
                Solicită un nou link
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-12">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-gold" />
          </div>
          <h1 className="font-display text-display-md text-text mb-2">
            SETEAZĂ PAROLA NOUĂ
          </h1>
          <p className="text-text-secondary">
            Introdu noua parolă pentru contul tău.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-soft p-6 lg:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                label="Parola nouă"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              label="Confirmă parola nouă"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repetă parola nouă"
              required
              autoComplete="new-password"
            />

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Salvează Parola Nouă
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

function ResetPasswordLoading() {
  return (
    <div className="container mx-auto px-4 lg:px-8 py-12">
      <div className="max-w-md mx-auto">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-sand rounded-full mx-auto mb-4"></div>
          <div className="h-10 bg-sand rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-sand rounded w-1/2 mx-auto mb-8"></div>
          <div className="bg-white rounded-2xl shadow-soft p-6 lg:p-8 space-y-4">
            <div className="h-12 bg-sand rounded"></div>
            <div className="h-12 bg-sand rounded"></div>
            <div className="h-12 bg-sand rounded"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordForm />
    </Suspense>
  )
}

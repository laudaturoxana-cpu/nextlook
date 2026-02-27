'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { Lock, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// ─── Formularul de plată ──────────────────────────────────────────────────────

function PaymentForm({ orderId }: { orderId: string }) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsLoading(true)
    setErrorMessage(null)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmation/${orderId}`,
      },
    })

    // confirmPayment redirects on success — dacă ajunge aici e eroare
    if (error) {
      setErrorMessage(error.message || 'Plata a eșuat. Încearcă din nou.')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: 'tabs',
        }}
      />

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {errorMessage}
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || isLoading}
        size="lg"
        className="w-full"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Se procesează...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Plătește acum
          </span>
        )}
      </Button>

      <div className="flex items-center justify-center gap-2 text-xs text-text-secondary">
        <ShieldCheck className="h-4 w-4 text-green-600" />
        Plată securizată prin Stripe. Datele cardului nu sunt stocate.
      </div>
    </form>
  )
}

// ─── Pagina principală ────────────────────────────────────────────────────────

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.orderId as string
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  useEffect(() => {
    const secret = sessionStorage.getItem('stripe_client_secret')
    const pendingOrderId = sessionStorage.getItem('pending_order_id')

    if (!secret || pendingOrderId !== orderId) {
      // Dacă nu avem clientSecret valid, trimitem la confirmare
      router.replace(`/order-confirmation/${orderId}`)
      return
    }

    setClientSecret(secret)
    // Ștergem din sessionStorage după ce l-am citit
    sessionStorage.removeItem('stripe_client_secret')
    sessionStorage.removeItem('pending_order_id')
  }, [orderId, router])

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl text-text mb-2">Completează plata</h1>
            <p className="text-text-secondary text-sm">Comanda ta a fost creată. Introdu datele cardului pentru a finaliza.</p>
          </div>

          {/* Card form */}
          <div className="bg-white rounded-2xl shadow-soft p-6 lg:p-8">
            <div className="flex items-center gap-2 mb-6 pb-6 border-b border-sand">
              <div className="w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center">
                <Lock className="h-4 w-4 text-gold" />
              </div>
              <div>
                <p className="font-medium text-text text-sm">Plată securizată</p>
                <p className="text-xs text-text-secondary">Criptat cu SSL 256-bit</p>
              </div>
            </div>

            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#A58625',
                    colorBackground: '#ffffff',
                    colorText: '#2D2D2D',
                    borderRadius: '12px',
                    fontFamily: 'system-ui, sans-serif',
                  },
                },
              }}
            >
              <PaymentForm orderId={orderId} />
            </Elements>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock, Truck, Shield, Star, User, UserPlus, LogIn } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { formatPrice, romanianCounties } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const FREE_SHIPPING_THRESHOLD = 300
const SHIPPING_COST_RAPID = 20
const SHIPPING_COST_RAMBURS = 10

const checkoutSchema = z.object({
  email: z.string().email('Adresă de email invalidă'),
  phone: z.string().min(10, 'Număr de telefon invalid'),
  fullName: z.string().min(2, 'Numele este obligatoriu'),
  address: z.string().min(5, 'Adresa este obligatorie'),
  city: z.string().min(2, 'Orașul este obligatoriu'),
  county: z.string().min(2, 'Județul este obligatoriu'),
  postalCode: z.string().optional(),
  notes: z.string().optional(),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

const deliveryOptions = [
  {
    id: 'curier_rapid',
    name: 'Curier rapid (24-48h)',
    price: SHIPPING_COST_RAPID,
    description: 'Livrare prin curier în 1-2 zile lucrătoare',
  },
  {
    id: 'curier_gratuit',
    name: 'Curier gratuit (48-72h)',
    price: 0,
    description: 'Disponibil pentru comenzi peste 300 lei',
    minOrder: FREE_SHIPPING_THRESHOLD,
  },
]

const paymentOptions = [
  {
    id: 'ramburs',
    name: 'Ramburs',
    description: 'Plata în numerar la livrare. Se adaugă 10 lei taxă ramburs.',
    icon: Truck,
    extraCost: SHIPPING_COST_RAMBURS,
  },
]

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getSubtotal, clearCart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [deliveryMethod, setDeliveryMethod] = useState('curier_rapid')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [createAccount, setCreateAccount] = useState(false)
  const [accountPassword, setAccountPassword] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  })

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Pre-fill form with user data when logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      setValue('email', user.email || '')
      setValue('fullName', user.user_metadata?.full_name || '')
    }
  }, [isAuthenticated, user, setValue])

  const subtotal = getSubtotal()

  // Calculate shipping cost
  let shippingCost = 0
  if (deliveryMethod === 'curier_rapid') {
    shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST_RAPID
  }

  // Add ramburs fee if applicable
  const rambursFee = paymentMethod === 'ramburs' ? SHIPPING_COST_RAMBURS : 0
  const total = subtotal + shippingCost + rambursFee

  const onSubmit = async (data: CheckoutFormData) => {
    setIsLoading(true)

    try {
      // Create order in Supabase
      const orderData = {
        ...data,
        items: items.map((item) => ({
          product_id: item.product_id,
          product_name: item.product.name,
          product_image: item.product.images[0],
          size: item.size,
          color: item.color,
          price: item.product.price,
          quantity: item.quantity,
        })),
        subtotal,
        shippingCost,
        total,
        deliveryMethod,
        paymentMethod,
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'A apărut o eroare')
      }

      if (paymentMethod === 'card' && result.clientSecret) {
        // Redirect to Stripe payment
        // În producție, aici ar trebui să folosim Stripe Elements
        router.push(`/order-confirmation/${result.orderId}`)
      } else {
        // Ramburs - redirect to confirmation
        clearCart()
        router.push(`/order-confirmation/${result.orderId}`)
      }

      toast.success('Comanda a fost plasată cu succes!')
    } catch (error) {
      toast.error('A apărut o eroare. Te rugăm să încerci din nou.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isClient) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="container mx-auto px-4 lg:px-8 py-16">
          <div className="max-w-md mx-auto text-center">
            <h1 className="font-display text-display-md text-text mb-4">
              Coșul tău e gol
            </h1>
            <p className="text-text-secondary mb-8">
              Adaugă produse în coș pentru a finaliza comanda.
            </p>
            <Link href="/shop">
              <Button size="lg">Vezi Colecția</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <h1 className="font-display text-display-md text-text mb-8">
          FINALIZEAZĂ COMANDA
        </h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Login/Register Prompt for Guests */}
              {!isAuthenticated && (
                <div className="bg-gradient-to-r from-gold/5 to-gold/10 rounded-2xl p-6 border border-gold/20">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="font-medium text-text mb-1">Ai deja cont?</h3>
                      <p className="text-sm text-text-secondary">
                        Conectează-te pentru checkout rapid și istoric comenzi
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Link href="/auth/login?redirect=/checkout">
                        <Button variant="outline" size="sm">
                          <LogIn className="h-4 w-4 mr-2" />
                          Conectează-te
                        </Button>
                      </Link>
                      <Link href="/auth/register?redirect=/checkout">
                        <Button size="sm">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Creează cont
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Welcome message for logged-in users */}
              {isAuthenticated && user && (
                <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-green-800">
                        Bine ai revenit, {user.user_metadata?.full_name || 'utilizator'}!
                      </p>
                      <p className="text-sm text-green-600">
                        Datele tale au fost completate automat
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Info */}
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h2 className="font-display text-xl text-text mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 bg-gold text-white rounded-full flex items-center justify-center text-sm">1</span>
                  Date de Contact
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Email"
                    type="email"
                    {...register('email')}
                    error={errors.email?.message}
                    required
                    disabled={isAuthenticated}
                  />
                  <Input
                    label="Telefon"
                    type="tel"
                    {...register('phone')}
                    error={errors.phone?.message}
                    required
                  />
                </div>

                {/* Create Account Option for Guests */}
                {!isAuthenticated && (
                  <div className="mt-4 pt-4 border-t border-sand">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={createAccount}
                        onChange={(e) => setCreateAccount(e.target.checked)}
                        className="w-4 h-4 text-gold rounded focus:ring-gold mt-1"
                      />
                      <div>
                        <span className="text-sm font-medium text-text">
                          Vreau să îmi creez cont pentru comenzi viitoare
                        </span>
                        <p className="text-xs text-text-secondary mt-1">
                          Salvează datele pentru checkout rapid și urmărește comenzile
                        </p>
                      </div>
                    </label>

                    {createAccount && (
                      <div className="mt-4">
                        <Input
                          label="Parolă pentru contul nou"
                          type="password"
                          value={accountPassword}
                          onChange={(e) => setAccountPassword(e.target.value)}
                          placeholder="Minim 6 caractere"
                          required={createAccount}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h2 className="font-display text-xl text-text mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 bg-gold text-white rounded-full flex items-center justify-center text-sm">2</span>
                  Adresă de Livrare
                </h2>
                <div className="space-y-4">
                  <Input
                    label="Nume complet"
                    {...register('fullName')}
                    error={errors.fullName?.message}
                    required
                  />
                  <Input
                    label="Adresă completă"
                    placeholder="Strada, număr, bloc, scară, apartament"
                    {...register('address')}
                    error={errors.address?.message}
                    required
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                      label="Oraș"
                      {...register('city')}
                      error={errors.city?.message}
                      required
                    />
                    <Select
                      label="Județ"
                      {...register('county')}
                      error={errors.county?.message}
                      options={romanianCounties.map((c) => ({ value: c, label: c }))}
                      placeholder="Selectează"
                      required
                    />
                    <Input
                      label="Cod poștal"
                      {...register('postalCode')}
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Method */}
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h2 className="font-display text-xl text-text mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 bg-gold text-white rounded-full flex items-center justify-center text-sm">3</span>
                  Metodă de Livrare
                </h2>
                <div className="space-y-3">
                  {deliveryOptions.map((option) => {
                    const isDisabled = !!(option.minOrder && subtotal < option.minOrder)
                    return (
                      <label
                        key={option.id}
                        className={cn(
                          'flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors',
                          deliveryMethod === option.id
                            ? 'border-gold bg-gold/5'
                            : 'border-sand hover:border-gold/50',
                          isDisabled && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <input
                          type="radio"
                          name="delivery"
                          value={option.id}
                          checked={deliveryMethod === option.id}
                          onChange={() => !isDisabled && setDeliveryMethod(option.id)}
                          disabled={isDisabled}
                          className="w-5 h-5 text-gold focus:ring-gold"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-text">{option.name}</span>
                            <span className="font-medium text-gold">
                              {option.id === 'curier_rapid' && subtotal >= FREE_SHIPPING_THRESHOLD
                                ? 'GRATUIT'
                                : option.price === 0 ? 'GRATUIT' : formatPrice(option.price)}
                            </span>
                          </div>
                          <p className="text-sm text-text-secondary">{option.description}</p>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h2 className="font-display text-xl text-text mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 bg-gold text-white rounded-full flex items-center justify-center text-sm">4</span>
                  Metodă de Plată
                </h2>
                <div className="space-y-3">
                  {paymentOptions.map((option) => (
                    <label
                      key={option.id}
                      className={cn(
                        'flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors',
                        paymentMethod === option.id
                          ? 'border-gold bg-gold/5'
                          : 'border-sand hover:border-gold/50'
                      )}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={option.id}
                        checked={paymentMethod === option.id}
                        onChange={() => setPaymentMethod(option.id)}
                        className="w-5 h-5 text-gold focus:ring-gold"
                      />
                      <option.icon className="h-6 w-6 text-gold" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-text">{option.name}</span>
                          {option.extraCost && (
                            <span className="text-sm text-text-secondary">
                              +{formatPrice(option.extraCost)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-text-secondary">{option.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h2 className="font-display text-xl text-text mb-4">
                  Observații (opțional)
                </h2>
                <textarea
                  {...register('notes')}
                  placeholder="Observații pentru curier, interval orar preferat, etc."
                  className="w-full px-4 py-3 border border-sand rounded-xl font-body text-text placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all resize-none h-24"
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-soft p-6 sticky top-28">
                <h2 className="font-display text-xl text-text mb-6">SUMAR COMANDĂ</h2>

                {/* Products */}
                <div className="space-y-4 pb-6 border-b border-sand">
                  {items.map((item) => (
                    <div key={`${item.product_id}-${item.size}-${item.color}`} className="flex gap-3">
                      <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-cream-50 flex-shrink-0">
                        <Image
                          src={item.product.images[0] || '/images/placeholder.jpg'}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text line-clamp-2">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {item.size && `${item.size}`}
                          {item.size && item.color && ' · '}
                          {item.color && `${item.color}`}
                        </p>
                        <p className="text-sm font-medium text-gold mt-1">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-3 py-6 border-b border-sand">
                  <div className="flex justify-between text-text-secondary">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Livrare</span>
                    <span>{shippingCost === 0 ? 'GRATUITĂ' : formatPrice(shippingCost)}</span>
                  </div>
                  {rambursFee > 0 && (
                    <div className="flex justify-between text-text-secondary">
                      <span>Taxă ramburs</span>
                      <span>{formatPrice(rambursFee)}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between py-6">
                  <span className="font-medium text-text text-lg">Total de plată</span>
                  <span className="font-display text-2xl text-gold">{formatPrice(total)}</span>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  isLoading={isLoading}
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Plasează Comanda
                </Button>

                {/* Terms */}
                <p className="mt-4 text-xs text-text-secondary text-center">
                  Apăsând pe buton, accept{' '}
                  <Link href="/termeni" className="text-gold hover:underline">
                    Termenii și Condițiile
                  </Link>{' '}
                  și{' '}
                  <Link href="/confidentialitate" className="text-gold hover:underline">
                    Politica de confidențialitate
                  </Link>
                  .
                </p>

                {/* Trust Signals */}
                <div className="mt-6 pt-6 border-t border-sand flex items-center justify-center gap-4 text-xs text-text-secondary">
                  <div className="flex items-center gap-1">
                    <Lock className="h-4 w-4 text-gold" />
                    SSL Securizat
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="h-4 w-4 text-gold" />
                    Protecție cumpărător
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-gold" />
                    500+ clienți
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

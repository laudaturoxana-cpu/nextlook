'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Lock, Truck, RefreshCw } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const FREE_SHIPPING_THRESHOLD = 300
const SHIPPING_COST = 20

export default function CartPage() {
  const { items, updateQuantity, removeItem, getSubtotal, clearCart } = useCart()
  const [couponCode, setCouponCode] = useState('')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const subtotal = getSubtotal()
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const total = subtotal + shippingCost
  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal

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
            <ShoppingBag className="h-24 w-24 text-sand mx-auto mb-6" />
            <h1 className="font-display text-display-md text-text mb-4">
              Coșul tău e gol
            </h1>
            <p className="text-text-secondary mb-8">
              Hai să găsim ceva frumos pentru tine!
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
          COȘUL TĂU
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Free Shipping Progress */}
            {remainingForFreeShipping > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-soft">
                <p className="text-sm text-text mb-2">
                  Mai adaugă <span className="font-bold text-gold">{formatPrice(remainingForFreeShipping)}</span> pentru livrare gratuită!
                </p>
                <div className="h-2 bg-sand rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {remainingForFreeShipping <= 0 && (
              <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
                <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Felicitări! Ai livrare gratuită!
                </p>
              </div>
            )}

            {/* Items List */}
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
              {items.map((item, index) => (
                <motion.div
                  key={`${item.product_id}-${item.size}-${item.color}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 flex gap-6 ${index < items.length - 1 ? 'border-b border-sand' : ''}`}
                >
                  {/* Product Image */}
                  <Link
                    href={`/product/${item.product.slug}`}
                    className="relative w-28 h-36 rounded-xl overflow-hidden bg-cream-50 flex-shrink-0"
                  >
                    <Image
                      src={item.product.images[0] || '/images/placeholder.jpg'}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </Link>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-4">
                      <div>
                        {item.product.brand && (
                          <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">
                            {item.product.brand}
                          </p>
                        )}
                        <Link
                          href={`/product/${item.product.slug}`}
                          className="font-medium text-text hover:text-gold transition-colors line-clamp-2"
                        >
                          {item.product.name}
                        </Link>

                        {/* Variants */}
                        <div className="mt-2 text-sm text-text-secondary">
                          {item.size && <span>Mărime: {item.size}</span>}
                          {item.size && item.color && <span> · </span>}
                          {item.color && <span>Culoare: {item.color}</span>}
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.product_id, item.size, item.color)}
                        className="p-2 text-text-secondary hover:text-red-500 transition-colors h-fit"
                        aria-label="Șterge produsul"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Price & Quantity */}
                    <div className="mt-4 flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-sand rounded-xl">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product_id,
                              item.size,
                              item.color,
                              item.quantity - 1
                            )
                          }
                          className="p-2 hover:bg-cream-50 rounded-l-xl transition-colors"
                          aria-label="Scade cantitatea"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product_id,
                              item.size,
                              item.color,
                              item.quantity + 1
                            )
                          }
                          className="p-2 hover:bg-cream-50 rounded-r-xl transition-colors"
                          aria-label="Crește cantitatea"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="font-display text-xl text-gold">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-text-secondary">
                            {formatPrice(item.product.price)} / buc
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Continue Shopping */}
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-text-secondary hover:text-gold transition-colors"
            >
              ← Continuă cumpărăturile
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-soft p-6 sticky top-28">
              <h2 className="font-display text-xl text-text mb-6">SUMAR COMANDĂ</h2>

              {/* Coupon Code */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <Input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Cod promoțional"
                    className="flex-1"
                  />
                  <Button variant="secondary" size="sm" className="whitespace-nowrap">
                    Aplică
                  </Button>
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-3 pb-6 border-b border-sand">
                <div className="flex justify-between text-text-secondary">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Livrare</span>
                  <span>{shippingCost === 0 ? 'GRATUITĂ' : formatPrice(shippingCost)}</span>
                </div>
              </div>

              <div className="flex justify-between py-6">
                <span className="font-medium text-text">Total</span>
                <span className="font-display text-2xl text-gold">{formatPrice(total)}</span>
              </div>

              {/* Checkout Button */}
              <Link href="/checkout" className="block">
                <Button className="w-full" size="lg">
                  Finalizează Comanda
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              {/* Trust Signals */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Lock className="h-4 w-4 text-gold" />
                  <span>Plată 100% securizată</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Truck className="h-4 w-4 text-gold" />
                  <span>Livrare în 24-48h</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <RefreshCw className="h-4 w-4 text-gold" />
                  <span>Retur gratuit 30 zile</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

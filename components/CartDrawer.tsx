'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

const FREE_SHIPPING_THRESHOLD = 200

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, getSubtotal } = useCart()
  const subtotal = getSubtotal()
  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-sand">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-6 w-6 text-gold" />
                <h2 className="font-display text-2xl tracking-wide">COȘUL TĂU</h2>
                <span className="text-sm text-text-secondary">
                  ({items.length} {items.length === 1 ? 'produs' : 'produse'})
                </span>
              </div>
              <button
                onClick={closeCart}
                className="p-2 hover:bg-cream-50 rounded-full transition-colors"
                aria-label="Închide coșul"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Free Shipping Progress */}
            {items.length > 0 && remainingForFreeShipping > 0 && (
              <div className="px-6 py-4 bg-cream-50 border-b border-sand">
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

            {items.length > 0 && remainingForFreeShipping <= 0 && (
              <div className="px-6 py-4 bg-green-50 border-b border-green-100">
                <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                  <span>🎉</span> Felicitări! Ai livrare gratuită!
                </p>
              </div>
            )}

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="h-16 w-16 text-sand mb-4" />
                  <h3 className="font-display text-2xl text-text mb-2">Coșul tău e gol</h3>
                  <p className="text-text-secondary mb-6">
                    Hai să găsim ceva frumos pentru tine!
                  </p>
                  <Button onClick={closeCart}>
                    <Link href="/shop">Vezi Colecția</Link>
                  </Button>
                </div>
              ) : (
                <ul className="space-y-6">
                  {items.map((item) => (
                    <li key={`${item.product_id}-${item.size}-${item.color}`} className="flex gap-4">
                      {/* Product Image */}
                      <Link
                        href={`/product/${item.product.slug}`}
                        onClick={closeCart}
                        className="relative w-24 h-32 rounded-xl overflow-hidden bg-cream-50 flex-shrink-0"
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
                        <Link
                          href={`/product/${item.product.slug}`}
                          onClick={closeCart}
                          className="font-medium text-text hover:text-gold transition-colors line-clamp-2"
                        >
                          {item.product.name}
                        </Link>

                        {/* Variants */}
                        <div className="mt-1 text-sm text-text-secondary">
                          {item.size && <span>Mărime: {item.size}</span>}
                          {item.size && item.color && <span> · </span>}
                          {item.color && <span>Culoare: {item.color}</span>}
                        </div>

                        {/* Price */}
                        <p className="mt-2 font-display text-lg text-gold">
                          {formatPrice(item.product.price)}
                        </p>

                        {/* Quantity Controls */}
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center border border-sand rounded-full">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product_id,
                                  item.size,
                                  item.color,
                                  item.quantity - 1
                                )
                              }
                              className="p-2 hover:bg-cream-50 rounded-l-full transition-colors"
                              aria-label="Scade cantitatea"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="px-4 font-medium">{item.quantity}</span>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product_id,
                                  item.size,
                                  item.color,
                                  item.quantity + 1
                                )
                              }
                              className="p-2 hover:bg-cream-50 rounded-r-full transition-colors"
                              aria-label="Crește cantitatea"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.product_id, item.size, item.color)}
                            className="p-2 text-text-secondary hover:text-red-500 transition-colors"
                            aria-label="Șterge produsul"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-sand p-6 space-y-4">
                {/* Subtotal */}
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Subtotal</span>
                  <span className="font-display text-2xl text-text">{formatPrice(subtotal)}</span>
                </div>

                {/* Trust Signals */}
                <div className="flex items-center justify-center gap-4 text-xs text-text-secondary">
                  <span>🔒 Plată securizată</span>
                  <span>🔄 Retur gratuit 30 zile</span>
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                  <Link href="/checkout" onClick={closeCart} className="block">
                    <Button className="w-full" size="lg">
                      Finalizează Comanda
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/cart" onClick={closeCart} className="block">
                    <Button variant="outline" className="w-full" size="lg">
                      Vezi Coșul Complet
                    </Button>
                  </Link>
                  <button
                    onClick={closeCart}
                    className="w-full text-center text-sm text-text-secondary hover:text-text transition-colors py-2"
                  >
                    Continuă cumpărăturile
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

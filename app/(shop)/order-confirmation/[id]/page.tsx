'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { CheckCircle, Package, Mail, Phone, ArrowRight, Banknote } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatPrice, getOrderStatusText, getDeliveryDate } from '@/lib/utils'
import { useCart } from '@/hooks/useCart'
import { Order } from '@/types'

export default function OrderConfirmationPage() {
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { clearCart } = useCart()

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${params.id}`)
        const data = await response.json()
        if (data.order) {
          setOrder(data.order)
          // Clear cart after successful order fetch
          clearCart()
        }
      } catch (error) {
        console.error('Error fetching order:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchOrder()
    }
  }, [params.id, clearCart])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-display-md text-text mb-4">
            Comanda nu a fost găsită
          </h1>
          <Link href="/shop">
            <Button>Înapoi la magazin</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-12"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="font-display text-display-md text-text mb-2">
              COMANDA TA A FOST PLASATĂ CU SUCCES!
            </h1>
            <p className="text-text-secondary">
              Îți mulțumim pentru comandă. Vei primi un email de confirmare în câteva minute.
            </p>
          </motion.div>

          {/* Order Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-soft p-6 lg:p-8 mb-8"
          >
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-sand">
              <div>
                <p className="text-sm text-text-secondary">Număr comandă</p>
                <p className="font-display text-2xl text-gold">#{order.order_number}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-text-secondary">Status</p>
                <p className="font-medium text-text">
                  {getOrderStatusText(order.status)}
                </p>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 pb-6 border-b border-sand">
              <div>
                <p className="text-sm text-text-secondary mb-2">Livrare estimată</p>
                <p className="font-medium text-text">
                  {getDeliveryDate(order.delivery_method)}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-secondary mb-2">Adresă livrare</p>
                <p className="font-medium text-text">
                  {order.shipping_name}
                  <br />
                  {order.shipping_address}
                  <br />
                  {order.shipping_city}, {order.shipping_county}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6 pb-6 border-b border-sand">
              <p className="font-medium text-text mb-4">Produse comandate</p>
              <div className="space-y-4">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-cream-50 flex-shrink-0">
                      <Image
                        src={item.product_image}
                        alt={item.product_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-text line-clamp-2">
                        {item.product_name}
                      </p>
                      <p className="text-sm text-text-secondary">
                        {item.size && `Mărime: ${item.size}`}
                        {item.size && item.color && ' · '}
                        {item.color && `Culoare: ${item.color}`}
                        {' · '}
                        Cantitate: {item.quantity}
                      </p>
                      <p className="text-gold font-medium mt-1">
                        {formatPrice(item.subtotal)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Livrare</span>
                <span>{order.shipping_cost === 0 ? 'GRATUITĂ' : formatPrice(order.shipping_cost)}</span>
              </div>
              <div className="flex justify-between font-medium text-text pt-2 border-t border-sand">
                <span>{order.payment_method === 'ramburs' ? 'Total de plată la livrare' : 'Total plătit'}</span>
                <span className="font-display text-xl text-gold">
                  {formatPrice(order.total)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                {order.payment_method === 'ramburs' ? (
                  <>
                    <Banknote className="h-4 w-4 text-gold" />
                    <span>Plata se face la livrare (cash sau card)</span>
                  </>
                ) : (
                  <span>Metodă plată: Card online</span>
                )}
              </div>
            </div>
          </motion.div>

          {/* What's Next */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-soft p-6 lg:p-8 mb-8"
          >
            <h2 className="font-display text-xl text-text mb-6">CE URMEAZĂ?</h2>
            <div className="space-y-4">
              {[
                { step: 1, text: 'Vei primi un email de confirmare în câteva minute' },
                { step: 2, text: 'Comanda ta va fi procesată în 2-4 ore' },
                { step: 3, text: 'Vei primi tracking number când produsele pleacă în livrare' },
                { step: 4, text: 'Ești la o zi distanță de noul tău look! 🎉' },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-gold font-medium text-sm">{item.step}</span>
                  </div>
                  <p className="text-text-secondary pt-1">{item.text}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/account/orders">
              <Button variant="outline" size="lg">
                <Package className="mr-2 h-5 w-5" />
                Vezi Detalii Comandă
              </Button>
            </Link>
            <Link href="/shop">
              <Button size="lg">
                Continuă Cumpărăturile
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>

          {/* Support */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-12 text-text-secondary"
          >
            <p className="mb-4">Ai întrebări? Contactează-ne:</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a
                href="mailto:contact@nextlook.ro"
                className="flex items-center gap-2 hover:text-gold transition-colors"
              >
                <Mail className="h-5 w-5" />
                contact@nextlook.ro
              </a>
              <a
                href="tel:+40722123456"
                className="flex items-center gap-2 hover:text-gold transition-colors"
              >
                <Phone className="h-5 w-5" />
                +40 722 123 456
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

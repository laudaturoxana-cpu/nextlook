'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Package, ChevronRight, Clock, Truck, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatPrice, getOrderStatusColor, getOrderStatusText } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { Order } from '@/types'
import { cn } from '@/lib/utils'

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
    case 'confirmed':
      return Clock
    case 'processing':
    case 'shipped':
      return Truck
    case 'delivered':
      return CheckCircle
    case 'cancelled':
      return XCircle
    default:
      return Package
  }
}

export default function OrdersPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/account/orders')
      return
    }

    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders')
        const data = await response.json()
        if (data.orders) {
          setOrders(data.orders)
        }
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchOrders()
    }
  }, [isAuthenticated, authLoading, router])

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-cream-100 rounded w-48" />
          <div className="h-12 bg-cream-100 rounded w-64" />
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 space-y-4">
                <div className="h-6 bg-cream-100 rounded w-1/3" />
                <div className="flex gap-4">
                  <div className="w-16 h-20 bg-cream-100 rounded" />
                  <div className="w-16 h-20 bg-cream-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="flex items-center gap-2 mb-8">
          <Link href="/account" className="text-text-secondary hover:text-gold transition-colors">
            Contul Meu
          </Link>
          <ChevronRight className="h-4 w-4 text-text-secondary" />
          <span className="text-text">Comenzile Mele</span>
        </div>

        <div className="max-w-md mx-auto text-center py-16">
          <Package className="h-24 w-24 text-sand mx-auto mb-6" />
          <h1 className="font-display text-display-md text-text mb-4">
            Nu ai comenzi încă
          </h1>
          <p className="text-text-secondary mb-8">
            Explorează produsele noastre și plasează prima ta comandă!
          </p>
          <Link href="/shop">
            <Button size="lg">Vezi Colecția</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8">
        <Link href="/account" className="text-text-secondary hover:text-gold transition-colors">
          Contul Meu
        </Link>
        <ChevronRight className="h-4 w-4 text-text-secondary" />
        <span className="text-text">Comenzile Mele</span>
      </div>

      <h1 className="font-display text-display-md text-text mb-8">COMENZILE MELE</h1>

      {/* Orders List */}
      <div className="space-y-6">
        {orders.map((order, index) => {
          const StatusIcon = getStatusIcon(order.status)

          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-soft overflow-hidden"
            >
              {/* Order Header */}
              <div className="p-6 border-b border-sand">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-display text-lg text-text">
                      Comandă #{order.order_number}
                    </p>
                    <p className="text-sm text-text-secondary">
                      Plasată pe {new Date(order.created_at).toLocaleDateString('ro-RO', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium',
                      getOrderStatusColor(order.status)
                    )}>
                      <StatusIcon className="h-4 w-4" />
                      {getOrderStatusText(order.status)}
                    </div>
                    <Link href={`/order-confirmation/${order.id}`}>
                      <Button variant="outline" size="sm">
                        Vezi Detalii
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="p-6">
                <div className="flex flex-wrap gap-4 mb-4">
                  {order.order_items?.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="relative w-16 h-20 rounded-lg overflow-hidden bg-cream-50"
                    >
                      <Image
                        src={item.product_image || '/images/placeholder.jpg'}
                        alt={item.product_name}
                        fill
                        className="object-cover"
                      />
                      {item.quantity > 1 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      )}
                    </div>
                  ))}
                  {order.order_items && order.order_items.length > 3 && (
                    <div className="w-16 h-20 rounded-lg bg-cream-50 flex items-center justify-center">
                      <span className="text-sm text-text-secondary font-medium">
                        +{order.order_items.length - 3}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-text-secondary">
                    {order.order_items?.length} {order.order_items?.length === 1 ? 'produs' : 'produse'}
                  </p>
                  <p className="font-display text-xl text-gold">
                    {formatPrice(order.total)}
                  </p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Package, ChevronRight, Clock, Truck, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatPrice, getOrderStatusColor, getOrderStatusText } from '@/lib/utils'
import { Order } from '@/types'
import { cn } from '@/lib/utils'

// Mock orders data
const mockOrders: Order[] = [
  {
    id: '1',
    order_number: 'NL-2026-0127',
    user_id: '1',
    email: 'maria@example.com',
    phone: '0722123456',
    shipping_name: 'Maria Popescu',
    shipping_address: 'Str. Exemplu nr. 10',
    shipping_city: 'Brașov',
    shipping_county: 'Brașov',
    shipping_postal_code: '500001',
    subtotal: 899,
    shipping_cost: 0,
    discount: 0,
    total: 899,
    payment_method: 'card',
    payment_status: 'paid',
    delivery_method: 'curier_rapid',
    status: 'shipped',
    stripe_payment_intent_id: null,
    notes: null,
    created_at: '2026-01-27T14:30:00Z',
    updated_at: '2026-01-28T10:00:00Z',
    order_items: [
      {
        id: '1',
        order_id: '1',
        product_id: '1',
        product_name: 'Nike Air Max 90',
        product_image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
        size: '42',
        color: 'Alb',
        price: 449,
        quantity: 1,
        subtotal: 449,
        created_at: '2026-01-27T14:30:00Z',
      },
      {
        id: '2',
        order_id: '1',
        product_id: '2',
        product_name: 'Adidas Ultraboost',
        product_image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
        size: '42',
        color: 'Negru',
        price: 450,
        quantity: 1,
        subtotal: 450,
        created_at: '2026-01-27T14:30:00Z',
      },
    ],
  },
  {
    id: '2',
    order_number: 'NL-2026-0098',
    user_id: '1',
    email: 'maria@example.com',
    phone: '0722123456',
    shipping_name: 'Maria Popescu',
    shipping_address: 'Str. Exemplu nr. 10',
    shipping_city: 'Brașov',
    shipping_county: 'Brașov',
    shipping_postal_code: '500001',
    subtotal: 299,
    shipping_cost: 15,
    discount: 0,
    total: 314,
    payment_method: 'ramburs',
    payment_status: 'paid',
    delivery_method: 'curier_rapid',
    status: 'delivered',
    stripe_payment_intent_id: null,
    notes: null,
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-17T14:00:00Z',
    order_items: [
      {
        id: '3',
        order_id: '2',
        product_id: '3',
        product_name: 'Zara Blazer Premium',
        product_image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800',
        size: 'M',
        color: 'Bej',
        price: 299,
        quantity: 1,
        subtotal: 299,
        created_at: '2026-01-15T10:00:00Z',
      },
    ],
  },
]

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
  const orders = mockOrders

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
                    <Link href={`/account/orders/${order.id}`}>
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
                        src={item.product_image}
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

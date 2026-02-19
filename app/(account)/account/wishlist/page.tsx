'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Heart, ArrowLeft, Trash2, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatPrice, calculateDiscount } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useWishlist } from '@/hooks/useWishlist'
import { useCart } from '@/hooks/useCart'
import { Product } from '@/types'
import { Badge } from '@/components/ui/Badge'
import toast from 'react-hot-toast'

export default function WishlistPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const { items, removeItem } = useWishlist()
  const { addItem: addToCart } = useCart()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/account/wishlist')
    }
  }, [isAuthenticated, authLoading, router])

  const handleAddToCart = (product: Product) => {
    addToCart(product, product.sizes?.[0] || null, product.colors?.[0]?.name || null)
    toast.success('Produs adăugat în coș!')
  }

  const handleRemoveFromWishlist = (productId: string) => {
    removeItem(productId)
    toast.success('Eliminat din favorite!')
  }

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-cream-100 rounded w-32" />
          <div className="h-12 bg-cream-100 rounded w-64" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden">
                <div className="aspect-[3/4] bg-cream-100" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-cream-100 rounded w-1/3" />
                  <div className="h-5 bg-cream-100 rounded w-2/3" />
                  <div className="h-6 bg-cream-100 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      {/* Back Link */}
      <Link
        href="/account"
        className="inline-flex items-center text-text-secondary hover:text-gold transition-colors mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Înapoi la cont
      </Link>

      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-display-md text-text">FAVORITE</h1>
        <span className="text-text-secondary">
          {items.length} {items.length === 1 ? 'produs' : 'produse'}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-soft p-8 text-center">
          <Heart className="h-16 w-16 text-sand mx-auto mb-4" />
          <h2 className="font-display text-xl text-text mb-2">
            Nu ai produse favorite
          </h2>
          <p className="text-text-secondary mb-6">
            Explorează colecția noastră și salvează produsele care îți plac.
          </p>
          <Link href="/shop">
            <Button>
              <ShoppingBag className="mr-2 h-4 w-4" />
              Vezi Colecția
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((product, index) => {
            const discount = product.old_price
              ? calculateDiscount(product.price, product.old_price)
              : 0

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-soft overflow-hidden group"
              >
                {/* Product Image */}
                <Link href={`/product/${product.slug}`}>
                  <div className="relative aspect-[3/4] overflow-hidden bg-cream-50">
                    <Image
                      src={product.images[0] || '/images/placeholder.jpg'}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {product.is_new && <Badge variant="new">NOU</Badge>}
                      {discount > 0 && <Badge variant="sale">-{discount}%</Badge>}
                      {product.stock <= 3 && product.stock > 0 && (
                        <Badge variant="stock">Ultimele {product.stock}</Badge>
                      )}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        handleRemoveFromWishlist(product.id)
                      }}
                      className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm text-red-500 hover:bg-red-50 transition-colors"
                      aria-label="Elimină din favorite"
                    >
                      <Heart className="h-4 w-4 fill-red-500" />
                    </button>
                  </div>
                </Link>

                {/* Product Info */}
                <div className="p-4">
                  {/* Brand */}
                  {product.brand && (
                    <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">
                      {product.brand}
                    </p>
                  )}

                  {/* Name */}
                  <Link href={`/product/${product.slug}`}>
                    <h3 className="font-medium text-text text-sm mb-2 line-clamp-2 hover:text-gold transition-colors">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="font-display text-xl text-gold">
                      {formatPrice(product.price)}
                    </span>
                    {product.old_price && (
                      <span className="text-sm text-text-secondary line-through">
                        {formatPrice(product.old_price)}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1"
                      size="sm"
                    >
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Adaugă în Coș
                    </Button>
                    <button
                      onClick={() => handleRemoveFromWishlist(product.id)}
                      className="p-2 border border-sand rounded-lg text-text-secondary hover:text-red-500 hover:border-red-500 transition-colors"
                      aria-label="Elimină din favorite"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

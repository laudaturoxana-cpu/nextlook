'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react'
import { Product } from '@/types'
import { formatPrice, calculateDiscount } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { useCart } from '@/hooks/useCart'
import { useWishlist } from '@/hooks/useWishlist'
import toast from 'react-hot-toast'

interface ProductCardProps {
  product: Product
  index?: number
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { addItem } = useCart()
  const { toggleItem, isInWishlist } = useWishlist()
  const isWishlisted = isInWishlist(product.id)

  const discount = product.old_price
    ? calculateDiscount(product.price, product.old_price)
    : 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product, product.sizes?.[0] || null, product.colors?.[0]?.name || null)
  }

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleItem(product)
    toast.success(isWishlisted ? 'Eliminat din favorite!' : 'Adăugat la favorite!')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link href={`/product/${product.slug}`}>
        <div
          className="product-card group relative bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-soft-lg transition-all duration-300"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Image Container */}
          <div className="relative aspect-[3/4] overflow-hidden bg-cream-50">
            <Image
              src={product.images[0] || '/images/placeholder.jpg'}
              alt={product.name}
              fill
              className="product-card-image object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {product.is_new && (
                <Badge variant="new" pulse>NOU</Badge>
              )}
              {product.is_bestseller && (
                <Badge variant="gold">BESTSELLER</Badge>
              )}
              {discount > 0 && (
                <Badge variant="sale">-{discount}%</Badge>
              )}
              {product.stock <= 3 && product.stock > 0 && (
                <Badge variant="stock">Ultimele {product.stock}</Badge>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              onClick={handleToggleWishlist}
              className={`absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-sm transition-all hover:bg-white ${
                isWishlisted ? 'opacity-100 text-red-500' : 'opacity-0 group-hover:opacity-100 hover:text-gold'
              }`}
              aria-label={isWishlisted ? 'Elimină de la favorite' : 'Adaugă la favorite'}
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500' : ''}`} />
            </button>

            {/* Hover Actions */}
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-2">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gold text-white text-sm font-bold uppercase tracking-wider rounded-full hover:bg-gold-dark transition-colors"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Adaugă în Coș
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  className="p-3 bg-white text-text rounded-full hover:bg-cream-50 transition-colors"
                  aria-label="Vizualizare rapidă"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-4">
            {/* Brand */}
            {product.brand && (
              <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">
                {product.brand}
              </p>
            )}

            {/* Name */}
            <h3 className="font-body font-medium text-text text-sm mb-2 line-clamp-2 group-hover:text-gold transition-colors">
              {product.name}
            </h3>

            {/* Rating */}
            {product.reviews_count > 0 && (
              <div className="flex items-center gap-1 mb-2">
                <div className="flex items-center" role="img" aria-label={`Rating: ${product.rating} din 5 stele`}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < Math.floor(product.rating)
                          ? 'text-gold fill-gold'
                          : 'text-sand'
                      }`}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <span className="text-xs text-text-secondary">
                  ({product.reviews_count})
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="font-display text-xl text-gold">
                {formatPrice(product.price)}
              </span>
              {product.old_price && (
                <span className="text-sm text-text-secondary line-through">
                  {formatPrice(product.old_price)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Heart,
  Star,
  Minus,
  Plus,
  Truck,
  RefreshCw,
  Shield,
  ChevronRight,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import ProductCard from '@/components/ProductCard'
import { useCart } from '@/hooks/useCart'
import { useWishlist } from '@/hooks/useWishlist'
import { formatPrice, calculateDiscount } from '@/lib/utils'
import { Product } from '@/types'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface Review {
  id: string
  user_name: string
  rating: number
  comment: string
  is_approved: boolean
  created_at: string
}

const tabs = [
  { id: 'description', label: 'Descriere' },
  { id: 'sizes', label: 'Ghid Mărimi' },
  { id: 'shipping', label: 'Livrare & Retur' },
  { id: 'reviews', label: 'Recenzii' },
]

export default function ProductPage() {
  const params = useParams()
  const { addItem } = useCart()
  const { toggleItem, isInWishlist } = useWishlist()

  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [similarProducts, setSimilarProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.slug}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch product')
        }

        setProduct(data.product)
        setReviews(data.reviews || [])
        setSimilarProducts(data.similarProducts || [])

        // Set default color if available
        if (data.product.colors && data.product.colors.length > 0) {
          setSelectedColor(data.product.colors[0].name)
        }
      } catch (err) {
        console.error('Error fetching product:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch product')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.slug) {
      fetchProduct()
    }
  }, [params.slug])

  const discount = product?.old_price
    ? calculateDiscount(product.price, product.old_price)
    : 0

  const handleAddToCart = () => {
    if (!product) return
    if (!selectedSize) {
      toast.error('Te rugăm să selectezi o mărime')
      return
    }
    addItem(product, selectedSize, selectedColor, quantity)
    toast.success('Produs adăugat în coș!')
  }

  const handleBuyNow = () => {
    if (!product) return
    if (!selectedSize) {
      toast.error('Te rugăm să selectezi o mărime')
      return
    }
    addItem(product, selectedSize, selectedColor, quantity)
    window.location.href = '/checkout'
  }

  const formatReviewDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-4 bg-cream-100 rounded w-64 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-4">
                <div className="aspect-square bg-cream-100 rounded-2xl" />
                <div className="flex gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-20 h-20 bg-cream-100 rounded-xl" />
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-4 bg-cream-100 rounded w-24" />
                <div className="h-8 bg-cream-100 rounded w-3/4" />
                <div className="h-6 bg-cream-100 rounded w-32" />
                <div className="h-12 bg-cream-100 rounded w-48" />
                <div className="flex gap-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-10 h-10 bg-cream-100 rounded-full" />
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="w-12 h-12 bg-cream-100 rounded-xl" />
                  ))}
                </div>
                <div className="h-12 bg-cream-100 rounded-xl" />
                <div className="h-12 bg-cream-100 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-display-md text-text mb-4">
            Produsul nu a fost găsit
          </h1>
          <p className="text-text-secondary mb-8">
            {error || 'Ne pare rău, acest produs nu există.'}
          </p>
          <Link href="/shop">
            <Button>Vezi toate produsele</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 lg:px-8 py-4">
        <nav className="flex items-center gap-2 text-sm text-text-secondary">
          <Link href="/" className="hover:text-gold transition-colors">Acasă</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/shop" className="hover:text-gold transition-colors">Produse</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href={`/shop?category=${product.category}`} className="hover:text-gold transition-colors capitalize">
            {product.category}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-text truncate max-w-[200px]">{product.name}</span>
        </nav>
      </div>

      {/* Product Section */}
      <section className="container mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative aspect-square rounded-2xl overflow-hidden bg-white"
            >
              <Image
                src={product.images[selectedImage] || '/images/placeholder.jpg'}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.is_new && <Badge variant="new">NOU</Badge>}
                {discount > 0 && <Badge variant="sale">-{discount}%</Badge>}
                {product.stock <= 3 && product.stock > 0 && (
                  <Badge variant="stock">Ultimele {product.stock}</Badge>
                )}
              </div>

              {/* Wishlist */}
              <button
                onClick={() => {
                  toggleItem(product)
                  toast.success(isInWishlist(product.id) ? 'Eliminat din favorite!' : 'Adăugat la favorite!')
                }}
                className={cn(
                  "absolute top-4 right-4 p-3 bg-white rounded-full shadow-soft transition-colors",
                  isInWishlist(product.id) ? "text-red-500 hover:bg-red-50" : "hover:bg-cream-50 hover:text-gold"
                )}
              >
                <Heart className={cn("h-5 w-5", isInWishlist(product.id) && "fill-red-500")} />
              </button>
            </motion.div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      'relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-colors',
                      selectedImage === index ? 'border-gold' : 'border-transparent hover:border-sand'
                    )}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Brand */}
            {product.brand && (
              <p className="text-sm text-text-secondary uppercase tracking-wider">
                {product.brand}
              </p>
            )}

            {/* Name */}
            <h1 className="font-display text-display-sm text-text">
              {product.name}
            </h1>

            {/* Rating */}
            {product.reviews_count > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-4 w-4',
                        i < Math.floor(product.rating || 0)
                          ? 'text-gold fill-gold'
                          : 'text-sand'
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-text">({product.rating})</span>
                <span className="text-sm text-text-secondary">
                  · {product.reviews_count} recenzii
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="font-display text-4xl text-gold">
                {formatPrice(product.price)}
              </span>
              {product.old_price && (
                <span className="text-xl text-text-secondary line-through">
                  {formatPrice(product.old_price)}
                </span>
              )}
              {discount > 0 && (
                <Badge variant="sale">Economisești {formatPrice(product.old_price! - product.price)}</Badge>
              )}
            </div>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <p className="text-sm font-medium text-text mb-3">
                  Culoare: <span className="text-text-secondary">{selectedColor}</span>
                </p>
                <div className="flex gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={cn(
                        'w-10 h-10 rounded-full border-2 transition-all',
                        selectedColor === color.name
                          ? 'border-gold ring-2 ring-gold ring-offset-2'
                          : 'border-sand hover:border-gold'
                      )}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-text">
                    Mărime: <span className="text-text-secondary">{selectedSize || 'Selectează'}</span>
                  </p>
                  <button className="text-sm text-gold hover:underline">
                    Ghid mărimi
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        'min-w-[48px] h-12 px-4 rounded-xl border-2 font-medium transition-all',
                        selectedSize === size
                          ? 'border-gold bg-gold text-white'
                          : 'border-sand text-text hover:border-gold'
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="text-sm font-medium text-text mb-3">Cantitate</p>
              <div className="inline-flex items-center border border-sand rounded-xl">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-cream-50 rounded-l-xl transition-colors"
                >
                  <Minus className="h-5 w-5" />
                </button>
                <span className="w-16 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-3 hover:bg-cream-50 rounded-r-xl transition-colors"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <Button onClick={handleAddToCart} className="w-full" size="lg">
                Adaugă în Coș
              </Button>
              <Button onClick={handleBuyNow} variant="secondary" className="w-full" size="lg">
                Cumpără Acum
              </Button>
              <button
                onClick={() => {
                  if (product) {
                    toggleItem(product)
                    toast.success(isInWishlist(product.id) ? 'Eliminat din favorite!' : 'Adăugat la favorite!')
                  }
                }}
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-3 transition-colors",
                  product && isInWishlist(product.id) ? "text-red-500 hover:text-red-600" : "text-text-secondary hover:text-gold"
                )}
              >
                <Heart className={cn("h-5 w-5", product && isInWishlist(product.id) && "fill-red-500")} />
                {product && isInWishlist(product.id) ? 'Salvat la Favorite' : 'Salvează la Favorite'}
              </button>
            </div>

            {/* Trust Signals */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-sand">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-gold" />
                <div>
                  <p className="text-sm font-medium text-text">Livrare gratuită</p>
                  <p className="text-xs text-text-secondary">Peste 200 lei</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RefreshCw className="h-5 w-5 text-gold" />
                <div>
                  <p className="text-sm font-medium text-text">Retur gratuit</p>
                  <p className="text-xs text-text-secondary">30 zile</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-gold" />
                <div>
                  <p className="text-sm font-medium text-text">100% Original</p>
                  <p className="text-xs text-text-secondary">Cu etichetă</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="container mx-auto px-4 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-sand overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors',
                  activeTab === tab.id
                    ? 'text-gold border-b-2 border-gold'
                    : 'text-text-secondary hover:text-text'
                )}
              >
                {tab.label}
                {tab.id === 'reviews' && ` (${reviews.length})`}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6 lg:p-8">
            {activeTab === 'description' && (
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-line text-text-secondary leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {activeTab === 'sizes' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-sand">
                      <th className="py-3 px-4 text-left font-medium">EU</th>
                      <th className="py-3 px-4 text-left font-medium">UK</th>
                      <th className="py-3 px-4 text-left font-medium">US</th>
                      <th className="py-3 px-4 text-left font-medium">CM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { eu: '36', uk: '3.5', us: '5', cm: '22.5' },
                      { eu: '37', uk: '4', us: '5.5', cm: '23' },
                      { eu: '38', uk: '5', us: '6.5', cm: '24' },
                      { eu: '39', uk: '5.5', us: '7', cm: '24.5' },
                      { eu: '40', uk: '6', us: '7.5', cm: '25' },
                      { eu: '41', uk: '7', us: '8.5', cm: '26' },
                      { eu: '42', uk: '7.5', us: '9', cm: '26.5' },
                      { eu: '43', uk: '8.5', us: '10', cm: '27.5' },
                      { eu: '44', uk: '9', us: '10.5', cm: '28' },
                    ].map((row) => (
                      <tr key={row.eu} className="border-b border-sand last:border-0">
                        <td className="py-3 px-4">{row.eu}</td>
                        <td className="py-3 px-4">{row.uk}</td>
                        <td className="py-3 px-4">{row.us}</td>
                        <td className="py-3 px-4">{row.cm}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-text mb-2">Livrare</h3>
                  <ul className="space-y-2 text-text-secondary">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-gold flex-shrink-0" />
                      Livrare în 24-48h prin curier rapid
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-gold flex-shrink-0" />
                      Livrare gratuită pentru comenzi peste 200 lei
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-gold flex-shrink-0" />
                      Ridicare personală din București - GRATUIT
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-text mb-2">Retur</h3>
                  <ul className="space-y-2 text-text-secondary">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-gold flex-shrink-0" />
                      Retur gratuit în 30 de zile
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-gold flex-shrink-0" />
                      Fără întrebări, fără costuri
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-gold flex-shrink-0" />
                      Banii înapoi în maxim 5 zile lucrătoare
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {/* Rating Summary */}
                <div className="flex items-center gap-6 pb-6 border-b border-sand">
                  <div className="text-center">
                    <p className="font-display text-5xl text-gold">{product.rating || 0}</p>
                    <div className="flex items-center justify-center gap-1 my-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'h-4 w-4',
                            i < Math.floor(product.rating || 0) ? 'text-gold fill-gold' : 'text-sand'
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-text-secondary">{reviews.length} recenzii</p>
                  </div>
                </div>

                {/* Reviews List */}
                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="pb-6 border-b border-sand last:border-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  'h-4 w-4',
                                  i < review.rating ? 'text-gold fill-gold' : 'text-sand'
                                )}
                              />
                            ))}
                          </div>
                          <Badge variant="default" className="text-xs">Cumpărare verificată</Badge>
                        </div>
                        <p className="text-text mb-2">{review.comment}</p>
                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                          <span className="font-medium">{review.user_name}</span>
                          <span>·</span>
                          <span>{formatReviewDate(review.created_at)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-secondary text-center py-8">
                    Nu există recenzii pentru acest produs încă.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <section className="container mx-auto px-4 lg:px-8 py-12">
          <h2 className="section-title mb-8">PRODUSE SIMILARE</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarProducts.map((similarProduct, index) => (
              <ProductCard key={similarProduct.id} product={similarProduct} index={index} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

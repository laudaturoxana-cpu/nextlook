'use client'

import { useState } from 'react'
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
import { formatPrice, calculateDiscount } from '@/lib/utils'
import { Product } from '@/types'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

// Mock product data
const mockProduct: Product = {
  id: '1',
  name: 'Nike Air Max 90 Essential White/Black',
  slug: 'nike-air-max-90-essential-white-black',
  description: `Clasicii sneakers Nike Air Max 90 sunt reinventați cu materiale premium și detalii actualizate. Amortizarea Air Max vizibilă în călcâi oferă confort excepțional, în timp ce designul iconic își păstrează stilul atemporal.

Caracteristici:
• Upper din piele și materiale sintetice pentru durabilitate
• Unitate Air Max vizibilă în călcâi pentru amortizare
• Talpă intermediară din spumă pentru confort
• Talpă exterioară din cauciuc waffle pentru tracțiune
• Design clasic din 1990, actualizat

Fit: Se potrivește conform mărimii standard. Recomandăm să comanzi mărimea obișnuită.`,
  price: 449,
  old_price: 599,
  category: 'sneakers',
  subcategory: 'running',
  brand: 'Nike',
  sizes: ['38', '39', '40', '41', '42', '43', '44'],
  colors: [
    { name: 'Alb/Negru', hex: '#FFFFFF' },
    { name: 'Negru', hex: '#000000' },
    { name: 'Gri', hex: '#808080' },
  ],
  images: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
    'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800',
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800',
  ],
  stock: 5,
  is_featured: true,
  is_bestseller: true,
  is_new: false,
  rating: 4.8,
  reviews_count: 124,
  styling_suggestions: ['2', '5'],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const mockReviews = [
  {
    id: '1',
    user_name: 'Maria T.',
    rating: 5,
    comment: 'Super calitate! Exact cum arătau în poze. Livrare rapidă și ambalaj impecabil.',
    verified: true,
    date: '15 ianuarie 2026',
  },
  {
    id: '2',
    user_name: 'Andrei M.',
    rating: 5,
    comment: 'Cei mai comozi sneakers pe care i-am avut. Recomand!',
    verified: true,
    date: '12 ianuarie 2026',
  },
  {
    id: '3',
    user_name: 'Elena P.',
    rating: 4,
    comment: 'Foarte frumoși, mărimea e corectă. Singura problemă - au venit într-o cutie ușor deteriorată.',
    verified: true,
    date: '8 ianuarie 2026',
  },
]

const mockSimilarProducts: Product[] = [
  {
    id: '2',
    name: 'Adidas Ultraboost 22 Running Shoes',
    slug: 'adidas-ultraboost-22-running',
    description: 'Confort maxim pentru alergare',
    price: 599,
    old_price: null,
    category: 'sneakers',
    subcategory: 'running',
    brand: 'Adidas',
    sizes: ['39', '40', '41', '42', '43'],
    colors: [{ name: 'Negru', hex: '#000000' }],
    images: ['https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800'],
    stock: 8,
    is_featured: true,
    is_bestseller: true,
    is_new: true,
    rating: 4.9,
    reviews_count: 89,
    styling_suggestions: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'Nike Air Force 1 Low White',
    slug: 'nike-air-force-1-low-white',
    description: 'Clasicul sneaker alb',
    price: 499,
    old_price: null,
    category: 'sneakers',
    subcategory: 'lifestyle',
    brand: 'Nike',
    sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44'],
    colors: [{ name: 'Alb', hex: '#FFFFFF' }],
    images: ['https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800'],
    stock: 18,
    is_featured: true,
    is_bestseller: true,
    is_new: false,
    rating: 4.9,
    reviews_count: 234,
    styling_suggestions: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '8',
    name: 'New Balance 574 Classic',
    slug: 'new-balance-574-classic',
    description: 'Sneakers retro pentru confort zilnic',
    price: 429,
    old_price: null,
    category: 'sneakers',
    subcategory: 'lifestyle',
    brand: 'New Balance',
    sizes: ['38', '39', '40', '41', '42', '43'],
    colors: [{ name: 'Gri', hex: '#808080' }],
    images: ['https://images.unsplash.com/photo-1539185441755-769473a23570?w=800'],
    stock: 10,
    is_featured: true,
    is_bestseller: true,
    is_new: false,
    rating: 4.7,
    reviews_count: 92,
    styling_suggestions: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Puma RS-X Bold Sneakers',
    slug: 'puma-rs-x-bold-sneakers',
    description: 'Sneakers retro cu design îndrăzneț',
    price: 379,
    old_price: 499,
    category: 'sneakers',
    subcategory: 'lifestyle',
    brand: 'Puma',
    sizes: ['38', '39', '40', '41', '42'],
    colors: [{ name: 'Multicolor', hex: '#FF6B6B' }],
    images: ['https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800'],
    stock: 3,
    is_featured: true,
    is_bestseller: true,
    is_new: false,
    rating: 4.7,
    reviews_count: 67,
    styling_suggestions: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const tabs = [
  { id: 'description', label: 'Descriere' },
  { id: 'sizes', label: 'Ghid Mărimi' },
  { id: 'shipping', label: 'Livrare & Retur' },
  { id: 'reviews', label: 'Recenzii' },
]

export default function ProductPage() {
  const params = useParams()
  const { addItem } = useCart()

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState(mockProduct.colors[0]?.name || null)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')

  const product = mockProduct // În producție, fetch din Supabase bazat pe params.slug

  const discount = product.old_price
    ? calculateDiscount(product.price, product.old_price)
    : 0

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Te rugăm să selectezi o mărime')
      return
    }
    addItem(product, selectedSize, selectedColor, quantity)
    toast.success('Produs adăugat în coș!')
  }

  const handleBuyNow = () => {
    if (!selectedSize) {
      toast.error('Te rugăm să selectezi o mărime')
      return
    }
    addItem(product, selectedSize, selectedColor, quantity)
    window.location.href = '/checkout'
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
                src={product.images[selectedImage]}
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
              <button className="absolute top-4 right-4 p-3 bg-white rounded-full shadow-soft hover:bg-cream-50 transition-colors">
                <Heart className="h-5 w-5" />
              </button>
            </motion.div>

            {/* Thumbnails */}
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
                        i < Math.floor(product.rating)
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
            {product.colors.length > 0 && (
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
              <button className="w-full flex items-center justify-center gap-2 py-3 text-text-secondary hover:text-gold transition-colors">
                <Heart className="h-5 w-5" />
                Salvează la Favorite
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
                {tab.id === 'reviews' && ` (${product.reviews_count})`}
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
                    <p className="font-display text-5xl text-gold">{product.rating}</p>
                    <div className="flex items-center justify-center gap-1 my-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'h-4 w-4',
                            i < Math.floor(product.rating) ? 'text-gold fill-gold' : 'text-sand'
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-text-secondary">{product.reviews_count} recenzii</p>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-6">
                  {mockReviews.map((review) => (
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
                        {review.verified && (
                          <Badge variant="default" className="text-xs">Cumpărare verificată</Badge>
                        )}
                      </div>
                      <p className="text-text mb-2">{review.comment}</p>
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <span className="font-medium">{review.user_name}</span>
                        <span>·</span>
                        <span>{review.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Similar Products */}
      <section className="container mx-auto px-4 lg:px-8 py-12">
        <h2 className="section-title mb-8">PRODUSE SIMILARE</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockSimilarProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </section>
    </div>
  )
}

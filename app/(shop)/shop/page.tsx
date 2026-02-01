'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, Grid3X3, LayoutGrid, X } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import ProductFilters from '@/components/ProductFilters'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Product } from '@/types'
import { cn } from '@/lib/utils'

// Mock products - în producție, se face fetch din Supabase
const allProducts: Product[] = [
  {
    id: '1',
    name: 'Nike Air Max 90 Essential White/Black',
    slug: 'nike-air-max-90-essential-white-black',
    description: 'Sneakers clasici cu design iconic',
    price: 449,
    old_price: 599,
    category: 'sneakers',
    subcategory: 'running',
    brand: 'Nike',
    sizes: ['40', '41', '42', '43', '44'],
    colors: [{ name: 'Alb', hex: '#FFFFFF' }],
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'],
    stock: 12,
    is_featured: true,
    is_bestseller: true,
    is_new: false,
    rating: 4.8,
    reviews_count: 124,
    styling_suggestions: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
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
    id: '3',
    name: 'Zara Oversized Blazer Premium',
    slug: 'zara-oversized-blazer-premium',
    description: 'Blazer oversized pentru un look modern',
    price: 299,
    old_price: 399,
    category: 'femei',
    subcategory: 'jachete',
    brand: 'Zara',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Bej', hex: '#D4C4B0' }],
    images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800'],
    stock: 5,
    is_featured: true,
    is_bestseller: false,
    is_new: true,
    rating: 4.6,
    reviews_count: 45,
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
  {
    id: '5',
    name: 'H&M Essential Cotton T-Shirt Pack',
    slug: 'hm-essential-cotton-tshirt-pack',
    description: 'Set de tricouri basic din bumbac organic',
    price: 149,
    old_price: null,
    category: 'barbati',
    subcategory: 'tricouri',
    brand: 'H&M',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Alb', hex: '#FFFFFF' }, { name: 'Negru', hex: '#000000' }],
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'],
    stock: 25,
    is_featured: true,
    is_bestseller: true,
    is_new: false,
    rating: 4.5,
    reviews_count: 156,
    styling_suggestions: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'Nike Air Force 1 Low White',
    slug: 'nike-air-force-1-low-white',
    description: 'Clasicul sneaker alb pentru orice outfit',
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
    id: '7',
    name: 'Mango Wool Blend Coat',
    slug: 'mango-wool-blend-coat',
    description: 'Palton elegant din amestec de lână',
    price: 549,
    old_price: 699,
    category: 'femei',
    subcategory: 'paltoane',
    brand: 'Mango',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [{ name: 'Camel', hex: '#C19A6B' }],
    images: ['https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800'],
    stock: 6,
    is_featured: true,
    is_bestseller: false,
    is_new: true,
    rating: 4.8,
    reviews_count: 38,
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
    id: '9',
    name: 'Zara Slim Fit Chino Pants',
    slug: 'zara-slim-fit-chino-pants',
    description: 'Pantaloni chino slim fit pentru bărbați',
    price: 199,
    old_price: null,
    category: 'barbati',
    subcategory: 'pantaloni',
    brand: 'Zara',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Navy', hex: '#000080' }],
    images: ['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800'],
    stock: 15,
    is_featured: false,
    is_bestseller: false,
    is_new: true,
    rating: 4.4,
    reviews_count: 28,
    styling_suggestions: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '10',
    name: 'H&M Floral Summer Dress',
    slug: 'hm-floral-summer-dress',
    description: 'Rochie de vară cu print floral',
    price: 179,
    old_price: 249,
    category: 'femei',
    subcategory: 'rochii',
    brand: 'H&M',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [{ name: 'Floral', hex: '#FFB6C1' }],
    images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800'],
    stock: 8,
    is_featured: false,
    is_bestseller: true,
    is_new: false,
    rating: 4.6,
    reviews_count: 67,
    styling_suggestions: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '11',
    name: 'Adidas Stan Smith Original',
    slug: 'adidas-stan-smith-original',
    description: 'Clasicul sneaker alb-verde',
    price: 399,
    old_price: null,
    category: 'sneakers',
    subcategory: 'lifestyle',
    brand: 'Adidas',
    sizes: ['36', '37', '38', '39', '40', '41', '42', '43'],
    colors: [{ name: 'Alb/Verde', hex: '#FFFFFF' }],
    images: ['https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800'],
    stock: 20,
    is_featured: true,
    is_bestseller: true,
    is_new: false,
    rating: 4.8,
    reviews_count: 189,
    styling_suggestions: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '12',
    name: 'Mango Leather Belt',
    slug: 'mango-leather-belt',
    description: 'Curea din piele naturală',
    price: 149,
    old_price: null,
    category: 'barbati',
    subcategory: 'accesorii',
    brand: 'Mango',
    sizes: ['S', 'M', 'L'],
    colors: [{ name: 'Maro', hex: '#8B4513' }],
    images: ['https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800'],
    stock: 30,
    is_featured: false,
    is_bestseller: false,
    is_new: true,
    rating: 4.5,
    reviews_count: 22,
    styling_suggestions: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const sortOptions = [
  { value: 'relevance', label: 'Relevante' },
  { value: 'price_asc', label: 'Preț crescător' },
  { value: 'price_desc', label: 'Preț descrescător' },
  { value: 'newest', label: 'Cele mai noi' },
  { value: 'bestseller', label: 'Cele mai vândute' },
]

function ShopContent() {
  const searchParams = useSearchParams()
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)
  const [gridCols, setGridCols] = useState(3)

  const category = searchParams.get('category')
  const sort = searchParams.get('sort') || 'relevance'
  const brands = searchParams.get('brands')?.split(',') || []
  const sizes = searchParams.get('sizes')?.split(',') || []
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')

  // Filter and sort products
  let filteredProducts = [...allProducts]

  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category === category)
  }

  if (brands.length > 0) {
    filteredProducts = filteredProducts.filter(p => p.brand && brands.includes(p.brand))
  }

  if (sizes.length > 0) {
    filteredProducts = filteredProducts.filter(p =>
      p.sizes.some(s => sizes.includes(s))
    )
  }

  if (minPrice) {
    filteredProducts = filteredProducts.filter(p => p.price >= Number(minPrice))
  }

  if (maxPrice) {
    filteredProducts = filteredProducts.filter(p => p.price <= Number(maxPrice))
  }

  // Sort
  switch (sort) {
    case 'price_asc':
      filteredProducts.sort((a, b) => a.price - b.price)
      break
    case 'price_desc':
      filteredProducts.sort((a, b) => b.price - a.price)
      break
    case 'newest':
      filteredProducts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      break
    case 'bestseller':
      filteredProducts.sort((a, b) => (b.is_bestseller ? 1 : 0) - (a.is_bestseller ? 1 : 0))
      break
  }

  const categoryTitles: Record<string, string> = {
    femei: 'Colecția Femei',
    barbati: 'Colecția Bărbați',
    sneakers: 'Sneakers',
    noutati: 'Noutăți',
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="container mx-auto px-4 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-display text-display-md text-text mb-2">
            {category ? categoryTitles[category] || 'Produse' : 'Toate Produsele'}
          </h1>
          <p className="text-text-secondary">
            {filteredProducts.length} produse găsite
          </p>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-28">
              <ProductFilters />
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 bg-white rounded-xl p-4 shadow-soft">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setIsMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 text-text hover:text-gold transition-colors"
              >
                <SlidersHorizontal className="h-5 w-5" />
                <span className="font-medium">Filtre</span>
              </button>

              {/* Sort */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-text-secondary hidden sm:block">Sortează după:</span>
                <select
                  value={sort}
                  onChange={(e) => {
                    const params = new URLSearchParams(searchParams.toString())
                    params.set('sort', e.target.value)
                    window.location.href = `/shop?${params.toString()}`
                  }}
                  className="px-3 py-2 border border-sand rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Grid Toggle */}
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => setGridCols(3)}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    gridCols === 3 ? 'bg-gold text-white' : 'text-text-secondary hover:bg-cream-50'
                  )}
                >
                  <Grid3X3 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setGridCols(4)}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    gridCols === 4 ? 'bg-gold text-white' : 'text-text-secondary hover:bg-cream-50'
                  )}
                >
                  <LayoutGrid className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Products */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-text-secondary mb-4">Nu am găsit produse care să corespundă filtrelor selectate.</p>
                <Button variant="outline" onClick={() => window.location.href = '/shop'}>
                  Resetează filtrele
                </Button>
              </div>
            ) : (
              <div className={cn(
                'grid gap-6',
                gridCols === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
              )}>
                {filteredProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFiltersOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-full max-w-sm bg-white z-50 lg:hidden overflow-y-auto"
            >
              <ProductFilters
                isMobile
                onMobileClose={() => setIsMobileFiltersOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  )
}

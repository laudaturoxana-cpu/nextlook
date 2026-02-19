'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, Grid3X3, LayoutGrid, X } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import ProductFilters from '@/components/ProductFilters'
import { Button } from '@/components/ui/Button'
import { Product } from '@/types'
import { cn } from '@/lib/utils'

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
  const [products, setProducts] = useState<Product[]>([])
  const [totalProducts, setTotalProducts] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const category = searchParams.get('category')
  const sort = searchParams.get('sort') || 'relevance'
  const brands = searchParams.get('brands') || ''
  const sizes = searchParams.get('sizes') || ''
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()

        if (category) params.set('category', category)
        if (sort) params.set('sort', sort)
        if (brands) params.set('brands', brands)
        if (sizes) params.set('sizes', sizes)
        if (minPrice) params.set('minPrice', minPrice)
        if (maxPrice) params.set('maxPrice', maxPrice)

        const response = await fetch(`/api/products?${params.toString()}`)
        const data = await response.json()

        if (data.products) {
          setProducts(data.products)
          setTotalProducts(data.total || data.products.length)
        }
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [category, sort, brands, sizes, minPrice, maxPrice])

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
            {isLoading ? 'Se încarcă...' : `${totalProducts} produse găsite`}
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
            {isLoading ? (
              <div className={cn(
                'grid gap-6',
                gridCols === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
              )}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                    <div className="aspect-[3/4] bg-cream-100" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-cream-100 rounded w-1/3" />
                      <div className="h-5 bg-cream-100 rounded w-2/3" />
                      <div className="h-6 bg-cream-100 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
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
                {products.map((product, index) => (
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

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronDown, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const categories = [
  { value: '', label: 'Toate' },
  { value: 'adidasi-barbati', label: 'Adidași Bărbați' },
  { value: 'adidasi-femei', label: 'Adidași Femei' },
  { value: 'pantofi-femei', label: 'Pantofi Femei' },
  { value: 'copii', label: 'Copii' },
  { value: 'ghete-copii', label: '↳ Ghete Copii' },
  { value: 'botine-copii', label: '↳ Botine Copii' },
  { value: 'adidasi-copii', label: '↳ Adidași Copii' },
  { value: 'accesorii', label: 'Accesorii' },
]

// Fallback brands if API fails
const fallbackBrands = ['Nike', 'Adidas', 'Puma', 'Zara', 'H&M', 'Mango', 'New Balance']

const sizes = {
  clothing: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  shoes: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'],
}

interface ProductFiltersProps {
  onMobileClose?: () => void
  isMobile?: boolean
}

export default function ProductFilters({ onMobileClose, isMobile }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [expandedSections, setExpandedSections] = useState<string[]>(['category', 'price'])
  const [brands, setBrands] = useState<string[]>(fallbackBrands)
  const [isLoadingBrands, setIsLoadingBrands] = useState(true)

  const currentCategory = searchParams.get('category') || ''
  const currentBrands = searchParams.get('brands')?.split(',') || []
  const currentSizes = searchParams.get('sizes')?.split(',') || []
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''

  // Fetch brands from API
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('/api/products/brands')
        const data = await response.json()
        if (data.brands && data.brands.length > 0) {
          setBrands(data.brands)
        }
      } catch (error) {
        console.error('Error fetching brands:', error)
        // Keep fallback brands
      } finally {
        setIsLoadingBrands(false)
      }
    }

    fetchBrands()
  }, [])

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const updateFilters = (key: string, value: string | string[]) => {
    const params = new URLSearchParams(searchParams.toString())

    if (Array.isArray(value)) {
      if (value.length > 0) {
        params.set(key, value.join(','))
      } else {
        params.delete(key)
      }
    } else if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    router.push(`/shop?${params.toString()}`)
  }

  const toggleArrayFilter = (key: string, value: string, currentValues: string[]) => {
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value]
    updateFilters(key, newValues)
  }

  const resetFilters = () => {
    router.push('/shop')
    if (onMobileClose) onMobileClose()
  }

  const hasActiveFilters = currentCategory || currentBrands.length > 0 || currentSizes.length > 0 || minPrice || maxPrice

  return (
    <div className={cn('bg-white rounded-2xl', isMobile ? 'p-0' : 'p-6 shadow-soft')}>
      {/* Mobile Header */}
      {isMobile && (
        <div className="flex items-center justify-between p-4 border-b border-sand">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5" />
            <span className="font-medium">Filtre</span>
          </div>
          <button onClick={onMobileClose} className="p-2">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className={isMobile ? 'p-4 space-y-6' : 'space-y-6'}>
        {/* Category Filter */}
        <div>
          <button
            onClick={() => toggleSection('category')}
            className="flex items-center justify-between w-full py-2 font-medium text-text"
          >
            Categorie
            <ChevronDown className={cn('h-4 w-4 transition-transform', expandedSections.includes('category') && 'rotate-180')} />
          </button>
          <AnimatePresence>
            {expandedSections.includes('category') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-2 space-y-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => updateFilters('category', cat.value)}
                      className={cn(
                        'block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                        currentCategory === cat.value
                          ? 'bg-gold text-white'
                          : 'text-text-secondary hover:bg-cream-50'
                      )}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Price Range */}
        <div>
          <button
            onClick={() => toggleSection('price')}
            className="flex items-center justify-between w-full py-2 font-medium text-text"
          >
            Preț
            <ChevronDown className={cn('h-4 w-4 transition-transform', expandedSections.includes('price') && 'rotate-180')} />
          </button>
          <AnimatePresence>
            {expandedSections.includes('price') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-2 flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => updateFilters('minPrice', e.target.value)}
                    className="w-1/2 px-3 py-2 border border-sand rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => updateFilters('maxPrice', e.target.value)}
                    className="w-1/2 px-3 py-2 border border-sand rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Brands */}
        <div>
          <button
            onClick={() => toggleSection('brands')}
            className="flex items-center justify-between w-full py-2 font-medium text-text"
          >
            Brand
            <ChevronDown className={cn('h-4 w-4 transition-transform', expandedSections.includes('brands') && 'rotate-180')} />
          </button>
          <AnimatePresence>
            {expandedSections.includes('brands') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-2 space-y-2">
                  {isLoadingBrands ? (
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-6 bg-cream-100 rounded animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    brands.map((brand) => (
                      <label key={brand} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentBrands.includes(brand)}
                          onChange={() => toggleArrayFilter('brands', brand, currentBrands)}
                          className="w-4 h-4 rounded border-sand text-gold focus:ring-gold"
                        />
                        <span className="text-sm text-text-secondary">{brand}</span>
                      </label>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sizes */}
        <div>
          <button
            onClick={() => toggleSection('sizes')}
            className="flex items-center justify-between w-full py-2 font-medium text-text"
          >
            Mărime
            <ChevronDown className={cn('h-4 w-4 transition-transform', expandedSections.includes('sizes') && 'rotate-180')} />
          </button>
          <AnimatePresence>
            {expandedSections.includes('sizes') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-2">
                  <p className="text-xs text-text-secondary mb-2">Haine</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {sizes.clothing.map((size) => (
                      <button
                        key={size}
                        onClick={() => toggleArrayFilter('sizes', size, currentSizes)}
                        className={cn(
                          'px-3 py-1 text-sm rounded-lg border transition-colors',
                          currentSizes.includes(size)
                            ? 'border-gold bg-gold text-white'
                            : 'border-sand text-text-secondary hover:border-gold'
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-text-secondary mb-2">Încălțăminte</p>
                  <div className="flex flex-wrap gap-2">
                    {sizes.shoes.map((size) => (
                      <button
                        key={size}
                        onClick={() => toggleArrayFilter('sizes', size, currentSizes)}
                        className={cn(
                          'px-3 py-1 text-sm rounded-lg border transition-colors',
                          currentSizes.includes(size)
                            ? 'border-gold bg-gold text-white'
                            : 'border-sand text-text-secondary hover:border-gold'
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="w-full py-2 text-sm text-gold hover:underline"
          >
            Resetează filtrele
          </button>
        )}
      </div>

      {/* Mobile Apply Button */}
      {isMobile && (
        <div className="p-4 border-t border-sand">
          <Button onClick={onMobileClose} className="w-full">
            Aplică Filtrele
          </Button>
        </div>
      )}
    </div>
  )
}

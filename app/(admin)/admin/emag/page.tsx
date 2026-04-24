'use client'

import { useEffect, useState } from 'react'
import { RefreshCw, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import { EMAG_FASHION_CATEGORIES } from '@/lib/emag-categories'

interface Product {
  id: string
  name: string
  brand: string | null
  price: number
  stock_quantity: number
  images: string[]
  sku: string | null
  emag_seller_id: number | null
  emag_category_id: number | null
  emag_sync_status: string | null
  emag_synced_at: string | null
}

const statusConfig = {
  synced: { label: 'Sincronizat', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  error: { label: 'Eroare', color: 'bg-red-100 text-red-700', icon: XCircle },
  pending: { label: 'În procesare', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
}

export default function EmagSyncPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [syncing, setSyncing] = useState<string | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<Record<string, number>>({})

  useEffect(() => {
    fetch('/api/admin/products')
      .then(r => r.json())
      .then(d => {
        setProducts(d.products || [])
        // Pre-fill saved categories
        const cats: Record<string, number> = {}
        for (const p of (d.products || [])) {
          if (p.emag_category_id) cats[p.id] = p.emag_category_id
        }
        setSelectedCategories(cats)
      })
      .catch(() => toast.error('Eroare la încărcarea produselor'))
      .finally(() => setIsLoading(false))
  }, [])

  const syncProduct = async (product: Product) => {
    const categoryId = selectedCategories[product.id]
    if (!categoryId) {
      toast.error('Selectează categoria eMAG pentru acest produs')
      return
    }

    setSyncing(product.id)
    try {
      const res = await fetch('/api/admin/emag/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, emagCategoryId: categoryId }),
      })
      const data = await res.json()

      if (data.success) {
        toast.success(`"${product.name}" trimis la eMAG! ID: ${data.emagSellerId}`)
        setProducts(prev => prev.map(p =>
          p.id === product.id
            ? { ...p, emag_sync_status: 'synced', emag_seller_id: data.emagSellerId, emag_category_id: categoryId }
            : p
        ))
      } else {
        const msg = data.emagResponse?.messages?.[0] || data.error || 'Eroare necunoscută'
        toast.error(`Eroare eMAG: ${msg}`)
        setProducts(prev => prev.map(p =>
          p.id === product.id ? { ...p, emag_sync_status: 'error' } : p
        ))
      }
    } catch (e: any) {
      toast.error(e.message || 'Eroare la sincronizare')
    } finally {
      setSyncing(null)
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">eMAG Sync</h1>
        <p className="text-sm text-gray-500 mt-1">
          Selectează categoria eMAG pentru fiecare produs și apasă Sync
        </p>
      </div>

      <div className="space-y-3">
        {products.map(product => {
          const status = product.emag_sync_status as keyof typeof statusConfig | null
          const StatusIcon = status ? statusConfig[status]?.icon : null

          return (
            <div key={product.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex flex-wrap items-center gap-4">
                {/* Imagine */}
                {product.images?.[0] && (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                  />
                )}

                {/* Detalii produs */}
                <div className="flex-1 min-w-[160px]">
                  <p className="font-semibold text-gray-900 text-sm">{product.name}</p>
                  <p className="text-xs text-gray-500">
                    {product.brand || 'Fără brand'} · {product.price} lei · Stoc: {product.stock_quantity}
                  </p>
                </div>

                {/* Status */}
                {status && statusConfig[status] && (
                  <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[status].color}`}>
                    {StatusIcon && <StatusIcon className="h-3 w-3" />}
                    {statusConfig[status].label}
                    {product.emag_seller_id && <span className="ml-1 font-mono">#{product.emag_seller_id}</span>}
                  </span>
                )}

                {/* Selector categorie eMAG */}
                <select
                  value={selectedCategories[product.id] || ''}
                  onChange={e => setSelectedCategories(prev => ({
                    ...prev,
                    [product.id]: Number(e.target.value),
                  }))}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 min-w-[200px]"
                >
                  <option value="">— Selectează categoria eMAG —</option>
                  {EMAG_FASHION_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>

                {/* Buton sync */}
                <button
                  onClick={() => syncProduct(product)}
                  disabled={syncing === product.id || !selectedCategories[product.id]}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`h-4 w-4 ${syncing === product.id ? 'animate-spin' : ''}`} />
                  {syncing === product.id ? 'Se trimite...' : status === 'synced' ? 'Re-sync' : 'Sync eMAG'}
                </button>

                {/* Link eMAG dacă e sincronizat */}
                {status === 'synced' && product.emag_seller_id && (
                  <a
                    href={`https://marketplace.emag.ro/vendor/products`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Marketplace
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

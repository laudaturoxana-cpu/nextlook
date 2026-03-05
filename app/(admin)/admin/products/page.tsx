'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Pencil, Trash2, Star, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
  brand: string | null
  price: number
  original_price: number | null
  stock_quantity: number
  is_featured: boolean
  is_new: boolean
  is_on_sale: boolean
  images: string[]
  categories: { name: string; slug: string } | null
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products')
      const data = await res.json()
      setProducts(data.products || [])
    } catch {
      toast.error('Nu am putut încărca produsele')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProducts() }, [])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Ștergi produsul "${name}"? Acțiunea nu poate fi anulată.`)) return

    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Produs șters')
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch {
      toast.error('Eroare la ștergere')
    }
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produse</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {loading ? '...' : `${products.length} produse în total`}
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Adaugă produs
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>Nu există produse. Adaugă primul produs.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Produs</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Categorie</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Preț</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Stoc</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Etichete</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  {/* Produs */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Package className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-1">{product.name}</p>
                        {product.brand && (
                          <p className="text-xs text-gray-400">{product.brand}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Categorie */}
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-gray-600">
                      {product.categories?.name || '—'}
                    </span>
                  </td>

                  {/* Preț */}
                  <td className="px-4 py-3">
                    <div>
                      <span className="font-medium text-gray-900">{product.price} lei</span>
                      {product.original_price && (
                        <span className="text-xs text-gray-400 line-through ml-1">
                          {product.original_price} lei
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Stoc */}
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`font-medium ${
                      product.stock_quantity > 5
                        ? 'text-green-600'
                        : product.stock_quantity > 0
                        ? 'text-orange-500'
                        : 'text-red-500'
                    }`}>
                      {product.stock_quantity}
                    </span>
                  </td>

                  {/* Etichete */}
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex gap-1">
                      {product.is_featured && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs bg-yellow-100 text-yellow-700">
                          <Star className="h-3 w-3" /> Promovat
                        </span>
                      )}
                      {product.is_new && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-700">
                          <Sparkles className="h-3 w-3" /> Nou
                        </span>
                      )}
                      {product.is_on_sale && (
                        <span className="px-1.5 py-0.5 rounded text-xs bg-red-100 text-red-700">
                          Reducere
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Acțiuni */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                        title="Editează"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Șterge"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function Package({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  )
}

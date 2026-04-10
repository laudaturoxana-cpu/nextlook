'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { X, Plus, Upload, Loader2, GripVertical, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

interface Category {
  id: string
  name: string
  slug: string
}

interface ColorEntry {
  name: string
  hex: string
}

interface ProductFormData {
  id?: string
  name: string
  slug: string
  description: string
  brand: string
  category_id: string
  price: string
  original_price: string
  stock_quantity: string
  sizes: string[]
  size_stocks?: Record<string, number>
  colors: ColorEntry[]
  images: string[]
  is_featured: boolean
  is_new: boolean
  is_on_sale: boolean
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default function ProductForm({ initialData }: { initialData?: Partial<ProductFormData> & { id?: string } }) {
  const router = useRouter()
  const isEdit = !!initialData?.id

  const [form, setForm] = useState<ProductFormData>({
    name: '',
    slug: '',
    description: '',
    brand: '',
    category_id: '',
    price: '',
    original_price: '',
    stock_quantity: '0',
    sizes: [],
    colors: [],
    images: [],
    is_featured: false,
    is_new: false,
    is_on_sale: false,
    ...initialData,
  })

  const [categories, setCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [sizeInput, setSizeInput] = useState('')
  const [dragging, setDragging] = useState(false)
  const [sizeStocks, setSizeStocks] = useState<Record<string, number>>(
    initialData?.size_stocks || {}
  )
  const fileInputRef = useRef<HTMLInputElement>(null)
  const slugManuallyEdited = useRef(isEdit)

  // Fetch categories
  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(d => setCategories(d.categories || []))
      .catch(() => {})
  }, [])

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setForm(prev => ({
      ...prev,
      name: value,
      slug: slugManuallyEdited.current ? prev.slug : slugify(value),
    }))
  }

  // Upload images
  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    setUploading(true)

    const uploaded: string[] = []
    for (const file of fileArray) {
      if (!file.type.startsWith('image/')) continue
      const fd = new FormData()
      fd.append('file', file)

      try {
        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (data.url) uploaded.push(data.url)
        else toast.error(`Eroare la ${file.name}`)
      } catch {
        toast.error(`Eroare la ${file.name}`)
      }
    }

    setForm(prev => ({ ...prev, images: [...prev.images, ...uploaded] }))
    setUploading(false)
    if (uploaded.length > 0) toast.success(`${uploaded.length} ${uploaded.length === 1 ? 'imagine încărcată' : 'imagini încărcate'}`)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files.length > 0) uploadFiles(e.dataTransfer.files)
  }, [uploadFiles])

  const removeImage = (idx: number) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))
  }

  // Sizes
  const addSize = () => {
    const val = sizeInput.trim()
    if (!val) return
    if (!form.sizes.includes(val)) {
      setForm(prev => ({ ...prev, sizes: [...prev.sizes, val] }))
      setSizeStocks(prev => ({ ...prev, [val]: prev[val] ?? 1 }))
    }
    setSizeInput('')
  }

  const removeSize = (size: string) => {
    setForm(prev => ({ ...prev, sizes: prev.sizes.filter(s => s !== size) }))
    setSizeStocks(prev => {
      const copy = { ...prev }
      delete copy[size]
      return copy
    })
  }

  const updateSizeStock = (size: string, qty: number) => {
    setSizeStocks(prev => ({ ...prev, [size]: Math.max(0, qty) }))
  }

  const totalStock = Object.values(sizeStocks).reduce((sum, q) => sum + q, 0)

  // Colors
  const addColor = () => {
    setForm(prev => ({ ...prev, colors: [...prev.colors, { name: '', hex: '#000000' }] }))
  }

  const updateColor = (idx: number, field: 'name' | 'hex', value: string) => {
    setForm(prev => ({
      ...prev,
      colors: prev.colors.map((c, i) => i === idx ? { ...c, [field]: value } : c),
    }))
  }

  const removeColor = (idx: number) => {
    setForm(prev => ({ ...prev, colors: prev.colors.filter((_, i) => i !== idx) }))
  }

  // Save
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Numele este obligatoriu')
    if (!form.price) return toast.error('Prețul este obligatoriu')

    setSaving(true)
    try {
      const payload = {
        ...form,
        size_stocks: sizeStocks,
        stock_quantity: form.sizes.length > 0 ? totalStock : parseInt(form.stock_quantity) || 0,
        // Save colors as "Nume|#hex" strings in the TEXT[] array
        colors: form.colors
          .filter(c => c.name.trim())
          .map(c => `${c.name.trim()}|${c.hex}`),
      }

      const url = isEdit ? `/api/admin/products/${initialData!.id}` : '/api/admin/products'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Eroare la salvare')

      toast.success(isEdit ? 'Produs actualizat!' : 'Produs creat!')
      router.push('/admin/products')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Eroare la salvare')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Editează produs' : 'Produs nou'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isEdit ? 'Modifică informațiile produsului' : 'Adaugă un produs nou în magazin'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Basic info */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Informații de bază</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nume produs <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => handleNameChange(e.target.value)}
                placeholder="ex: Adidas Ultraboost 24"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                required
              />
            </div>

            {/* Slug */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
              <input
                type="text"
                value={form.slug}
                onChange={e => {
                  slugManuallyEdited.current = true
                  setForm(prev => ({ ...prev, slug: e.target.value }))
                }}
                placeholder="adidas-ultraboost-24"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1">Se generează automat din nume. Nu folosi spații sau caractere speciale.</p>
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <input
                type="text"
                value={form.brand}
                onChange={e => setForm(prev => ({ ...prev, brand: e.target.value }))}
                placeholder="ex: Adidas, Nike, Puma"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categorie</label>
              <select
                value={form.category_id}
                onChange={e => setForm(prev => ({ ...prev, category_id: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
              >
                <option value="">— Selectează categorie —</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preț (lei) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.price}
                onChange={e => setForm(prev => ({ ...prev, price: e.target.value }))}
                placeholder="199"
                min="0"
                step="0.01"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                required
              />
            </div>

            {/* Original price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preț original (lei)</label>
              <input
                type="number"
                value={form.original_price}
                onChange={e => setForm(prev => ({ ...prev, original_price: e.target.value }))}
                placeholder="299 (opțional, dacă e la reducere)"
                min="0"
                step="0.01"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            {/* Stock — auto-calculated from sizes. Show manual input only if no sizes */}
            {form.sizes.length === 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stoc (bucăți)</label>
                <input
                  type="number"
                  value={form.stock_quantity}
                  onChange={e => setForm(prev => ({ ...prev, stock_quantity: e.target.value }))}
                  placeholder="10"
                  min="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">Se calculează automat dacă adaugi mărimi mai jos.</p>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descriere</label>
            <textarea
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrie produsul. Poți folosi • la începutul unui rând pentru puncte."
              rows={6}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-y"
            />
            <p className="text-xs text-gray-400 mt-1">Sfat: Pune • la începutul unui rând pentru a face o listă cu caracteristici.</p>
          </div>
        </section>

        {/* Images */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Imagini produs</h2>

          {/* Upload zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragging ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-400'
            }`}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2 text-gray-500">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-sm">Se încarcă imaginile...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <Upload className="h-8 w-8" />
                <p className="text-sm font-medium text-gray-600">Trage pozele aici sau apasă pentru a selecta</p>
                <p className="text-xs">JPG, PNG, WEBP — mai multe fișiere simultan</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={e => e.target.files && uploadFiles(e.target.files)}
            />
          </div>

          {/* Image previews */}
          {form.images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {form.images.map((url, idx) => (
                <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={url}
                    alt={`Imagine ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="100px"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1 rounded">
                      Principală
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Sizes */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Mărimi & Stoc</h2>
              <p className="text-xs text-gray-400 mt-0.5">Adaugă fiecare mărime și câte bucăți ai în stoc</p>
            </div>
            {form.sizes.length > 0 && (
              <span className="text-sm text-gray-500">
                Total: <span className="font-semibold text-gray-900">{totalStock} buc.</span>
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={sizeInput}
              onChange={e => setSizeInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSize() } }}
              placeholder="ex: 38, 39, M, XL..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
            <button
              type="button"
              onClick={addSize}
              className="px-4 py-2.5 bg-gray-900 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Adaugă
            </button>
          </div>

          {form.sizes.length > 0 ? (
            <div className="space-y-2">
              {form.sizes.map(size => {
                const qty = sizeStocks[size] ?? 0
                return (
                  <div key={size} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <span className="w-14 text-center text-sm font-bold text-gray-800 bg-white border border-gray-200 rounded-lg px-2 py-1.5">
                      {size}
                    </span>
                    <div className="flex items-center gap-2 flex-1">
                      <button
                        type="button"
                        onClick={() => updateSizeStock(size, qty - 1)}
                        className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors text-lg leading-none"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={qty}
                        onChange={e => updateSizeStock(size, parseInt(e.target.value) || 0)}
                        className="w-16 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-center font-semibold focus:outline-none focus:ring-2 focus:ring-gray-900"
                      />
                      <button
                        type="button"
                        onClick={() => updateSizeStock(size, qty + 1)}
                        className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors text-lg leading-none"
                      >
                        +
                      </button>
                      <span className="text-xs text-gray-400">buc.</span>
                    </div>
                    {qty === 0 ? (
                      <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-1 rounded-lg">Epuizat</span>
                    ) : qty <= 2 ? (
                      <span className="text-xs font-semibold text-orange-500 bg-orange-50 px-2 py-1 rounded-lg">Ultimele {qty}</span>
                    ) : (
                      <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-lg">În stoc</span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeSize(size)}
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Șterge mărimea"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-2">Nicio mărime adăugată</p>
          )}
        </section>

        {/* Colors */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Culori disponibile</h2>
            <button
              type="button"
              onClick={addColor}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              <Plus className="h-4 w-4" />
              Adaugă culoare
            </button>
          </div>

          {form.colors.length === 0 && (
            <p className="text-sm text-gray-400">Nicio culoare adăugată</p>
          )}

          <div className="space-y-2">
            {form.colors.map((color, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <input
                  type="color"
                  value={color.hex}
                  onChange={e => updateColor(idx, 'hex', e.target.value)}
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                  title="Alege culoarea"
                />
                <input
                  type="text"
                  value={color.name}
                  onChange={e => updateColor(idx, 'name', e.target.value)}
                  placeholder="Nume culoare (ex: Albastru navy)"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => removeColor(idx)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Toggles */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Etichete & Vizibilitate</h2>
          <div className="space-y-3">
            {[
              { key: 'is_featured', label: 'Produs promovat', desc: 'Apare în secțiunile principale ale site-ului' },
              { key: 'is_new', label: 'Produs nou', desc: 'Afișează eticheta "NOU" pe produs' },
              { key: 'is_on_sale', label: 'La reducere', desc: 'Afișează eticheta "REDUCERE"' },
            ].map(({ key, label, desc }) => (
              <label key={key} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-gray-900">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
                <div
                  onClick={() => setForm(prev => ({ ...prev, [key]: !prev[key as keyof ProductFormData] }))}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    form[key as keyof ProductFormData] ? 'bg-gray-900' : 'bg-gray-200'
                  }`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    form[key as keyof ProductFormData] ? 'translate-x-5.5' : 'translate-x-0.5'
                  }`} />
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* Submit */}
        <div className="flex items-center justify-between pb-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Anulează
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? 'Salvează modificările' : 'Creează produsul'}
          </button>
        </div>
      </form>
    </div>
  )
}

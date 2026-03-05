'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Check, X, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  parent_id: string | null
  parent: { id: string; name: string } | null
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

const emptyForm = { name: '', slug: '', description: '', parent_id: '' }

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Inline form state
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  const fetch_ = async () => {
    try {
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      setCategories(data.categories || [])
    } catch {
      toast.error('Nu am putut încărca categoriile')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch_() }, [])

  const openNew = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEdit = (cat: Category) => {
    setEditingId(cat.id)
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      parent_id: cat.parent_id || '',
    })
    setShowForm(true)
  }

  const cancelForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  const handleNameChange = (value: string) => {
    setForm(prev => ({
      ...prev,
      name: value,
      slug: editingId ? prev.slug : slugify(value),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Numele este obligatoriu')
    setSaving(true)

    try {
      const url = editingId
        ? `/api/admin/categories/${editingId}`
        : '/api/admin/categories'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug || slugify(form.name),
          description: form.description || null,
          parent_id: form.parent_id || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Eroare')

      toast.success(editingId ? 'Categorie actualizată!' : 'Categorie creată!')
      cancelForm()
      fetch_()
    } catch (err: any) {
      toast.error(err.message || 'Eroare la salvare')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Ștergi categoria "${name}"?`)) return

    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Categorie ștearsă')
      setCategories(prev => prev.filter(c => c.id !== id))
    } catch (err: any) {
      toast.error(err.message || 'Eroare la ștergere')
    }
  }

  // Group: top-level first, then children
  const topLevel = categories.filter(c => !c.parent_id)
  const children = categories.filter(c => c.parent_id)

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorii</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {loading ? '...' : `${categories.length} categorii`}
          </p>
        </div>
        {!showForm && (
          <button
            onClick={openNew}
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Adaugă categorie
          </button>
        )}
      </div>

      {/* Inline form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4"
        >
          <h2 className="font-semibold text-gray-900">
            {editingId ? 'Editează categorie' : 'Categorie nouă'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nume <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => handleNameChange(e.target.value)}
                placeholder="ex: Adidași femei"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                autoFocus
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
              <input
                type="text"
                value={form.slug}
                onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="adidasi-femei"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categorie părinte (opțional)</label>
              <select
                value={form.parent_id}
                onChange={e => setForm(prev => ({ ...prev, parent_id: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="">— Fără părinte (categorie principală) —</option>
                {categories
                  .filter(c => c.id !== editingId && !c.parent_id)
                  .map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descriere (opțional)</label>
              <input
                type="text"
                value={form.description}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Scurtă descriere a categoriei"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {editingId ? 'Salvează' : 'Creează'}
            </button>
            <button
              type="button"
              onClick={cancelForm}
              className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <X className="h-4 w-4" />
              Anulează
            </button>
          </div>
        </form>
      )}

      {/* Categories table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p>Nu există categorii. Adaugă prima categorie.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Nume</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Slug</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Părinte</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/* Top-level categories first */}
              {topLevel.map(cat => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{cat.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400 hidden sm:table-cell">{cat.slug}</td>
                  <td className="px-4 py-3 text-gray-400 hidden md:table-cell">—</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(cat)}
                        className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {/* Subcategories indented */}
              {children.map(cat => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors bg-gray-50/50">
                  <td className="px-4 py-3 text-gray-700">
                    <span className="text-gray-300 mr-2">↳</span>
                    {cat.name}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400 hidden sm:table-cell">{cat.slug}</td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{cat.parent?.name || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(cat)}
                        className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
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

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, MapPin, Edit2, Trash2, Check, Home, Building } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { romanianCounties, cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

interface Address {
  id: string
  label: string
  full_name: string
  phone: string
  street: string
  city: string
  county: string
  postal_code: string
  is_default: boolean
  type: 'home' | 'work'
}

export default function AddressesPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    label: '',
    fullName: '',
    phone: '',
    address: '',
    city: '',
    county: '',
    postalCode: '',
    type: 'home' as 'home' | 'work',
  })

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/account/addresses')
      return
    }

    const fetchAddresses = async () => {
      try {
        const response = await fetch('/api/addresses')
        const data = await response.json()
        if (data.addresses) {
          setAddresses(data.addresses)
        }
      } catch (error) {
        console.error('Error fetching addresses:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchAddresses()
    }
  }, [isAuthenticated, authLoading, router])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const method = editingId ? 'PUT' : 'POST'
      const body = editingId
        ? { id: editingId, ...formData }
        : formData

      const response = await fetch('/api/addresses', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error('Failed to save address')
      }

      const data = await response.json()

      if (editingId) {
        setAddresses(addresses.map(addr =>
          addr.id === editingId ? data.address : addr
        ))
        toast.success('Adresa a fost actualizată!')
      } else {
        setAddresses([...addresses, data.address])
        toast.success('Adresa a fost adăugată!')
      }
      resetForm()
    } catch (error) {
      toast.error('A apărut o eroare. Te rugăm să încerci din nou.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/addresses?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete address')
      }

      setAddresses(addresses.filter(addr => addr.id !== id))
      toast.success('Adresa a fost ștearsă!')
    } catch (error) {
      toast.error('A apărut o eroare. Te rugăm să încerci din nou.')
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      const address = addresses.find(a => a.id === id)
      if (!address) return

      const response = await fetch('/api/addresses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          fullName: address.full_name,
          phone: address.phone,
          address: address.street,
          city: address.city,
          county: address.county,
          postalCode: address.postal_code,
          label: address.label,
          type: address.type,
          is_default: true,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update address')
      }

      setAddresses(addresses.map(addr => ({
        ...addr,
        is_default: addr.id === id,
      })))
      toast.success('Adresa implicită a fost schimbată!')
    } catch (error) {
      toast.error('A apărut o eroare. Te rugăm să încerci din nou.')
    }
  }

  const handleEdit = (address: Address) => {
    setFormData({
      label: address.label || '',
      fullName: address.full_name,
      phone: address.phone,
      address: address.street,
      city: address.city,
      county: address.county,
      postalCode: address.postal_code || '',
      type: address.type || 'home',
    })
    setEditingId(address.id)
    setIsAdding(true)
  }

  const resetForm = () => {
    setFormData({
      label: '',
      fullName: '',
      phone: '',
      address: '',
      city: '',
      county: '',
      postalCode: '',
      type: 'home',
    })
    setIsAdding(false)
    setEditingId(null)
  }

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-cream-100 rounded w-32" />
          <div className="h-12 bg-cream-100 rounded w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 space-y-4">
                <div className="h-6 bg-cream-100 rounded w-1/3" />
                <div className="h-4 bg-cream-100 rounded w-2/3" />
                <div className="h-4 bg-cream-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      {/* Back Link */}
      <Link
        href="/account"
        className="inline-flex items-center text-text-secondary hover:text-gold transition-colors mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Înapoi la cont
      </Link>

      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-display-md text-text">ADRESELE MELE</h1>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adaugă adresă
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-soft p-6 mb-8"
        >
          <h2 className="font-display text-xl text-text mb-6">
            {editingId ? 'Editează Adresa' : 'Adaugă Adresă Nouă'}
          </h2>

          <div className="space-y-4">
            {/* Type Selection */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'home' })}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-colors',
                  formData.type === 'home'
                    ? 'border-gold bg-gold/5 text-gold'
                    : 'border-sand text-text-secondary hover:border-gold/50'
                )}
              >
                <Home className="h-5 w-5" />
                <span>Acasă</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'work' })}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-colors',
                  formData.type === 'work'
                    ? 'border-gold bg-gold/5 text-gold'
                    : 'border-sand text-text-secondary hover:border-gold/50'
                )}
              >
                <Building className="h-5 w-5" />
                <span>Birou</span>
              </button>
            </div>

            <Input
              label="Denumire adresă"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder="ex: Acasă, Birou, Casa părinților"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nume complet"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
              <Input
                label="Telefon"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <Input
              label="Adresă completă"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Strada, număr, bloc, scară, apartament"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Oraș"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
              <Select
                label="Județ"
                value={formData.county}
                onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                options={romanianCounties.map((c) => ({ value: c, label: c }))}
                placeholder="Selectează"
                required
              />
              <Input
                label="Cod poștal"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} isLoading={isSaving}>
                {editingId ? 'Salvează modificările' : 'Adaugă adresa'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Anulează
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Addresses List */}
      {addresses.length === 0 && !isAdding ? (
        <div className="bg-white rounded-2xl shadow-soft p-8 text-center">
          <MapPin className="h-16 w-16 text-sand mx-auto mb-4" />
          <h2 className="font-display text-xl text-text mb-2">
            Nu ai adrese salvate
          </h2>
          <p className="text-text-secondary mb-6">
            Adaugă o adresă pentru a finaliza comenzile mai rapid.
          </p>
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adaugă prima adresă
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <motion.div
              key={address.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={cn(
                'bg-white rounded-2xl shadow-soft p-6 relative',
                address.is_default && 'ring-2 ring-gold'
              )}
            >
              {address.is_default && (
                <span className="absolute top-4 right-4 px-2 py-1 bg-gold/10 text-gold text-xs font-medium rounded-full">
                  Implicită
                </span>
              )}

              <div className="flex items-start gap-3 mb-4">
                {address.type === 'work' ? (
                  <Building className="h-5 w-5 text-gold flex-shrink-0" />
                ) : (
                  <Home className="h-5 w-5 text-gold flex-shrink-0" />
                )}
                <div>
                  <h3 className="font-medium text-text">{address.label || (address.type === 'work' ? 'Birou' : 'Acasă')}</h3>
                  <p className="text-sm text-text-secondary">{address.full_name}</p>
                </div>
              </div>

              <div className="text-sm text-text-secondary space-y-1 mb-4">
                <p>{address.street}</p>
                <p>{address.city}, {address.county} {address.postal_code}</p>
                <p>Tel: {address.phone}</p>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-sand">
                <button
                  onClick={() => handleEdit(address)}
                  className="flex items-center gap-1 text-sm text-text-secondary hover:text-gold transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                  Editează
                </button>
                {!address.is_default && (
                  <>
                    <span className="text-sand">|</span>
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="flex items-center gap-1 text-sm text-text-secondary hover:text-gold transition-colors"
                    >
                      <Check className="h-4 w-4" />
                      Setează implicită
                    </button>
                  </>
                )}
                <span className="text-sand">|</span>
                <button
                  onClick={() => handleDelete(address.id)}
                  className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Șterge
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

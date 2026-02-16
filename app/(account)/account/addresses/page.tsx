'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, MapPin, Edit2, Trash2, Check, Home, Building } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { romanianCounties, cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Address {
  id: string
  label: string
  fullName: string
  phone: string
  address: string
  city: string
  county: string
  postalCode: string
  isDefault: boolean
  type: 'home' | 'work'
}

// Mock addresses - în producție vin din Supabase
const mockAddresses: Address[] = [
  {
    id: '1',
    label: 'Acasă',
    fullName: 'Maria Popescu',
    phone: '0722123456',
    address: 'Str. Exemplu nr. 10, bl. A1, sc. 2, ap. 15',
    city: 'București',
    county: 'București',
    postalCode: '010101',
    isDefault: true,
    type: 'home',
  },
]

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses)
  const [isAdding, setIsAdding] = useState(false)
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

  const handleSave = () => {
    if (editingId) {
      setAddresses(addresses.map(addr =>
        addr.id === editingId
          ? { ...addr, ...formData }
          : addr
      ))
      toast.success('Adresa a fost actualizată!')
    } else {
      const newAddress: Address = {
        id: Date.now().toString(),
        ...formData,
        isDefault: addresses.length === 0,
      }
      setAddresses([...addresses, newAddress])
      toast.success('Adresa a fost adăugată!')
    }
    resetForm()
  }

  const handleDelete = (id: string) => {
    setAddresses(addresses.filter(addr => addr.id !== id))
    toast.success('Adresa a fost ștearsă!')
  }

  const handleSetDefault = (id: string) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id,
    })))
    toast.success('Adresa implicită a fost schimbată!')
  }

  const handleEdit = (address: Address) => {
    setFormData({
      label: address.label,
      fullName: address.fullName,
      phone: address.phone,
      address: address.address,
      city: address.city,
      county: address.county,
      postalCode: address.postalCode,
      type: address.type,
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
              <Button onClick={handleSave}>
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
                address.isDefault && 'ring-2 ring-gold'
              )}
            >
              {address.isDefault && (
                <span className="absolute top-4 right-4 px-2 py-1 bg-gold/10 text-gold text-xs font-medium rounded-full">
                  Implicită
                </span>
              )}

              <div className="flex items-start gap-3 mb-4">
                {address.type === 'home' ? (
                  <Home className="h-5 w-5 text-gold flex-shrink-0" />
                ) : (
                  <Building className="h-5 w-5 text-gold flex-shrink-0" />
                )}
                <div>
                  <h3 className="font-medium text-text">{address.label || (address.type === 'home' ? 'Acasă' : 'Birou')}</h3>
                  <p className="text-sm text-text-secondary">{address.fullName}</p>
                </div>
              </div>

              <div className="text-sm text-text-secondary space-y-1 mb-4">
                <p>{address.address}</p>
                <p>{address.city}, {address.county} {address.postalCode}</p>
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
                {!address.isDefault && (
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

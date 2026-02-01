'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  User,
  Package,
  MapPin,
  Heart,
  Lock,
  LogOut,
  ChevronRight,
  Mail,
  Phone,
  Edit2,
  Save,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const sidebarItems = [
  { id: 'profile', label: 'Profilul Meu', icon: User },
  { id: 'orders', label: 'Comenzile Mele', icon: Package, href: '/account/orders' },
  { id: 'addresses', label: 'Adresele Mele', icon: MapPin, href: '/account/addresses' },
  { id: 'wishlist', label: 'Favorite', icon: Heart },
  { id: 'password', label: 'Schimbă Parola', icon: Lock },
]

// Mock user data
const mockUser = {
  id: '1',
  email: 'maria@example.com',
  full_name: 'Maria Popescu',
  phone: '0722123456',
  avatar_url: null,
}

export default function AccountPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: mockUser.full_name || '',
    email: mockUser.email,
    phone: mockUser.phone || '',
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleSaveProfile = async () => {
    // În producție, se face update în Supabase
    toast.success('Profilul a fost actualizat!')
    setIsEditing(false)
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Parolele nu coincid')
      return
    }
    // În producție, se face update prin Supabase Auth
    toast.success('Parola a fost schimbată!')
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
  }

  const handleLogout = async () => {
    // În producție, se face logout prin Supabase
    toast.success('Te-ai deconectat cu succes')
    router.push('/')
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <h1 className="font-display text-display-md text-text mb-8">CONTUL MEU</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-soft p-4">
            <nav className="space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => item.href ? router.push(item.href) : setActiveTab(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left',
                    activeTab === item.id
                      ? 'bg-gold text-white'
                      : 'text-text-secondary hover:bg-cream-50 hover:text-text'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.href && <ChevronRight className="h-4 w-4 ml-auto" />}
                </button>
              ))}

              <hr className="my-4 border-sand" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Deconectare</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-soft p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl text-text">Informații Personale</h2>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Editează
                  </Button>
                ) : (
                  <Button size="sm" onClick={handleSaveProfile}>
                    <Save className="h-4 w-4 mr-2" />
                    Salvează
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Input
                    label="Nume complet"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Input
                    label="Email"
                    type="email"
                    value={formData.email}
                    disabled
                    helperText="Emailul nu poate fi schimbat"
                  />
                </div>
                <div>
                  <Input
                    label="Telefon"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'wishlist' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-soft p-6 text-center"
            >
              <Heart className="h-16 w-16 text-sand mx-auto mb-4" />
              <h2 className="font-display text-xl text-text mb-2">
                Lista de Favorite este goală
              </h2>
              <p className="text-text-secondary mb-6">
                Adaugă produse la favorite pentru a le găsi mai ușor.
              </p>
              <Link href="/shop">
                <Button>Explorează Produsele</Button>
              </Link>
            </motion.div>
          )}

          {activeTab === 'password' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-soft p-6"
            >
              <h2 className="font-display text-xl text-text mb-6">Schimbă Parola</h2>

              <div className="space-y-4 max-w-md">
                <Input
                  label="Parola curentă"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                />
                <Input
                  label="Parola nouă"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                />
                <Input
                  label="Confirmă parola nouă"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                />
                <Button onClick={handleChangePassword}>
                  Actualizează Parola
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

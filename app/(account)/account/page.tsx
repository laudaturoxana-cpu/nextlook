'use client'

import { useState, useEffect } from 'react'
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
  Edit2,
  Save,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const sidebarItems = [
  { id: 'profile', label: 'Profilul Meu', icon: User },
  { id: 'orders', label: 'Comenzile Mele', icon: Package, href: '/account/orders' },
  { id: 'addresses', label: 'Adresele Mele', icon: MapPin, href: '/account/addresses' },
  { id: 'wishlist', label: 'Favorite', icon: Heart },
  { id: 'password', label: 'Schimbă Parola', icon: Lock },
]

export default function AccountPage() {
  const router = useRouter()
  const { user, loading, signOut, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  })
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login?redirect=/account')
    }
  }, [loading, isAuthenticated, router])

  // Populate form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.user_metadata?.full_name || '',
        email: user.email || '',
        phone: user.user_metadata?.phone || '',
      })
    }
  }, [user])

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      const supabase = createClient()

      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          phone: formData.phone,
        }
      })

      if (error) throw error

      toast.success('Profilul a fost actualizat!')
      setIsEditing(false)
    } catch (error) {
      toast.error('A apărut o eroare. Încearcă din nou.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Parolele nu coincid')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Parola trebuie să aibă minim 6 caractere')
      return
    }

    setIsChangingPassword(true)
    try {
      const supabase = createClient()

      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) throw error

      toast.success('Parola a fost schimbată!')
      setPasswordData({ newPassword: '', confirmPassword: '' })
    } catch (error) {
      toast.error('A apărut o eroare. Încearcă din nou.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleLogout = async () => {
    const { error } = await signOut()
    if (error) {
      toast.error('A apărut o eroare la deconectare')
    } else {
      toast.success('Te-ai deconectat cu succes')
      router.push('/')
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </div>
      </div>
    )
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <h1 className="font-display text-display-md text-text mb-8">CONTUL MEU</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-soft p-4">
            {/* User info */}
            <div className="px-4 py-3 mb-4 bg-cream-50 rounded-xl">
              <p className="font-medium text-text truncate">
                {user?.user_metadata?.full_name || 'Utilizator'}
              </p>
              <p className="text-sm text-text-secondary truncate">
                {user?.email}
              </p>
            </div>

            <nav className="space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => item.href ? router.push(item.href) : setActiveTab(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left',
                    activeTab === item.id && !item.href
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
                  <Button size="sm" onClick={handleSaveProfile} isLoading={isSaving}>
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
                    helperText="Emailul nu poate fi schimbat din această pagină"
                  />
                </div>
                <div>
                  <Input
                    label="Telefon"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                    placeholder="07xxxxxxxx"
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
                  label="Parola nouă"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  placeholder="Minim 6 caractere"
                />
                <Input
                  label="Confirmă parola nouă"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  placeholder="Repetă parola nouă"
                />
                <Button
                  onClick={handleChangePassword}
                  isLoading={isChangingPassword}
                  disabled={!passwordData.newPassword || !passwordData.confirmPassword}
                >
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

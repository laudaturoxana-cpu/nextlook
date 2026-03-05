'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Package, ShoppingBag, LogOut, LayoutDashboard } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const navItems = [
  { href: '/admin/products', label: 'Produse', icon: Package },
  { href: '/admin/orders', label: 'Comenzi', icon: ShoppingBag, disabled: true },
]

export default function AdminSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Te-ai delogat')
    router.push('/auth/login')
  }

  return (
    <aside className="w-60 bg-gray-900 text-white flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-800">
        <p className="font-bold text-lg tracking-widest text-white">NEXTLOOK</p>
        <p className="text-xs text-gray-400 mt-0.5">Admin Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon, disabled }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={disabled ? '#' : href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                disabled
                  ? 'text-gray-600 cursor-not-allowed'
                  : active
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
              onClick={disabled ? (e) => e.preventDefault() : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
              {disabled && (
                <span className="ml-auto text-xs text-gray-600">curând</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-gray-800">
        <p className="text-xs text-gray-500 px-3 mb-2 truncate">{userEmail}</p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-colors w-full"
        >
          <LogOut className="h-4 w-4" />
          Delogare
        </button>
      </div>
    </aside>
  )
}

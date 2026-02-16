'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Search, User, ShoppingBag, Menu, X, LogOut, Package, MapPin, Heart, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import CartDrawer from '@/components/CartDrawer'
import toast from 'react-hot-toast'

const navigation = [
  { name: 'Femei', href: '/shop?category=femei' },
  { name: 'Bărbați', href: '/shop?category=barbati' },
  { name: 'Sneakers', href: '/shop?category=sneakers' },
  { name: 'Noutăți', href: '/shop?category=noutati' },
  { name: 'Despre', href: '/despre' },
]

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { openCart, getItemCount } = useCart()
  const { user, loading, signOut, isAuthenticated } = useAuth()
  const itemCount = getItemCount()
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    setIsUserMenuOpen(false)
    const { error } = await signOut()
    if (error) {
      toast.error('A apărut o eroare la deconectare')
    } else {
      toast.success('Te-ai deconectat cu succes')
      router.push('/')
    }
  }

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-soft py-3'
            : 'bg-transparent py-5'
        )}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <nav className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="font-display text-3xl tracking-wider">
                <span className="text-text">NEXT</span>
                <span className="text-gold">LOOK</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'font-body text-sm font-medium uppercase tracking-wider transition-colors',
                    pathname.includes(item.href.split('?')[0])
                      ? 'text-gold'
                      : 'text-text hover:text-gold'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <button
                className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-text hover:text-gold transition-colors"
                aria-label="Caută"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={cn(
                    'p-3 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors',
                    isAuthenticated ? 'text-gold' : 'text-text hover:text-gold'
                  )}
                  aria-label="Cont"
                >
                  <User className="h-5 w-5" />
                </button>

                <div
                  className={cn(
                    'absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-soft-lg border border-sand overflow-hidden transition-all duration-200',
                    isUserMenuOpen
                      ? 'opacity-100 translate-y-0 pointer-events-auto'
                      : 'opacity-0 translate-y-2 pointer-events-none'
                  )}
                >
                  {isAuthenticated ? (
                    <>
                      {/* User Info */}
                      <div className="px-4 py-3 bg-cream-50 border-b border-sand">
                        <p className="text-sm font-medium text-text truncate">
                          {user?.user_metadata?.full_name || 'Contul meu'}
                        </p>
                        <p className="text-xs text-text-secondary truncate">
                          {user?.email}
                        </p>
                      </div>

                      <Link
                        href="/account"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-text hover:bg-cream-50 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4 text-gold" />
                        Profilul meu
                      </Link>
                      <Link
                        href="/account/orders"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-text hover:bg-cream-50 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Package className="h-4 w-4 text-gold" />
                        Comenzile mele
                      </Link>
                      <Link
                        href="/account/addresses"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-text hover:bg-cream-50 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <MapPin className="h-4 w-4 text-gold" />
                        Adresele mele
                      </Link>
                      <Link
                        href="/account"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-text hover:bg-cream-50 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Heart className="h-4 w-4 text-gold" />
                        Favorite
                      </Link>
                      <hr className="border-sand" />
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Deconectează-te
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Guest Menu */}
                      <div className="px-4 py-3 bg-cream-50 border-b border-sand">
                        <p className="text-sm font-medium text-text">
                          Bine ai venit!
                        </p>
                        <p className="text-xs text-text-secondary">
                          Conectează-te pentru a vedea comenzile tale
                        </p>
                      </div>

                      <Link
                        href="/auth/login"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gold font-medium hover:bg-cream-50 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        Conectează-te
                      </Link>
                      <Link
                        href="/auth/register"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-text hover:bg-cream-50 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <UserPlus className="h-4 w-4 text-gold" />
                        Creează cont
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Cart */}
              <button
                onClick={openCart}
                className="relative p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-text hover:text-gold transition-colors"
                aria-label="Coș de cumpărături"
              >
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-gold text-white text-xs font-bold rounded-full">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* CTA Button - Desktop */}
              <Link href="/shop" className="hidden lg:block btn-primary px-4 py-2 text-xs">
                Vezi Colecția
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-text"
                aria-label="Meniu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </nav>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            'lg:hidden bg-white border-t border-sand overflow-hidden transition-all duration-300',
            isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="container mx-auto px-4 py-6 space-y-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'block font-body text-lg font-medium py-2 transition-colors',
                  pathname.includes(item.href.split('?')[0])
                    ? 'text-gold'
                    : 'text-text'
                )}
              >
                {item.name}
              </Link>
            ))}
            <hr className="border-sand my-4" />

            {/* Mobile Auth Links */}
            {isAuthenticated ? (
              <>
                <Link href="/account" className="block font-body text-lg font-medium py-2 text-text">
                  Contul meu
                </Link>
                <Link href="/account/orders" className="block font-body text-lg font-medium py-2 text-text">
                  Comenzile mele
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block font-body text-lg font-medium py-2 text-red-500 w-full text-left"
                >
                  Deconectează-te
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="block font-body text-lg font-medium py-2 text-gold">
                  Conectează-te
                </Link>
                <Link href="/auth/register" className="block font-body text-lg font-medium py-2 text-text">
                  Creează cont
                </Link>
              </>
            )}

            <hr className="border-sand my-4" />
            <Link href="/shop" className="block btn-primary w-full">
              Vezi Colecția
            </Link>
          </div>
        </div>
      </header>

      {/* Cart Drawer */}
      <CartDrawer />
    </>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, User, ShoppingBag, Menu, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCart } from '@/hooks/useCart'
import { Button } from '@/components/ui/Button'
import CartDrawer from '@/components/CartDrawer'

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
  const { openCart, getItemCount } = useCart()
  const itemCount = getItemCount()

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
            <div className="flex items-center gap-4">
              {/* Search */}
              <button
                className="p-2 text-text hover:text-gold transition-colors"
                aria-label="Caută"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="p-2 text-text hover:text-gold transition-colors"
                  aria-label="Cont"
                >
                  <User className="h-5 w-5" />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-soft-lg border border-sand overflow-hidden"
                    >
                      <Link
                        href="/account"
                        className="block px-4 py-3 text-sm text-text hover:bg-cream-50 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Contul meu
                      </Link>
                      <Link
                        href="/account/orders"
                        className="block px-4 py-3 text-sm text-text hover:bg-cream-50 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Comenzile mele
                      </Link>
                      <hr className="border-sand" />
                      <Link
                        href="/auth/login"
                        className="block px-4 py-3 text-sm text-gold font-medium hover:bg-cream-50 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Conectează-te
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Cart */}
              <button
                onClick={openCart}
                className="relative p-2 text-text hover:text-gold transition-colors"
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
              <Link href="/shop" className="hidden lg:block">
                <Button size="sm">Vezi Colecția</Button>
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-text"
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
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-sand"
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
                <Link href="/shop" className="block">
                  <Button className="w-full">Vezi Colecția</Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Cart Drawer */}
      <CartDrawer />
    </>
  )
}

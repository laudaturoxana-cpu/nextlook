import Link from 'next/link'
import { Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react'

const footerLinks = {
  shop: [
    { name: 'Femei', href: '/shop?category=femei' },
    { name: 'Bărbați', href: '/shop?category=barbati' },
    { name: 'Sneakers', href: '/shop?category=sneakers' },
    { name: 'Noutăți', href: '/shop?category=noutati' },
    { name: 'Toate produsele', href: '/shop' },
  ],
  info: [
    { name: 'Despre noi', href: '/despre' },
    { name: 'Contact', href: '/contact' },
    { name: 'Cum comandăm', href: '/cum-comand' },
    { name: 'Livrare și plată', href: '/livrare-plata' },
    { name: 'Politica de retur', href: '/retur' },
  ],
  legal: [
    { name: 'Termeni și condiții', href: '/termeni' },
    { name: 'Politica de confidențialitate', href: '/confidentialitate' },
    { name: 'Politica cookies', href: '/cookies' },
    { name: 'ANPC', href: 'https://anpc.ro', external: true },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-text text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <span className="font-display text-3xl tracking-wider">
                <span className="text-white">NEXT</span>
                <span className="text-gold">LOOK</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Haine și încălțăminte de brand la prețuri accesibile.
              100% originale, livrare rapidă, retur gratuit.
            </p>
            <p className="text-gold font-medium text-sm">
              Arată bine. Fără stres, fără riscuri.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center bg-white/10 rounded-full hover:bg-gold transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center bg-white/10 rounded-full hover:bg-gold transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="font-display text-xl tracking-wider mb-6">MAGAZIN</h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-gold transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info Links */}
          <div>
            <h3 className="font-display text-xl tracking-wider mb-6">INFORMAȚII</h3>
            <ul className="space-y-3">
              {footerLinks.info.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-gold transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display text-xl tracking-wider mb-6">CONTACT</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white text-sm font-medium">+40 XXX XXX XXX</p>
                  <p className="text-gray-400 text-xs">L-V: 9:00 - 18:00</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                <div>
                  <a
                    href="mailto:contact@nextlook.ro"
                    className="text-white text-sm font-medium hover:text-gold transition-colors"
                  >
                    contact@nextlook.ro
                  </a>
                  <p className="text-gray-400 text-xs">Răspundem în max 2 ore</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                <p className="text-gray-400 text-sm">
                  București, România
                </p>
              </li>
            </ul>

            {/* Trust Badges */}
            <div className="mt-8 flex flex-wrap gap-3">
              <div className="px-3 py-1 bg-white/10 rounded-full text-xs text-gray-300">
                ✓ Produse originale
              </div>
              <div className="px-3 py-1 bg-white/10 rounded-full text-xs text-gray-300">
                ✓ Plată securizată
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {new Date().getFullYear()} NEXTLOOK. Toate drepturile rezervate.
            </p>
            <div className="flex items-center gap-6">
              {footerLinks.legal.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  className="text-gray-400 hover:text-white transition-colors text-xs"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { Truck, CreditCard, Clock, MapPin, Shield, Package } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Livrare și Plată',
  description: 'Informații despre livrare și metodele de plată NEXTLOOK. Livrare în 24-48h în toată România, plată securizată.',
}

const deliveryOptions = [
  {
    icon: Truck,
    title: 'Livrare Standard',
    price: '15 LEI',
    time: '24-48 ore lucrătoare',
    description: 'Livrare prin curier rapid în toată România',
    freeFrom: 'Gratuită pentru comenzi peste 200 LEI',
  },
  {
    icon: Package,
    title: 'Livrare Easybox',
    price: '12 LEI',
    time: '24-48 ore lucrătoare',
    description: 'Ridicare din easybox-ul cel mai apropiat',
    freeFrom: 'Gratuită pentru comenzi peste 200 LEI',
  },
]

const paymentMethods = [
  {
    icon: CreditCard,
    title: 'Card Bancar',
    description: 'Visa, Mastercard, American Express. Plăți procesate securizat prin Stripe.',
    badges: ['Visa', 'Mastercard', 'Stripe'],
  },
  {
    icon: Package,
    title: 'Ramburs (Plata la Livrare)',
    description: 'Plătești curierului la primirea coletului. Cash sau card la curier.',
    badges: ['Cash', 'Card la curier'],
  },
]

export default function LivrarePlataPage() {
  return (
    <>
      <Header />
      <main className="pt-24 min-h-screen bg-cream">
        {/* Hero Section */}
        <section className="py-12 lg:py-16 bg-gradient-to-br from-cream via-cream-100 to-cream-200">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <h1 className="font-display text-display-lg text-text mb-4">
              LIVRARE ȘI PLATĂ
            </h1>
            <p className="text-lg text-text-secondary max-w-xl mx-auto">
              Livrare rapidă în toată România. Plată securizată.
            </p>
          </div>
        </section>

        {/* Quick Info */}
        <section className="py-12">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-6 shadow-soft text-center">
                <Truck className="h-8 w-8 text-gold mx-auto mb-3" />
                <p className="font-medium text-text">24-48h</p>
                <p className="text-sm text-text-secondary">Livrare rapidă</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-soft text-center">
                <Package className="h-8 w-8 text-gold mx-auto mb-3" />
                <p className="font-medium text-text">Gratuit</p>
                <p className="text-sm text-text-secondary">Peste 200 LEI</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-soft text-center">
                <Shield className="h-8 w-8 text-gold mx-auto mb-3" />
                <p className="font-medium text-text">Securizat</p>
                <p className="text-sm text-text-secondary">Plăți Stripe</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-soft text-center">
                <MapPin className="h-8 w-8 text-gold mx-auto mb-3" />
                <p className="font-medium text-text">Toată România</p>
                <p className="text-sm text-text-secondary">Curier rapid</p>
              </div>
            </div>
          </div>
        </section>

        {/* Delivery Options */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="font-display text-display-md text-text mb-12 text-center">
              OPȚIUNI DE LIVRARE
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {deliveryOptions.map((option, index) => (
                <div key={index} className="bg-cream rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <option.icon className="h-6 w-6 text-gold" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-xl text-text mb-1">
                        {option.title}
                      </h3>
                      <p className="text-2xl font-bold text-gold mb-2">
                        {option.price}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                        <Clock className="h-4 w-4" />
                        <span>{option.time}</span>
                      </div>
                      <p className="text-text-secondary text-sm mb-3">
                        {option.description}
                      </p>
                      <p className="text-sm font-medium text-green-600">
                        {option.freeFrom}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Payment Methods */}
        <section className="py-12 lg:py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="font-display text-display-md text-text mb-12 text-center">
              METODE DE PLATĂ
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {paymentMethods.map((method, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-soft">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <method.icon className="h-6 w-6 text-gold" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-xl text-text mb-2">
                        {method.title}
                      </h3>
                      <p className="text-text-secondary text-sm mb-4">
                        {method.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {method.badges.map((badge, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-cream rounded-full text-xs font-medium text-text"
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Detailed Info */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <div className="prose prose-lg max-w-none text-text-secondary">

                <h2 className="font-display text-2xl text-text">Informații despre Livrare</h2>

                <h3 className="font-display text-xl text-text">Timp de Procesare</h3>
                <p>
                  Comenzile plasate <strong>înainte de ora 14:00</strong> în zilele lucrătoare sunt procesate în aceeași zi. Comenzile plasate după ora 14:00 sau în weekend sunt procesate în următoarea zi lucrătoare.
                </p>

                <h3 className="font-display text-xl text-text">Zonă de Livrare</h3>
                <p>
                  Livrăm în <strong>toată România</strong> prin curierii parteneri. Momentan nu livrăm internațional.
                </p>

                <h3 className="font-display text-xl text-text">Urmărirea Comenzii</h3>
                <p>
                  După expedierea comenzii, vei primi un email cu numărul AWB și linkul de urmărire. Poți verifica oricând statusul comenzii în contul tău sau contactându-ne.
                </p>

                <h3 className="font-display text-xl text-text">Verificarea Coletului</h3>
                <p>
                  La primirea coletului, te rugăm să verifici integritatea ambalajului. Dacă ambalajul prezintă urme de deteriorare, ai dreptul să refuzi coletul sau să-l deschizi în prezența curierului și să notezi eventualele probleme.
                </p>

                <h2 className="font-display text-2xl text-text">Informații despre Plată</h2>

                <h3 className="font-display text-xl text-text">Securitatea Plăților</h3>
                <p>
                  Toate plățile cu cardul sunt procesate securizat prin <strong>Stripe</strong>, unul dintre cei mai siguri procesatori de plăți din lume. Nu avem acces la datele complete ale cardului tău.
                </p>
                <p>
                  Plățile sunt protejate prin:
                </p>
                <ul>
                  <li>Criptare SSL 256-bit</li>
                  <li>Conformitate PCI-DSS Level 1</li>
                  <li>Autentificare 3D Secure (când este necesară)</li>
                </ul>

                <h3 className="font-display text-xl text-text">Facturare</h3>
                <p>
                  Pentru fiecare comandă se emite factură fiscală. Factura este trimisă pe email și poate fi descărcată din contul tău. Pentru facturare pe persoană juridică, introdu datele firmei în procesul de checkout.
                </p>

                <h2 className="font-display text-2xl text-text">Întrebări Frecvente</h2>

                <h3 className="font-display text-xl text-text">Pot modifica adresa de livrare după plasarea comenzii?</h3>
                <p>
                  Da, contactează-ne cât mai rapid la contact@nextlook.ro sau +40 749 976 984. Dacă comanda nu a fost încă expediată, putem modifica adresa.
                </p>

                <h3 className="font-display text-xl text-text">Ce se întâmplă dacă nu sunt acasă?</h3>
                <p>
                  Curierul va încerca să te contacteze telefonic. De obicei, se fac 2-3 încercări de livrare. Poți reprograma livrarea sau opta pentru livrare în Easybox.
                </p>

                <h3 className="font-display text-xl text-text">Livrați și în ziua de sâmbătă?</h3>
                <p>
                  Depinde de curierul partener și zonă. În marile orașe, livrarea sâmbăta este disponibilă pentru comenzile plasate vineri înainte de ora 12:00.
                </p>

                <h2 className="font-display text-2xl text-text">Contact</h2>
                <p>
                  Pentru orice întrebări despre livrare sau plată:
                </p>
                <ul>
                  <li><strong>Email:</strong> contact@nextlook.ro</li>
                  <li><strong>Telefon:</strong> +40 749 976 984 (L-V: 9:00 - 18:00)</li>
                </ul>

              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

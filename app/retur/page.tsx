import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { Package, Clock, CheckCircle, ArrowRight, Phone, Mail } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politica de Retur',
  description: 'Politica de retur NEXTLOOK. Retur gratuit în 30 de zile. Află cum să returnezi un produs simplu și rapid.',
}

const steps = [
  {
    icon: Mail,
    title: 'Anunță-ne',
    description: 'Trimite un email la contact@nextlook.ro sau sună la +40 749 976 984 cu numărul comenzii și produsele pe care dorești să le returnezi.',
  },
  {
    icon: Package,
    title: 'Pregătește Coletul',
    description: 'Împachetează produsele în ambalajul original sau într-un ambalaj adecvat. Atașează eticheta de retur pe care ți-o trimitem.',
  },
  {
    icon: Clock,
    title: 'Trimite Coletul',
    description: 'Curierul va ridica coletul de la adresa indicată. Nu plătești nimic pentru transport.',
  },
  {
    icon: CheckCircle,
    title: 'Primești Banii',
    description: 'După verificarea produselor, îți returnăm banii în maxim 14 zile pe același instrument de plată utilizat.',
  },
]

export default function ReturPage() {
  return (
    <>
      <Header />
      <main className="pt-24 min-h-screen bg-cream">
        {/* Hero Section */}
        <section className="py-12 lg:py-16 bg-gradient-to-br from-cream via-cream-100 to-cream-200">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <h1 className="font-display text-display-lg text-text mb-4">
              POLITICA DE RETUR
            </h1>
            <p className="text-lg text-text-secondary max-w-xl mx-auto">
              Retur gratuit în 30 de zile. Fără întrebări, fără costuri ascunse.
            </p>
          </div>
        </section>

        {/* Key Info */}
        <section className="py-12">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-6 shadow-soft text-center">
                <div className="text-4xl font-display text-gold mb-2">30</div>
                <p className="text-text-secondary">Zile pentru retur</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-soft text-center">
                <div className="text-4xl font-display text-gold mb-2">0 LEI</div>
                <p className="text-text-secondary">Cost transport retur</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-soft text-center">
                <div className="text-4xl font-display text-gold mb-2">14</div>
                <p className="text-text-secondary">Zile pentru rambursare</p>
              </div>
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="font-display text-display-md text-text mb-12 text-center">
              CUM RETURNEZI UN PRODUS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  <div className="bg-cream rounded-2xl p-6 h-full">
                    <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mb-4">
                      <step.icon className="h-6 w-6 text-gold" />
                    </div>
                    <div className="absolute -top-3 -left-3 w-8 h-8 bg-gold rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <h3 className="font-display text-lg text-text mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-text-secondary">
                      {step.description}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-gold/30 h-6 w-6" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Detailed Policy */}
        <section className="py-12 lg:py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-soft p-6 lg:p-10">
              <div className="prose prose-lg max-w-none text-text-secondary">

                <h2 className="font-display text-2xl text-text mt-0">Dreptul de Retragere</h2>
                <p>
                  Conform <strong>OUG 34/2014</strong> privind drepturile consumatorilor, aveți dreptul de a vă retrage din contractul la distanță în termen de <strong>14 zile calendaristice</strong> de la data la care ați intrat în posesia produsului, fără a fi nevoie să justificați decizia.
                </p>
                <p>
                  <strong>NEXTLOOK extinde acest termen la 30 de zile</strong> și oferă transport gratuit pentru retur.
                </p>

                <h2 className="font-display text-2xl text-text">Condiții pentru Retur</h2>
                <p>
                  Pentru a beneficia de retur, produsele trebuie:
                </p>
                <ul>
                  <li>Să nu fi fost utilizate, spălate sau deteriorate</li>
                  <li>Să aibă toate etichetele originale atașate</li>
                  <li>Să fie returnate în ambalajul original sau într-un ambalaj care le protejează</li>
                  <li>Să fie returnate împreună cu toate accesoriile primite</li>
                </ul>

                <h2 className="font-display text-2xl text-text">Produse Care Nu Pot Fi Returnate</h2>
                <ul>
                  <li>Articole personalizate sau realizate la comandă</li>
                  <li>Articole de igienă intimă (lenjerie, costume de baie) dacă au fost desfăcute</li>
                  <li>Produse care, din motive de igienă sau de protecție a sănătății, nu pot fi returnate</li>
                </ul>

                <h2 className="font-display text-2xl text-text">Rambursarea</h2>
                <p>
                  Vom rambursa toate sumele plătite, inclusiv costurile de livrare inițiale (pentru livrarea standard), în maxim <strong>14 zile</strong> de la primirea produselor returnate.
                </p>
                <p>
                  Rambursarea se face folosind aceeași metodă de plată utilizată pentru tranzacția inițială:
                </p>
                <ul>
                  <li><strong>Card bancar:</strong> suma va fi returnată pe card în 3-14 zile lucrătoare (depinde de banca emitentă)</li>
                  <li><strong>Ramburs:</strong> prin transfer bancar în contul indicat</li>
                </ul>

                <h2 className="font-display text-2xl text-text">Schimbarea Produselor</h2>
                <p>
                  Dacă dorești să schimbi produsul (altă mărime sau culoare):
                </p>
                <ol>
                  <li>Returnează produsul actual urmând procedura de retur</li>
                  <li>Plasează o nouă comandă cu produsul dorit</li>
                </ol>
                <p>
                  Această metodă îți garantează că produsul dorit este în stoc și ajunge cât mai rapid.
                </p>

                <h2 className="font-display text-2xl text-text">Produse Defecte sau Greșite</h2>
                <p>
                  Dacă ai primit un produs defect sau diferit de cel comandat:
                </p>
                <ul>
                  <li>Contactează-ne în maxim 48 de ore de la primire</li>
                  <li>Trimite poze cu produsul și defectul</li>
                  <li>Vom organiza ridicarea și înlocuirea sau rambursarea completă</li>
                </ul>
                <p>
                  În aceste cazuri, toate costurile sunt suportate de noi.
                </p>

                <h2 className="font-display text-2xl text-text">Garanția Legală</h2>
                <p>
                  Toate produsele beneficiază de garanția legală de conformitate de <strong>2 ani</strong> conform Legii 449/2003. Dacă produsul prezintă defecte de fabricație în această perioadă, aveți dreptul la:
                </p>
                <ul>
                  <li>Reparare gratuită</li>
                  <li>Înlocuire cu un produs identic</li>
                  <li>Rambursarea prețului (dacă repararea sau înlocuirea nu sunt posibile)</li>
                </ul>

                <h2 className="font-display text-2xl text-text">Contact pentru Retururi</h2>
                <div className="bg-cream rounded-xl p-6 not-prose">
                  <div className="flex items-center gap-3 mb-4">
                    <Mail className="h-5 w-5 text-gold" />
                    <div>
                      <p className="font-medium text-text">Email</p>
                      <a href="mailto:contact@nextlook.ro" className="text-gold hover:underline">contact@nextlook.ro</a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gold" />
                    <div>
                      <p className="font-medium text-text">Telefon</p>
                      <a href="tel:+40749976984" className="text-gold hover:underline">+40 749 976 984</a>
                      <p className="text-sm text-text-secondary">L-V: 9:00 - 18:00</p>
                    </div>
                  </div>
                </div>

                <h2 className="font-display text-2xl text-text">Alte Informații</h2>
                <p>
                  Pentru informații complete despre drepturile dvs. ca și consumator, consultați <Link href="/termeni" className="text-gold hover:underline">Termenii și Condițiile</Link>.
                </p>
                <p>
                  Dacă nu reușim să găsim o soluție amiabilă, puteți contacta <strong>ANPC</strong> (Autoritatea Națională pentru Protecția Consumatorilor) sau utiliza platforma europeană ODR: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">https://ec.europa.eu/consumers/odr</a>
                </p>

              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

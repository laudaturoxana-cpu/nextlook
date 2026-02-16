import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { Heart, Users, Shield, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const values = [
  {
    icon: Heart,
    title: 'Pasiune pentru Stil',
    description: 'Credem că fiecare persoană merită să se simtă bine în propria piele. Selecția noastră este făcută cu grijă pentru a te ajuta să îți exprimi personalitatea.',
  },
  {
    icon: Shield,
    title: '100% Autenticitate',
    description: 'Colaborăm doar cu furnizori verificați și autorizați. Fiecare produs vine cu etichetă originală și certificat de garanție.',
  },
  {
    icon: Users,
    title: 'Comunitate',
    description: 'Nu suntem doar un magazin, suntem o comunitate de oameni care apreciază calitatea și stilul. Feedback-ul clienților noștri ne ghidează în fiecare decizie.',
  },
  {
    icon: Sparkles,
    title: 'Experiență Fără Stres',
    description: 'Am eliminat toate fricile legate de cumpărăturile online: livrare rapidă, retur gratuit, suport dedicat. Shopping-ul trebuie să fie plăcut.',
  },
]

export default function DesprePage() {
  return (
    <>
      <Header />
      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 bg-gradient-to-br from-cream via-cream-100 to-cream-200">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-text-secondary mb-4">
                Despre NEXTLOOK
              </p>
              <h1 className="font-display text-display-lg text-text mb-6">
                ARATĂ BINE. FĂRĂ STRES, FĂRĂ RISCURI.
              </h1>
              <p className="text-lg text-text-secondary leading-relaxed">
                NEXTLOOK s-a născut dintr-o frustrare simplă: de ce trebuie să fie atât de greu să cumperi haine și încălțăminte online? De ce să te întrebi dacă produsul e original? De ce să te stresezi că nu îți va veni bine?
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 lg:py-32 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="font-display text-display-md text-text mb-8 text-center">
                POVESTEA NOASTRĂ
              </h2>
              <div className="prose prose-lg max-w-none text-text-secondary">
                <p>
                  Am început NEXTLOOK cu o misiune clară: să facem cumpărăturile de haine și încălțăminte de brand o experiență plăcută și fără griji.
                </p>
                <p>
                  Știm cum e să comanzi online și să primești altceva decât te așteptai. Știm cum e să nu îți vină mărimea și să te chinui să returnezi. Știm cum e să te întrebi dacă produsul e original sau nu.
                </p>
                <p>
                  De aceea am construit NEXTLOOK diferit:
                </p>
                <ul>
                  <li><strong>Produse 100% originale</strong> - colaborăm doar cu furnizori autorizați</li>
                  <li><strong>Selecție curată</strong> - nu avem mii de produse random, ci o colecție atent aleasă</li>
                  <li><strong>Retur gratuit 30 zile</strong> - fără întrebări, fără costuri ascunse</li>
                  <li><strong>Ghid de mărimi detaliat</strong> - să știi exact ce comanzi</li>
                  <li><strong>Sugestii de styling</strong> - să vezi cum să combini piesele</li>
                </ul>
                <p>
                  Credem că nu trebuie să fii expert în modă ca să arăți bine. Trebuie doar să găsești produsele potrivite. Noi te ajutăm să le găsești.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 lg:py-32 bg-cream">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="font-display text-display-md text-text mb-16 text-center">
              VALORILE NOASTRE
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-soft"
                >
                  <div className="w-14 h-14 bg-gold/10 rounded-full flex items-center justify-center mb-4">
                    <value.icon className="h-7 w-7 text-gold" />
                  </div>
                  <h3 className="font-display text-xl text-text mb-2">
                    {value.title}
                  </h3>
                  <p className="text-text-secondary">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 lg:py-32 bg-text text-white">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <h2 className="font-display text-display-md mb-6">
              PREGĂTIT SĂ ÎȚI GĂSEȘTI STILUL?
            </h2>
            <p className="text-white/70 mb-8 max-w-xl mx-auto">
              Explorează colecția noastră și descoperă produse care te reprezintă. Fără stres, fără riscuri.
            </p>
            <Link href="/shop">
              <Button size="lg">Vezi Colecția</Button>
            </Link>
          </div>
        </section>

        {/* Company Info */}
        <section className="py-12 bg-cream-200">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <p className="text-text-secondary text-sm">
              <strong>NEXT LOOK SRL</strong> | CUI: 53260192 | Brașov, Str. Carpaților nr. 6, Bl. E28, Ap. 27
            </p>
            <p className="text-text-secondary text-sm mt-2">
              Telefon: <a href="tel:+40749976984" className="text-gold hover:underline">+40 749 976 984</a> | Email: <a href="mailto:contact@nextlook.ro" className="text-gold hover:underline">contact@nextlook.ro</a>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

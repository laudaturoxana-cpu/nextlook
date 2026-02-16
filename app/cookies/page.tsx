import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politica de Cookies',
  description: 'Politica de cookies NEXTLOOK. Informații despre utilizarea cookie-urilor pe site-ul nostru.',
}

export default function CookiesPage() {
  return (
    <>
      <Header />
      <main className="pt-24 min-h-screen bg-cream">
        {/* Hero Section */}
        <section className="py-12 lg:py-16 bg-gradient-to-br from-cream via-cream-100 to-cream-200">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <h1 className="font-display text-display-lg text-text mb-4">
              POLITICA DE COOKIES
            </h1>
            <p className="text-text-secondary">
              Ultima actualizare: {new Date().toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 lg:py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-soft p-6 lg:p-10">
              <div className="prose prose-lg max-w-none text-text-secondary">

                <h2 className="font-display text-2xl text-text mt-0">1. Ce Sunt Cookie-urile?</h2>
                <p>
                  Cookie-urile sunt fișiere text mici stocate pe dispozitivul dvs. (computer, telefon, tabletă) atunci când vizitați un site web. Acestea permit site-ului să vă recunoască și să-și amintească preferințele dvs.
                </p>

                <h2 className="font-display text-2xl text-text">2. Cine Utilizează Cookie-uri?</h2>
                <p>
                  Acest site este operat de <strong>NEXT LOOK SRL</strong>, CUI 53260192, cu sediul în Brașov, Str. Carpaților nr. 6, Bl. E28, Ap. 27. Pentru întrebări, contactați-ne la contact@nextlook.ro.
                </p>

                <h2 className="font-display text-2xl text-text">3. Tipuri de Cookie-uri Utilizate</h2>

                <h3 className="font-display text-xl text-text">Cookie-uri Strict Necesare</h3>
                <p>
                  Acestea sunt esențiale pentru funcționarea site-ului și nu pot fi dezactivate. Includ:
                </p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Cookie</th>
                      <th className="text-left py-2">Scop</th>
                      <th className="text-left py-2">Durată</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">sb-*-auth-token</td>
                      <td className="py-2">Autentificare utilizator (Supabase)</td>
                      <td className="py-2">Sesiune</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">cart</td>
                      <td className="py-2">Salvarea coșului de cumpărături</td>
                      <td className="py-2">30 zile</td>
                    </tr>
                  </tbody>
                </table>

                <h3 className="font-display text-xl text-text">Cookie-uri Funcționale</h3>
                <p>
                  Permit funcționalități îmbunătățite și personalizare:
                </p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Cookie</th>
                      <th className="text-left py-2">Scop</th>
                      <th className="text-left py-2">Durată</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">preferences</td>
                      <td className="py-2">Preferințe utilizator</td>
                      <td className="py-2">1 an</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">recently_viewed</td>
                      <td className="py-2">Produse vizualizate recent</td>
                      <td className="py-2">30 zile</td>
                    </tr>
                  </tbody>
                </table>

                <h3 className="font-display text-xl text-text">Cookie-uri Analitice</h3>
                <p>
                  Ne ajută să înțelegem cum este utilizat site-ul pentru a-l îmbunătăți:
                </p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Cookie</th>
                      <th className="text-left py-2">Furnizor</th>
                      <th className="text-left py-2">Scop</th>
                      <th className="text-left py-2">Durată</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">_ga, _gid</td>
                      <td className="py-2">Google Analytics</td>
                      <td className="py-2">Statistici vizitatori</td>
                      <td className="py-2">2 ani / 24h</td>
                    </tr>
                  </tbody>
                </table>

                <h3 className="font-display text-xl text-text">Cookie-uri de Marketing</h3>
                <p>
                  Utilizate pentru a afișa reclame relevante:
                </p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Cookie</th>
                      <th className="text-left py-2">Furnizor</th>
                      <th className="text-left py-2">Scop</th>
                      <th className="text-left py-2">Durată</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">_fbp</td>
                      <td className="py-2">Facebook</td>
                      <td className="py-2">Reclame personalizate</td>
                      <td className="py-2">3 luni</td>
                    </tr>
                  </tbody>
                </table>

                <h2 className="font-display text-2xl text-text">4. Cum Puteți Controla Cookie-urile</h2>

                <h3 className="font-display text-xl text-text">Prin Browser</h3>
                <p>
                  Puteți configura browserul să refuze cookie-urile sau să vă alerteze când se trimit cookie-uri. Instrucțiuni pentru principalele browsere:
                </p>
                <ul>
                  <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">Google Chrome</a></li>
                  <li><a href="https://support.mozilla.org/ro/kb/activarea-si-dezactivarea-cookie-urilor" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">Mozilla Firefox</a></li>
                  <li><a href="https://support.apple.com/ro-ro/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">Safari</a></li>
                  <li><a href="https://support.microsoft.com/ro-ro/microsoft-edge/ștergerea-modulelor-cookie-în-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">Microsoft Edge</a></li>
                </ul>

                <h3 className="font-display text-xl text-text">Opt-out pentru Analytics</h3>
                <p>
                  Puteți dezactiva Google Analytics instalând add-on-ul de browser: <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">Google Analytics Opt-out</a>
                </p>

                <h2 className="font-display text-2xl text-text">5. Ce Se Întâmplă Dacă Dezactivați Cookie-urile?</h2>
                <p>
                  Dacă dezactivați cookie-urile:
                </p>
                <ul>
                  <li>Coșul de cumpărături nu va fi salvat între vizite</li>
                  <li>Nu veți putea rămâne autentificat</li>
                  <li>Unele funcționalități ale site-ului pot fi afectate</li>
                </ul>
                <p>
                  Cookie-urile strict necesare nu pot fi dezactivate deoarece site-ul nu ar funcționa fără ele.
                </p>

                <h2 className="font-display text-2xl text-text">6. Cookie-uri Terțe</h2>
                <p>
                  Unele cookie-uri sunt plasate de servicii terțe care apar pe paginile noastre. Nu avem control asupra acestor cookie-uri. Consultați politicile de confidențialitate ale furnizorilor terți:
                </p>
                <ul>
                  <li><a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">Stripe (plăți)</a></li>
                  <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">Google</a></li>
                  <li><a href="https://www.facebook.com/privacy/explanation" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">Facebook/Meta</a></li>
                </ul>

                <h2 className="font-display text-2xl text-text">7. Actualizări ale Politicii</h2>
                <p>
                  Putem actualiza această politică periodic. Data ultimei modificări este afișată la începutul paginii. Vă recomandăm să consultați periodic această pagină.
                </p>

                <h2 className="font-display text-2xl text-text">8. Contact</h2>
                <p>
                  Pentru întrebări despre utilizarea cookie-urilor:
                </p>
                <ul>
                  <li><strong>Email:</strong> contact@nextlook.ro</li>
                  <li><strong>Telefon:</strong> +40 749 976 984</li>
                </ul>
                <p>
                  Pentru informații complete despre prelucrarea datelor personale, consultați <Link href="/confidentialitate" className="text-gold hover:underline">Politica de Confidențialitate</Link>.
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

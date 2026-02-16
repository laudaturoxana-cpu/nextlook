import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politica de Confidențialitate',
  description: 'Politica de confidențialitate NEXTLOOK. Informații despre prelucrarea datelor personale conform GDPR.',
}

export default function ConfidentialitatePage() {
  return (
    <>
      <Header />
      <main className="pt-24 min-h-screen bg-cream">
        {/* Hero Section */}
        <section className="py-12 lg:py-16 bg-gradient-to-br from-cream via-cream-100 to-cream-200">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <h1 className="font-display text-display-lg text-text mb-4">
              POLITICA DE CONFIDENȚIALITATE
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

                <h2 className="font-display text-2xl text-text mt-0">1. Cine Suntem</h2>
                <p>
                  Operatorul datelor personale este <strong>NEXT LOOK SRL</strong>, cu sediul în Jud. Brașov, Municipiul Brașov, Strada Carpaților, Nr. 6, Bl. E28, Ap. 27, CUI 53260192.
                </p>
                <p>
                  Ne puteți contacta la:
                </p>
                <ul>
                  <li><strong>Email:</strong> contact@nextlook.ro</li>
                  <li><strong>Telefon:</strong> +40 749 976 984</li>
                </ul>

                <h2 className="font-display text-2xl text-text">2. Ce Date Colectăm</h2>
                <p>
                  Colectăm următoarele categorii de date personale:
                </p>

                <h3 className="font-display text-xl text-text">Date furnizate direct de dvs.:</h3>
                <ul>
                  <li><strong>Date de identificare:</strong> nume, prenume</li>
                  <li><strong>Date de contact:</strong> adresă email, număr de telefon</li>
                  <li><strong>Date de livrare:</strong> adresa de livrare (stradă, număr, oraș, județ, cod poștal)</li>
                  <li><strong>Date de facturare:</strong> adresa de facturare, date fiscale (pentru persoane juridice)</li>
                </ul>

                <h3 className="font-display text-xl text-text">Date colectate automat:</h3>
                <ul>
                  <li><strong>Date tehnice:</strong> adresa IP, tipul browserului, dispozitivul utilizat</li>
                  <li><strong>Date de navigare:</strong> paginile vizitate, timpul petrecut pe site</li>
                  <li><strong>Cookie-uri:</strong> conform <Link href="/cookies" className="text-gold hover:underline">Politicii de Cookies</Link></li>
                </ul>

                <h2 className="font-display text-2xl text-text">3. De Ce Colectăm Aceste Date</h2>
                <p>
                  Prelucrăm datele dvs. personale pentru următoarele scopuri:
                </p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Scop</th>
                      <th className="text-left py-2">Temei juridic</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">Procesarea și livrarea comenzilor</td>
                      <td className="py-2">Executarea contractului</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Emiterea facturilor</td>
                      <td className="py-2">Obligație legală</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Comunicări legate de comandă</td>
                      <td className="py-2">Executarea contractului</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Newsletter și oferte</td>
                      <td className="py-2">Consimțământ</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Răspuns la solicitări</td>
                      <td className="py-2">Interes legitim</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Îmbunătățirea serviciilor</td>
                      <td className="py-2">Interes legitim</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Prevenirea fraudelor</td>
                      <td className="py-2">Interes legitim</td>
                    </tr>
                  </tbody>
                </table>

                <h2 className="font-display text-2xl text-text">4. Cât Timp Păstrăm Datele</h2>
                <ul>
                  <li><strong>Date pentru comenzi și facturi:</strong> 10 ani (obligație fiscală)</li>
                  <li><strong>Date pentru cont:</strong> până la ștergerea contului + 30 zile</li>
                  <li><strong>Date pentru newsletter:</strong> până la dezabonare</li>
                  <li><strong>Date de navigare:</strong> maximum 2 ani</li>
                </ul>

                <h2 className="font-display text-2xl text-text">5. Cu Cine Împărțim Datele</h2>
                <p>
                  Putem partaja datele dvs. cu:
                </p>
                <ul>
                  <li><strong>Servicii de curierat:</strong> pentru livrarea comenzilor</li>
                  <li><strong>Procesator de plăți (Stripe):</strong> pentru procesarea plăților cu cardul</li>
                  <li><strong>Servicii de email (Resend, MailerLite):</strong> pentru comunicări și newsletter</li>
                  <li><strong>Servicii de hosting și infrastructură (Vercel, Supabase)</strong></li>
                  <li><strong>Autorități publice:</strong> când legea o impune</li>
                </ul>
                <p>
                  Toți partenerii noștri sunt obligați contractual să protejeze datele dvs. și să le utilizeze doar în scopurile specificate.
                </p>

                <h2 className="font-display text-2xl text-text">6. Transferuri Internaționale</h2>
                <p>
                  Unii dintre furnizorii noștri de servicii pot stoca date în afara Spațiului Economic European. În aceste cazuri, ne asigurăm că există garanții adecvate:
                </p>
                <ul>
                  <li>Clauze contractuale standard aprobate de Comisia Europeană</li>
                  <li>Certificare Data Privacy Framework (pentru SUA)</li>
                </ul>

                <h2 className="font-display text-2xl text-text">7. Drepturile Dvs.</h2>
                <p>
                  Conform GDPR, aveți următoarele drepturi:
                </p>
                <ul>
                  <li><strong>Dreptul de acces:</strong> puteți solicita o copie a datelor dvs.</li>
                  <li><strong>Dreptul la rectificare:</strong> puteți cere corectarea datelor inexacte</li>
                  <li><strong>Dreptul la ștergere („dreptul de a fi uitat"):</strong> puteți cere ștergerea datelor în anumite condiții</li>
                  <li><strong>Dreptul la restricționare:</strong> puteți limita prelucrarea datelor</li>
                  <li><strong>Dreptul la portabilitate:</strong> puteți primi datele într-un format structurat</li>
                  <li><strong>Dreptul de opoziție:</strong> vă puteți opune prelucrării bazate pe interes legitim</li>
                  <li><strong>Dreptul de a retrage consimțământul:</strong> în orice moment, fără a afecta legalitatea prelucrării anterioare</li>
                </ul>
                <p>
                  Pentru a vă exercita drepturile, contactați-ne la <strong>contact@nextlook.ro</strong>.
                </p>
                <p>
                  Aveți dreptul de a depune o plângere la <strong>Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP)</strong>: <a href="https://www.dataprotection.ro" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">www.dataprotection.ro</a>
                </p>

                <h2 className="font-display text-2xl text-text">8. Securitatea Datelor</h2>
                <p>
                  Implementăm măsuri tehnice și organizatorice pentru protecția datelor:
                </p>
                <ul>
                  <li>Criptare SSL/TLS pentru toate comunicațiile</li>
                  <li>Acces restricționat la date pe bază de necesitate</li>
                  <li>Parteneri care respectă standardele de securitate (PCI-DSS pentru plăți)</li>
                  <li>Backup-uri regulate și proceduri de recuperare</li>
                </ul>

                <h2 className="font-display text-2xl text-text">9. Date ale Minorilor</h2>
                <p>
                  Site-ul nostru nu este destinat persoanelor sub 16 ani. Nu colectăm cu bună știință date de la minori. Dacă sunteți părinte și credeți că copilul dvs. ne-a furnizat date, contactați-ne pentru ștergere.
                </p>

                <h2 className="font-display text-2xl text-text">10. Modificări ale Politicii</h2>
                <p>
                  Putem actualiza această politică periodic. Modificările semnificative vor fi comunicate prin email sau prin notificare pe site. Vă încurajăm să consultați periodic această pagină.
                </p>

                <h2 className="font-display text-2xl text-text">11. Contact</h2>
                <p>
                  Pentru orice întrebări despre confidențialitate sau pentru a vă exercita drepturile:
                </p>
                <ul>
                  <li><strong>Email:</strong> contact@nextlook.ro</li>
                  <li><strong>Telefon:</strong> +40 749 976 984</li>
                  <li><strong>Adresă:</strong> NEXT LOOK SRL, Brașov, Str. Carpaților nr. 6, Bl. E28, Ap. 27</li>
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

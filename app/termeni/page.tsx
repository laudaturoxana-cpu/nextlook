import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Termeni și Condiții',
  description: 'Termeni și condiții de utilizare a site-ului NEXTLOOK. Informații despre comenzi, livrare, plată și drepturile consumatorilor.',
}

export default function TermeniPage() {
  return (
    <>
      <Header />
      <main className="pt-24 min-h-screen bg-cream">
        {/* Hero Section */}
        <section className="py-12 lg:py-16 bg-gradient-to-br from-cream via-cream-100 to-cream-200">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <h1 className="font-display text-display-lg text-text mb-4">
              TERMENI ȘI CONDIȚII
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

                <h2 className="font-display text-2xl text-text mt-0">1. Informații despre Vânzător</h2>
                <p>
                  Acest site este operat de <strong>NEXT LOOK SRL</strong>, o societate comercială înregistrată în România:
                </p>
                <ul>
                  <li><strong>Denumire:</strong> NEXT LOOK SRL</li>
                  <li><strong>CUI:</strong> 53260192</li>
                  <li><strong>Sediu social:</strong> Jud. Brașov, Municipiul Brașov, Strada Carpaților, Nr. 6, Bl. E28, Ap. 27</li>
                  <li><strong>Email:</strong> contact@nextlook.ro</li>
                  <li><strong>Telefon:</strong> +40 749 976 984</li>
                </ul>

                <h2 className="font-display text-2xl text-text">2. Definiții</h2>
                <ul>
                  <li><strong>„Site"</strong> – website-ul www.nextlook.ro</li>
                  <li><strong>„Client/Cumpărător"</strong> – orice persoană fizică sau juridică care accesează Site-ul și plasează o comandă</li>
                  <li><strong>„Vânzător"</strong> – NEXT LOOK SRL</li>
                  <li><strong>„Produs"</strong> – articolele de îmbrăcăminte și încălțăminte comercializate prin Site</li>
                  <li><strong>„Contract"</strong> – contractul la distanță încheiat între Vânzător și Client</li>
                </ul>

                <h2 className="font-display text-2xl text-text">3. Accesul și Utilizarea Site-ului</h2>
                <p>
                  Accesul la Site este permis tuturor utilizatorilor. Pentru a plasa o comandă, nu este obligatorie crearea unui cont, dar acest lucru facilitează urmărirea comenzilor și accesul la istoricul achizițiilor.
                </p>
                <p>
                  Utilizatorul se obligă să furnizeze informații corecte și complete la plasarea comenzii. NEXT LOOK SRL își rezervă dreptul de a refuza sau anula comenzile care conțin informații incomplete sau incorecte.
                </p>

                <h2 className="font-display text-2xl text-text">4. Produsele</h2>
                <p>
                  Toate produsele comercializate prin Site sunt <strong>100% originale</strong>, provenind de la furnizori autorizați. Fiecare produs este verificat înainte de expediere.
                </p>
                <p>
                  Imaginile produselor sunt reprezentative, iar culorile pot varia ușor în funcție de setările monitorului. Descrierile produselor sunt cât mai precise, însă pot exista mici diferențe între descriere și produsul real.
                </p>

                <h2 className="font-display text-2xl text-text">5. Prețuri și Modalități de Plată</h2>
                <p>
                  Toate prețurile afișate pe Site sunt în <strong>LEI (RON)</strong> și includ TVA. Costul de livrare este afișat separat în procesul de checkout.
                </p>
                <p>Modalități de plată acceptate:</p>
                <ul>
                  <li>Card bancar (Visa, Mastercard) – prin procesatorul securizat Stripe</li>
                  <li>Ramburs (plata la livrare)</li>
                </ul>
                <p>
                  Plățile cu cardul sunt procesate în mod securizat prin Stripe. NEXT LOOK SRL nu are acces la datele complete ale cardului dvs.
                </p>

                <h2 className="font-display text-2xl text-text">6. Comanda și Contractul</h2>
                <p>
                  Plasarea unei comenzi reprezintă acceptarea acestor Termeni și Condiții și constituie o ofertă fermă de cumpărare.
                </p>
                <p>
                  Contractul se consideră încheiat în momentul primirii de către Client a confirmării comenzii prin email. Confirmarea comenzii conține detaliile produselor comandate, prețul total și adresa de livrare.
                </p>

                <h2 className="font-display text-2xl text-text">7. Livrarea</h2>
                <p>
                  Livrarea se efectuează în toată România prin curier. Termenul standard de livrare este de <strong>24-48 ore lucrătoare</strong> pentru comenzile plasate înainte de ora 14:00.
                </p>
                <p>
                  Detalii complete despre livrare găsiți pe pagina <Link href="/livrare-plata" className="text-gold hover:underline">Livrare și Plată</Link>.
                </p>

                <h2 className="font-display text-2xl text-text">8. Dreptul de Retragere</h2>
                <p>
                  În conformitate cu <strong>OUG 34/2014</strong>, aveți dreptul de a vă retrage din contract în termen de <strong>14 zile calendaristice</strong> de la primirea produsului, fără a fi nevoie să justificați decizia.
                </p>
                <p>
                  NEXT LOOK SRL extinde acest termen la <strong>30 de zile</strong> și oferă retur gratuit.
                </p>
                <p>
                  Pentru detalii complete, consultați <Link href="/retur" className="text-gold hover:underline">Politica de Retur</Link>.
                </p>

                <h2 className="font-display text-2xl text-text">9. Garanția Produselor</h2>
                <p>
                  Toate produsele beneficiază de garanția legală de conformitate de <strong>2 ani</strong> conform Legii 449/2003. În cazul în care produsul prezintă defecte de fabricație, aveți dreptul la reparare, înlocuire sau rambursare.
                </p>

                <h2 className="font-display text-2xl text-text">10. Protecția Datelor Personale</h2>
                <p>
                  NEXT LOOK SRL prelucrează datele personale în conformitate cu <strong>Regulamentul (UE) 2016/679 (GDPR)</strong>. Detalii complete despre prelucrarea datelor găsiți în <Link href="/confidentialitate" className="text-gold hover:underline">Politica de Confidențialitate</Link>.
                </p>

                <h2 className="font-display text-2xl text-text">11. Proprietate Intelectuală</h2>
                <p>
                  Toate elementele Site-ului (texte, imagini, logo-uri, grafică) sunt proprietatea NEXT LOOK SRL sau a licențiatorilor săi și sunt protejate de legislația privind drepturile de autor.
                </p>
                <p>
                  Este interzisă reproducerea, distribuirea sau utilizarea acestor elemente fără acordul scris prealabil al NEXT LOOK SRL.
                </p>

                <h2 className="font-display text-2xl text-text">12. Limitarea Răspunderii</h2>
                <p>
                  NEXT LOOK SRL nu răspunde pentru:
                </p>
                <ul>
                  <li>Daunele cauzate de utilizarea incorectă a produselor</li>
                  <li>Întârzieri în livrare cauzate de curieri sau forță majoră</li>
                  <li>Indisponibilitatea temporară a Site-ului</li>
                  <li>Erorile tipografice sau tehnice din descrierile produselor</li>
                </ul>

                <h2 className="font-display text-2xl text-text">13. Soluționarea Litigiilor</h2>
                <p>
                  În cazul unui litigiu, vă încurajăm să ne contactați mai întâi la contact@nextlook.ro pentru a găsi o soluție amiabilă.
                </p>
                <p>
                  Aveți dreptul de a sesiza <strong>ANPC</strong> (Autoritatea Națională pentru Protecția Consumatorilor) sau de a utiliza platforma europeană de soluționare online a litigiilor: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">https://ec.europa.eu/consumers/odr</a>
                </p>

                <h2 className="font-display text-2xl text-text">14. Modificări ale Termenilor</h2>
                <p>
                  NEXT LOOK SRL își rezervă dreptul de a modifica acești Termeni și Condiții. Modificările intră în vigoare la data publicării pe Site. Vă recomandăm să consultați periodic această pagină.
                </p>

                <h2 className="font-display text-2xl text-text">15. Legea Aplicabilă</h2>
                <p>
                  Acești Termeni și Condiții sunt guvernați de legislația română. Orice litigiu va fi soluționat de instanțele competente din România.
                </p>

                <h2 className="font-display text-2xl text-text">16. Contact</h2>
                <p>
                  Pentru orice întrebări legate de acești Termeni și Condiții, ne puteți contacta:
                </p>
                <ul>
                  <li><strong>Email:</strong> contact@nextlook.ro</li>
                  <li><strong>Telefon:</strong> +40 749 976 984</li>
                  <li><strong>Adresă:</strong> Brașov, Str. Carpaților nr. 6, Bl. E28, Ap. 27</li>
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

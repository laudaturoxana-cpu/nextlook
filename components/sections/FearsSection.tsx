'use client'

import { motion } from 'framer-motion'

const fears = [
  {
    icon: '😟',
    fear: 'Mi-e teamă că nu va arăta bine pe mine',
    solution: 'Ghid detaliat de mărimi cu măsurători exacte. Poze reale de la clienți. Retur gratuit dacă nu îți vine - fără întrebări, fără costuri.',
  },
  {
    icon: '🚫',
    fear: 'Am mai fost păcălită cu produse fake',
    solution: '100% produse originale, verificate. Etichetă autentică, factură, certificat de garanție. Colaborăm doar cu furnizori autorizați.',
  },
  {
    icon: '⏰',
    fear: 'Nu am timp să caut prin mii de produse',
    solution: 'Colecții curate, selecție atentă. Doar produse care merită - fără junk. Filtre simple: mărime, culoare, preț. Gata.',
  },
  {
    icon: '🤷‍♀️',
    fear: 'Nu știu cum să combin hainele',
    solution: 'Fiecare produs vine cu sugestii de styling. Vezi look-uri complete gata făcute. Inspirație instant, zero bătăi de cap.',
  },
]

export default function FearsSection() {
  return (
    <section id="de-ce-noi" className="py-20 lg:py-32 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-title mb-4">
            ȘTIM EXACT CE TE ÎNGRIJOREAZĂ
          </h2>
          <p className="section-subtitle">
            De aia am făcut totul să fie simplu, sigur și fără riscuri.
          </p>
        </motion.div>

        {/* Fears Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {fears.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card card-hover group"
            >
              <div className="flex items-start gap-4">
                <span className="text-4xl flex-shrink-0">{item.icon}</span>
                <div>
                  <p className="font-body font-medium text-text mb-3 group-hover:text-gold transition-colors">
                    "{item.fear}"
                  </p>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {item.solution}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Validation Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="italic text-text-secondary max-w-2xl mx-auto">
            E normal să ai dubii când cumperi online.
            <br />
            De aia te ajutăm în fiecare pas. Fără stres, fără riscuri.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

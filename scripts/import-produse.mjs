// Script import produse din CSV în Supabase
// Rulare: node scripts/import-produse.mjs scripts/produse-completat.csv

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { parse } from 'csv-parse/sync'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mtejhqvpgiftmhcpadop.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Map nume categorie -> ID
const CATEGORII = {
  'Adidași bărbați': '015d3157-b3b9-4833-b464-a8a7b962ca01',
  'Adidași femei':   '9aca9992-f2b4-4714-a07d-56ec0db4c9b4',
  'Copii':           '045973bf-da89-4f1d-8b17-a0c851c38c96',
  'Pantofi femei':   '2eaf7bc7-a478-4619-aa9d-9db7e703d4f1',
  'Accesorii':       'af58b345-442c-4c7f-9589-eedb97cedacc',
  'Ghete copii':     'c644a742-1f0f-4727-a5b0-f5c031fa7054',
  'Botine copii':    '3d869268-bda4-4eeb-b31d-c79c72aee307',
  'Adidași copii':   'cbf6f86e-f85e-4c84-b461-161f495f6b1b',
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/ă/g, 'a').replace(/â/g, 'a').replace(/î/g, 'i')
    .replace(/ș/g, 's').replace(/ț/g, 't')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

async function main() {
  const filePath = process.argv[2]
  if (!filePath) {
    console.error('❌ Specifică fișierul CSV: node scripts/import-produse.mjs scripts/produse-completat.csv')
    process.exit(1)
  }

  const csvContent = readFileSync(filePath, 'utf-8')
  const rows = parse(csvContent, { columns: true, skip_empty_lines: true, trim: true })

  console.log(`📦 Se importă ${rows.length} produse...\n`)

  let ok = 0, errors = 0

  for (const row of rows) {
    const categoryId = CATEGORII[row.categorie]
    if (!categoryId) {
      console.error(`❌ Categorie necunoscută: "${row.categorie}" (produs: ${row.nume})`)
      console.error(`   Categorii valide: ${Object.keys(CATEGORII).join(', ')}`)
      errors++
      continue
    }

    const product = {
      name: row.nume,
      slug: slugify(row.nume),
      description: row.descriere || '',
      price: parseFloat(row.pret),
      original_price: row.pret_original ? parseFloat(row.pret_original) : parseFloat(row.pret),
      category_id: categoryId,
      brand: row.brand || null,
      stock_quantity: parseInt(row.stoc || '0'),
      sizes: row.marimi ? row.marimi.split(',').map(s => s.trim()) : [],
      colors: row.culori ? row.culori.split(',').map(c => c.trim()) : [],
      images: row.imagini ? row.imagini.split(',').map(i => i.trim()).filter(Boolean) : [],
      is_featured: row.featured === 'true',
      is_new: row.nou === 'true',
      is_on_sale: row.reducere === 'true',
    }

    const { error } = await supabase.from('products').upsert(product, { onConflict: 'slug' })

    if (error) {
      console.error(`❌ Eroare la "${row.nume}":`, error.message)
      errors++
    } else {
      console.log(`✅ ${row.nume}`)
      ok++
    }
  }

  console.log(`\n📊 Rezultat: ${ok} importate cu succes, ${errors} erori`)
}

main()

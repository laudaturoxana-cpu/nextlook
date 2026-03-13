import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mtejhqvpgiftmhcpadop.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const BUCKET = 'product-images'

const CAT_ADIDASI_FEMEI  = '9aca9992-f2b4-4714-a07d-56ec0db4c9b4'
const CAT_ADIDASI_BARBATI = '015d3157-b3b9-4833-b464-a8a7b962ca01'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function uploadImage(filePath) {
  if (!existsSync(filePath)) { console.log(`  ⚠ Negăsit: ${filePath}`); return null }
  const buffer = readFileSync(filePath)
  const fileName = filePath.split('/').pop().replace(/\s+/g, '-')
  const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}-${fileName}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, { contentType: 'image/jpeg', upsert: false })
  if (error) { console.log(`  ✗ ${error.message}`); return null }
  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path)
  console.log(`  ✓ ${fileName}`)
  return publicUrl
}

function slugify(text) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-')
}

const produse = [
  {
    folder: 'adidasi femei de marimea 41 Alpin pro',
    files: [
      'WhatsApp Image 2026-03-11 at 14.57.10.jpeg',
      'WhatsApp Image 2026-03-11 at 14.57.10 (1).jpeg',
      'WhatsApp Image 2026-03-11 at 14.57.10 (2).jpeg',
    ],
    name: 'Alpine Pro Adidași Femei Roz Pudrat',
    brand: 'Alpine Pro',
    price: 199,
    sizes: ['41'],
    colors: ['Roz pudrat|#f5e6df'],
    category_id: CAT_ADIDASI_FEMEI,
    description: `Adidași sport femei Alpine Pro din material textil respirabil, în nuanță delicată de roz pudrat. Design minimalist monocromatic, ușori și confortabili pentru activități zilnice.
• Upper din material textil mesh respirabil
• Design monocromatic roz pudrat
• Talpă ușoară cu amortizare
• Sistem de șireturi clasic
• Greutate redusă, confort maxim
• Potriviți pentru sport, plimbări, outfit casual`,
  },
  {
    folder: 'adidasi barbati de marimea 44 Alpin pro',
    files: [
      'WhatsApp Image 2026-03-11 at 14.58.08.jpeg',
      'WhatsApp Image 2026-03-11 at 14.58.08 (1).jpeg',
      'WhatsApp Image 2026-03-11 at 14.58.08 (2).jpeg',
      'WhatsApp Image 2026-03-11 at 14.58.08 (3).jpeg',
    ],
    name: 'Alpine Pro Adidași Bărbați Bleumarin Petrol',
    brand: 'Alpine Pro',
    price: 199,
    sizes: ['44'],
    colors: ['Bleumarin|#1a2b5e'],
    category_id: CAT_ADIDASI_BARBATI,
    description: `Adidași sport bărbați Alpine Pro cu upper din material textil în bleumarin cu inserții petrol și accente portocalii. Talpă albă cu amortizare pentru activități sportive și casual.
• Upper din material textil respirabil, bleumarin cu detalii petrol
• Accente portocalii pe șireturi și ureche
• Talpă albă ușoară cu amortizare
• Vârf întărit din material sintetic
• Sistem de șireturi cu blocare rapidă
• Potriviți pentru alergare ușoară, trekking urban, casual`,
  },
]

async function main() {
  console.log('🚀 Upload Alpin Pro...\n')

  for (const produs of produse) {
    console.log(`\n📦 ${produs.name} — ${produs.price} lei`)
    const images = []
    for (const file of produs.files) {
      const url = await uploadImage(join(ROOT, produs.folder, file))
      if (url) images.push(url)
    }
    if (images.length === 0) { console.log('  ⚠ Nicio imagine, sar produsul'); continue }

    const slug = slugify(produs.name)
    const { data, error } = await supabase.from('products').upsert({
      name: produs.name,
      slug,
      description: produs.description,
      price: produs.price,
      original_price: null,
      category_id: produs.category_id,
      brand: produs.brand,
      stock_quantity: 1,
      sizes: produs.sizes,
      colors: produs.colors,
      images,
      is_featured: false,
      is_new: true,
      is_on_sale: false,
    }, { onConflict: 'slug' }).select().single()

    if (error) console.log(`  ✗ ${error.message}`)
    else console.log(`  ✓ Creat: ${data.name} (slug: ${data.slug})`)
  }

  console.log('\n✅ Gata!')
}

main().catch(console.error)

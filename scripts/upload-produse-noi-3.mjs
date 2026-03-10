import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mtejhqvpgiftmhcpadop.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const BUCKET = 'product-images'
const CAT_PANTOFI_FEMEI = '2eaf7bc7-a478-4619-aa9d-9db7e703d4f1'

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

// ─── 1. Upload produse noi ───────────────────────────────────────────────────

const produseNoi = [
  {
    folder: 'pantofi cu toc femei,  Mărimea 37',
    files: [
      'WhatsApp Image 2026-03-06 at 13.41.24.jpeg',
      'WhatsApp Image 2026-03-06 at 13.41.24 (1).jpeg',
      'WhatsApp Image 2026-03-06 at 13.41.24 (2).jpeg',
    ],
    name: 'Pantofi Gri T-Strap cu Toc Absal',
    price: 58,
    stock: 1,
    sizes: ['37'],
    colors: ['Gri|#6b7280'],
    description: `Pantofi eleganți din velur gri cu baretă T-strap și cataramă, toc mediu, brand Absal. Design rafinat și feminin, potriviți pentru birou sau ocazii speciale.
• Brand Absal, calitate superioară
• Material velur fin, gri slate
• Baretă T-strap cu cataramă neagră
• Toc mediu stabil
• Vârf ascuțit, siluetă elegantă
• Căptușeală interioară moale`,
  },
  {
    folder: 'pantofi cu toc femeie Mărimea 37, gri',
    files: [
      'WhatsApp Image 2026-03-06 at 10.09.31.jpeg',
      'WhatsApp Image 2026-03-06 at 10.09.31 (1).jpeg',
      'WhatsApp Image 2026-03-06 at 10.09.31 (2).jpeg',
    ],
    name: 'Pantofi Gri Kitten Heel Velur Vârf Ascuțit',
    price: 58,
    stock: 1,
    sizes: ['37'],
    colors: ['Gri|#6b7280'],
    description: `Pantofi clasici din velur gri cu toc kitten heel și vârf ascuțit. Design minimalist și elegant, versatili cu orice ținută de zi sau seară.
• Material velur moale, gri antracit
• Toc kitten heel mic și confortabil
• Vârf ascuțit, linie elegantă
• Design simplu, ușor de combinat
• Potriviți pentru birou, ieșiri, ocazii
• Produs nou, cu etichetă`,
  },
]

// ─── 2. Corectare stoc produse deja uploadate ────────────────────────────────

// Format: { slug, stock_quantity, sizes }
// Din numele dosarelor: "N x marime" = N perechi la acea marime
const corectariStoc = [
  {
    slug: 'botine-negre-cu-toc-stiletto-si-decupaje',
    // "2 x 40" → 2 perechi
    stock_quantity: 2,
    sizes: ['40'],
  },
  {
    slug: 'pantofi-oxford-maro-velur-cu-perforatii',
    // "Marimea 37" → 1 pereche
    stock_quantity: 1,
    sizes: ['37'],
  },
  {
    slug: 'botine-brocart-bleumarin-cu-toc-bloc-si-barete',
    // "2x36, 2x37, 3x38, 5x39, 1x40" → total 13
    stock_quantity: 13,
    sizes: ['36', '37', '38', '39', '40'],
  },
  {
    slug: 'botine-mov-velur-cu-barete-si-catarame-aurii',
    // "marimea 36, 37" → 1+1 = 2
    stock_quantity: 2,
    sizes: ['36', '37'],
  },
  // Lot 1
  {
    slug: 'ghete-negre-cu-franjuri-femei',
    // "Marimea 39, 40" → 1+1 = 2
    stock_quantity: 2,
    sizes: ['39', '40'],
  },
  {
    slug: 'adidasi-inalti-negri-cu-stele-estrada-senior',
    stock_quantity: 1,
    sizes: ['37'],
  },
  {
    slug: 'pantofi-brocart-negru-cu-toc-bloc-si-barete',
    stock_quantity: 3,
    sizes: ['37', '38', '39'],
  },
  {
    slug: 'pantofi-stiletto-gri-suede-absal',
    stock_quantity: 1,
    sizes: ['37'],
  },
  {
    slug: 'pantofi-nude-cu-tinte-aurii-vesya-vera-pelle',
    stock_quantity: 1,
    sizes: ['38'],
  },
  {
    slug: 'pantofi-rosii-velur-cu-platforma-si-funda',
    stock_quantity: 1,
    sizes: ['35'],
  },
]

async function main() {
  // Upload produse noi
  console.log('🚀 Upload produse noi (lot 3)...\n')
  for (const produs of produseNoi) {
    console.log(`\n📦 ${produs.name} — ${produs.price} lei`)
    const images = []
    for (const file of produs.files) {
      const url = await uploadImage(join(ROOT, produs.folder, file))
      if (url) images.push(url)
    }
    if (images.length === 0) { console.log('  ⚠ Nicio imagine, sar produsul'); continue }

    const { data, error } = await supabase.from('products').upsert({
      name: produs.name,
      slug: slugify(produs.name),
      description: produs.description,
      price: produs.price,
      original_price: null,
      category_id: CAT_PANTOFI_FEMEI,
      brand: null,
      stock_quantity: produs.stock,
      sizes: produs.sizes,
      colors: produs.colors,
      images,
      is_featured: false,
      is_new: true,
      is_on_sale: false,
    }, { onConflict: 'slug' }).select().single()

    if (error) console.log(`  ✗ ${error.message}`)
    else console.log(`  ✓ Creat: ${data.name}`)
  }

  // Corectare stoc
  console.log('\n\n📊 Corectare stoc produse existente...\n')
  for (const item of corectariStoc) {
    const { data, error } = await supabase.from('products')
      .update({ stock_quantity: item.stock_quantity, sizes: item.sizes })
      .eq('slug', item.slug)
      .select('name, stock_quantity, sizes')
      .single()

    if (error) console.log(`  ✗ ${item.slug}: ${error.message}`)
    else console.log(`  ✓ ${data.name} → stoc ${data.stock_quantity} | mărimi: ${data.sizes.join(', ')}`)
  }

  console.log('\n✅ Gata!')
}

main().catch(console.error)

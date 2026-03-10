// Script upload 6 produse noi
// Rulare: SUPABASE_SERVICE_ROLE_KEY=... node scripts/upload-produse-noi.mjs

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mtejhqvpgiftmhcpadop.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const BUCKET = 'product-images'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Category IDs
const CAT_PANTOFI_FEMEI = '2eaf7bc7-a478-4619-aa9d-9db7e703d4f1'
const CAT_ADIDASI_FEMEI = '9aca9992-f2b4-4714-a07d-56ec0db4c9b4'

async function uploadImage(filePath) {
  if (!existsSync(filePath)) {
    console.log(`  ⚠ Fișier negăsit: ${filePath}`)
    return null
  }
  const buffer = readFileSync(filePath)
  const fileName = filePath.split('/').pop().replace(/\s+/g, '-')
  const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}-${fileName}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: 'image/jpeg',
    upsert: false,
  })
  if (error) { console.log(`  ✗ Upload eșuat: ${error.message}`); return null }

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path)
  console.log(`  ✓ ${fileName}`)
  return publicUrl
}

function slugify(text) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-')
}

async function createProduct(product) {
  const { data, error } = await supabase.from('products').upsert(product, { onConflict: 'slug' }).select().single()
  if (error) console.log(`  ✗ Produs eșuat: ${error.message}`)
  else console.log(`  ✓ Produs creat: ${product.name}`)
  return data
}

async function main() {
  console.log('🚀 Upload produse noi...\n')

  const produse = [
    {
      folder: 'Ghete femei Mărimea 39,40',
      files: [
        'WhatsApp Image 2026-03-03 at 15.48.25 (1).jpeg',
        'WhatsApp Image 2026-03-03 at 15.48.25.jpeg',
        'WhatsApp Image 2026-03-03 at 15.48.26.jpeg',
      ],
      name: 'Ghete Negre cu Franjuri Femei',
      brand: null,
      category_id: CAT_PANTOFI_FEMEI,
      sizes: ['39', '40'],
      colors: ['Negru|#1a1a1a'],
      description: `Ghete elegante negre cu detaliu franjuri, perfecte pentru un look sofisticat. Toc bloc stabil și confortabil, ideale atât pentru birou cât și pentru ieșiri.
• Material exterior din piele ecologică texturată
• Detaliu franjuri decorativ la vârf
• Toc bloc înalt pentru stabilitate și eleganță
• Căptușeală moale pentru confort prelungit
• Vârf rotunjit, design clasic
• Potrivite pentru sezonul toamnă-iarnă`,
    },
    {
      folder: 'adidasi femei Mărimea 37',
      files: [
        'WhatsApp Image 2026-03-03 at 15.54.32.jpeg',
        'WhatsApp Image 2026-03-03 at 15.54.33.jpeg',
      ],
      name: 'Adidași Înalți Negri cu Stele Estrada Senior',
      brand: 'Estrada Senior',
      category_id: CAT_ADIDASI_FEMEI,
      sizes: ['37'],
      colors: ['Negru|#1a1a1a'],
      description: `Adidași înalți negri cu design glamour, ornamentați cu stele aplicate și detalii glitter pe lateral. Modelul Estrada Senior combină stilul street cu eleganța modernă.
• Brand Estrada Senior, calitate premium
• Design high-top cu șireturi negre
• Stele aplicate cu detalii sclipitoare
• Bandă laterală cu glitter pentru efect wow
• Talpă groasă pentru confort și înălțime
• Produs nou, cu etichetă originală`,
    },
    {
      folder: 'pantofi femeie Mărimea 37,38,39',
      files: [
        'WhatsApp Image 2026-03-03 at 15.55.21 (1).jpeg',
        'WhatsApp Image 2026-03-03 at 15.55.21.jpeg',
      ],
      name: 'Pantofi Brocart Negru cu Toc Bloc și Barete',
      brand: null,
      category_id: CAT_PANTOFI_FEMEI,
      sizes: ['37', '38', '39'],
      colors: ['Negru|#1a1a1a'],
      description: `Pantofi eleganți din material brocart negru cu model floral discret, cu toc bloc și sistem de barete ajustabile. Perfecți pentru ocazii speciale, evenimente sau seară în oraș.
• Material brocart de calitate cu model floral
• Toc bloc înalt, stabil și confortabil
• Barete cu catarame metalice ajustabile
• Vârf decupat, design feminin și rafinat
• Căptușeală interioară moale
• Ideali pentru evenimente, petreceri, gale`,
    },
    {
      folder: 'pantofi gri marimea 37',
      files: [
        'WhatsApp Image 2026-03-03 at 16.01.18.jpeg',
      ],
      name: 'Pantofi Stiletto Gri Suede Absal',
      brand: 'Absal',
      category_id: CAT_PANTOFI_FEMEI,
      sizes: ['37'],
      colors: ['Gri|#6b7280'],
      description: `Pantofi stiletto clasici din velur gri antracit, brand Absal. Design minimalist cu vârf ascuțit, eleganță pură pentru femeia modernă. Potriviți cu orice ținută de birou sau ocazie specială.
• Brand Absal, pantofi de calitate superioară
• Material velur fin, gri antracit
• Vârf ascuțit, siluetă alungită
• Toc stiletto subțire și înalt
• Căptușeală din piele naturală
• Design atemporal, potrivit oricărei ținute`,
    },
    {
      folder: 'pantofi maro Mărimea 38',
      files: [
        'WhatsApp Image 2026-03-03 at 16.00.45.jpeg',
      ],
      name: 'Pantofi Nude cu Ținte Aurii Vesya Vera Pelle',
      brand: 'Vesya',
      category_id: CAT_PANTOFI_FEMEI,
      sizes: ['38'],
      colors: ['Nude|#c4a882', 'Alb|#f5f0eb'],
      description: `Pantofi eleganți din piele naturală (Vera Pelle) în nuanță nude cu vârf decorat cu ținte aurii, brand italian Vesya. Combinație perfectă între rafinament și modernitate.
• Brand italian Vesya, piele naturală Vera Pelle
• Nuanță nude cu detalii bicolor alb la vârf
• Ornamente cu ținte piramidale aurii
• Toc kitten, confortabil și elegant
• Vârf ascuțit, design italian de lux
• Interior din piele naturală pentru confort maxim`,
    },
    {
      folder: 'pantofi rosii femei marimea 35',
      files: [
        'WhatsApp Image 2026-03-03 at 15.56.18 (1).jpeg',
        'WhatsApp Image 2026-03-03 at 15.56.18 (2).jpeg',
        'WhatsApp Image 2026-03-03 at 15.56.18.jpeg',
      ],
      name: 'Pantofi Roșii Velur cu Platformă și Fundă',
      brand: null,
      category_id: CAT_PANTOFI_FEMEI,
      sizes: ['35'],
      colors: ['Roșu|#dc2626'],
      description: `Pantofi spectaculoși din velur roșu aprins cu platformă și toc înalt, ornamentați cu o fundă elegantă la spate cu detalii perlate. Perfecți pentru a fi în centrul atenției.
• Material velur fin, roșu intens
• Platformă față pentru confort la toc înalt
• Toc bloc înalt, stabil
• Ornament fundă cu perle la călcâi
• Vârf rotunjit, design feminin
• Ideali pentru petreceri, nunți, ocazii speciale`,
    },
  ]

  for (const produs of produse) {
    console.log(`\n📦 ${produs.name}`)
    const images = []

    for (const file of produs.files) {
      const filePath = join(ROOT, produs.folder, file)
      const url = await uploadImage(filePath)
      if (url) images.push(url)
    }

    if (images.length === 0) {
      console.log('  ⚠ Nicio imagine uploadată, sar produsul')
      continue
    }

    const slug = slugify(produs.name)
    await createProduct({
      name: produs.name,
      slug,
      description: produs.description,
      price: 199,
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
    })
  }

  console.log('\n✅ Gata!')
}

main().catch(console.error)

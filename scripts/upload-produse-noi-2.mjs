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

const produse = [
  {
    folder: 'Botine negre cu toc femei, Mărimea 2 x 40',
    files: [
      'WhatsApp Image 2026-03-06 at 09.51.57.jpeg',
      'WhatsApp Image 2026-03-06 at 09.51.58 (1).jpeg',
      'WhatsApp Image 2026-03-06 at 09.51.58.jpeg',
    ],
    name: 'Botine Negre cu Toc Stiletto și Decupaje',
    price: 58,
    sizes: ['40'],
    colors: ['Negru|#1a1a1a'],
    description: `Botine negre elegante din piele ecologică fină, cu toc stiletto înalt și detalii decupate moderne. Design sofisticat, perfect pentru seara sau ocazii speciale.
• Material exterior din piele ecologică moale
• Toc stiletto înalt și subțire
• Decupaje decorative pe lateral
• Vârf ascuțit, siluetă alungită
• Fermoar lateral pentru îmbrăcare ușoară
• Potrivite pentru ocazii speciale, seară în oraș`,
  },
  {
    folder: 'Pantofi Femei Maro, Marimea 37, pret 55',
    files: [
      'WhatsApp Image 2026-03-03 at 16.45.48 (1).jpeg',
    ],
    name: 'Pantofi Oxford Maro Velur cu Perforații',
    price: 55,
    sizes: ['37'],
    colors: ['Maro|#7c5c3a'],
    description: `Pantofi oxford din velur maro cu design brogue și perforații decorative. Model unisex cu șireturi, potrivit atât pentru ținute casual cât și smart-casual.
• Material velur fin, maro închis
• Design oxford cu șireturi clasice
• Perforații decorative brogue pe borduri
• Talpă joasă din cauciuc, confortabilă
• Vârf rotunjit, stil vintage-modern
• Potriviți cu jeans, pantaloni sau rochii casual`,
  },
  {
    folder: 'botine gri cu toc femei, Mărimea 2 x 36, 2 x 37, 3 x 38, 5 x 39, 1 x 40',
    files: [
      'WhatsApp Image 2026-03-06 at 10.30.58.jpeg',
      'WhatsApp Image 2026-03-06 at 10.30.58 (1).jpeg',
      'WhatsApp Image 2026-03-06 at 10.30.58 (2).jpeg',
    ],
    name: 'Botine Brocart Bleumarin cu Toc Bloc și Barete',
    price: 58,
    sizes: ['36', '37', '38', '39', '40'],
    colors: ['Bleumarin|#1e2d5e'],
    description: `Botine sofisticate din material brocart bleumarin cu model floral argintiu, toc bloc stabil și sistem de barete ajustabile. Eleganță maximă pentru orice ocazie specială.
• Material brocart de calitate cu model floral argintiu
• Toc bloc înalt și stabil
• Trei barete ajustabile cu catarame metalice
• Vârf rotunjit, design feminin
• Fermoar lateral discret
• Perfecte pentru evenimente, petreceri, gale`,
  },
  {
    folder: 'botine mov femei, marimea 36, 37',
    files: [
      'WhatsApp Image 2026-03-06 at 13.59.25.jpeg',
      'WhatsApp Image 2026-03-06 at 13.59.25 (1).jpeg',
    ],
    name: 'Botine Mov Velur cu Barete și Catarame Aurii',
    price: 58,
    sizes: ['36', '37'],
    colors: ['Mov|#7b2d8b'],
    description: `Botine trendy din velur mov prună cu patru barete și catarame aurii, toc bloc înalt. Un model bold și feminin care atrage toate privirile.
• Material velur fin, mov prună intens
• Patru barete late cu catarame aurii
• Toc bloc înalt pentru stabilitate
• Platformă ușoară față
• Design open-toe lateral
• Perfecte pentru un look statement`,
  },
]

async function main() {
  console.log('🚀 Upload produse noi (lot 2)...\n')

  for (const produs of produse) {
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
      stock_quantity: produs.sizes.length,
      sizes: produs.sizes,
      colors: produs.colors,
      images,
      is_featured: false,
      is_new: true,
      is_on_sale: false,
    }, { onConflict: 'slug' }).select().single()

    if (error) console.log(`  ✗ ${error.message}`)
    else console.log(`  ✓ Produs creat: ${data.name}`)
  }

  console.log('\n✅ Gata!')
}

main().catch(console.error)

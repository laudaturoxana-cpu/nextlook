import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mtejhqvpgiftmhcpadop.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const { data, error } = await supabase
  .from('products')
  .select('id, name, slug, images, price, category_id')
  .order('slug')

if (error) { console.log('Eroare:', error.message); process.exit(1) }

console.log('Total produse în DB: ' + data.length + '\n')

// Check duplicate slugs
const slugMap = {}
for (const p of data) {
  if (!slugMap[p.slug]) slugMap[p.slug] = []
  slugMap[p.slug].push(p)
}

const duplicates = Object.entries(slugMap).filter(([, prods]) => prods.length > 1)

if (duplicates.length > 0) {
  console.log('=== SLUGURI DUPLICATE (' + duplicates.length + ') ===')
  for (const [slug, prods] of duplicates) {
    console.log('\nSLUG: ' + slug + ' → ' + prods.length + ' produse pe același link!')
    for (const p of prods) {
      console.log('  ID: ' + p.id)
      console.log('  Nume: ' + p.name)
      console.log('  Imagini: ' + (p.images?.length || 0))
      console.log('  Preț: ' + p.price + ' lei')
    }
  }
} else {
  console.log('✓ Niciun slug duplicat.\n')
}

// Check products with multiple images that might be actually different products
console.log('\n=== TOATE PRODUSELE (slug | nume | nr imagini | preț) ===')
for (const p of data) {
  const marker = (p.images?.length || 0) > 5 ? ' ⚠ MULTE IMAGINI' : ''
  console.log(p.slug.padEnd(55) + ' | ' + String(p.images?.length || 0).padStart(2) + ' img | ' + p.price + ' lei | ' + p.name + marker)
}

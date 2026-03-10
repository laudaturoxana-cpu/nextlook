import { createClient } from '@supabase/supabase-js'
import { writeFileSync } from 'fs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mtejhqvpgiftmhcpadop.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const { data } = await supabase
  .from('products')
  .select('id, name, slug, images')
  .order('slug')

// Only products with 8+ images (suspicious)
const suspicious = data.filter(p => (p.images?.length || 0) >= 8)

let output = ''
for (const p of suspicious) {
  output += `\n=== ${p.name} (${p.images.length} imagini) ===\n`
  output += `ID: ${p.id}\n`
  p.images.forEach((url, i) => output += `${i}: ${url}\n`)
}

writeFileSync('/tmp/product-images.txt', output)
console.log('Salvat în /tmp/product-images.txt')
console.log('Produse suspecte: ' + suspicious.length)
suspicious.forEach(p => console.log(`  ${p.images.length.toString().padStart(3)} img | ${p.name}`))

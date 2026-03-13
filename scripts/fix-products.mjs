import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://mtejhqvpgiftmhcpadop.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY lipsă!')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function run() {
  console.log('🔧 Fix produse — texte + imagini cu cutii\n')
  let ok = 0, fail = 0

  // ─── 1. "pantofi-elegani" → fix nume, slug, descriere ───────────────────────
  {
    const { error } = await supabase.from('products').update({
      name: 'Pantofi Eleganți Bordo Velur cu Barete',
      slug: 'pantofi-eleganti-bordo-velur-cu-barete',
      description: `Pantofi eleganți din velur fin în nuanță caldă de bordo, cu barete subțiri și toc bloc. Potriviți pentru ocazii speciale, ieșiri la restaurant sau ținute office cu personalitate.
• Material: velur sintetic moale la atingere
• Culoare: bordo intens
• Barete fine cu cataramă reglabilă
• Toc bloc stabil, înălțime medie
• Vârf rotunjit, confort pe toată ziua
• Potriviți pentru ocazii, seară, office`,
    }).eq('slug', 'pantofi-elegani')

    if (error) { console.log(`✗ pantofi-elegani: ${error.message}`); fail++ }
    else { console.log('✓ Pantofi Eleganți Bordo — slug și text corectate'); ok++ }
  }

  // ─── 2. "adidasi" → fix nume, slug, descriere ───────────────────────────────
  {
    const { error } = await supabase.from('products').update({
      name: 'Alpine Pro Adidași Femei Bleumarin cu Șireturi Roz',
      slug: 'alpine-pro-adidasi-femei-bleumarin-mov',
      description: `Adidași sport femei Alpine Pro în bleumarin-mov cu șireturi roz distincte. Design modern și colorat, potrivit pentru activități sportive sau ținute casual cu un accent de culoare.
• Upper din material textil mesh respirabil
• Culoare bleumarin-mov cu detalii mov deschis
• Șireturi roz contrastante, aspect sportiv-jucăuș
• Talpă albă ușoară cu amortizare
• Detalii logo Alpine Pro
• Potriviți pentru sport, plimbări, outfit casual`,
    }).eq('slug', 'adidasi')

    if (error) { console.log(`✗ adidasi: ${error.message}`); fail++ }
    else { console.log('✓ Alpine Pro Femei Bleumarin Mov — slug și text corectate'); ok++ }
  }

  // ─── 3. Ghete negre cu franjuri — șterge poza cu cutia (index 1) ─────────────
  {
    const id = 'e759e6dc-f2e7-4598-ae86-eb4cfdc3eac1'
    const { data, error: fetchErr } = await supabase
      .from('products').select('images').eq('id', id).single()

    if (fetchErr) { console.log(`✗ ghete-negre fetch: ${fetchErr.message}`); fail++ }
    else {
      // Keep index 0 and 2, remove index 1 (cutia albă)
      const clean = [data.images[0], data.images[2]].filter(Boolean)
      const { error } = await supabase.from('products').update({ images: clean }).eq('id', id)
      if (error) { console.log(`✗ ghete-negre update: ${error.message}`); fail++ }
      else { console.log(`✓ Ghete negre franjuri — poză cutie eliminată (${data.images.length} → ${clean.length})`); ok++ }
    }
  }

  // ─── 4. Pantofi brocart negru — șterge poza cu cutia (index 1) ───────────────
  {
    const id = 'cb0007d6-a4d4-4ae4-af25-ff380027dd84'
    const { data, error: fetchErr } = await supabase
      .from('products').select('images').eq('id', id).single()

    if (fetchErr) { console.log(`✗ pantofi-brocart fetch: ${fetchErr.message}`); fail++ }
    else {
      // Keep only index 0 (index 1 = cutia albă)
      const clean = [data.images[0]].filter(Boolean)
      const { error } = await supabase.from('products').update({ images: clean }).eq('id', id)
      if (error) { console.log(`✗ pantofi-brocart update: ${error.message}`); fail++ }
      else { console.log(`✓ Pantofi brocart negru — poză cutie eliminată (${data.images.length} → ${clean.length})`); ok++ }
    }
  }

  // ─── 5. Pantofi roșii velur — șterge poza cu cutia (index 0) ─────────────────
  {
    const id = '6c79d708-510d-4757-a1ff-cbc3183de1fe'
    const { data, error: fetchErr } = await supabase
      .from('products').select('images').eq('id', id).single()

    if (fetchErr) { console.log(`✗ pantofi-rosii fetch: ${fetchErr.message}`); fail++ }
    else {
      // Keep index 1 and 2, remove index 0 (pantof pe cutie)
      const clean = [data.images[1], data.images[2]].filter(Boolean)
      const { error } = await supabase.from('products').update({ images: clean }).eq('id', id)
      if (error) { console.log(`✗ pantofi-rosii update: ${error.message}`); fail++ }
      else { console.log(`✓ Pantofi roșii velur — poză cutie eliminată (${data.images.length} → ${clean.length})`); ok++ }
    }
  }

  console.log(`\n✅ Gata! ${ok} actualizări reușite, ${fail} erori.`)
}

run().catch(console.error)

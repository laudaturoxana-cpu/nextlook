// Script: Fixează produsele cu imagini greșit grupate
// Rulare: SUPABASE_SERVICE_ROLE_KEY=... node scripts/fix-produse-grupate.mjs

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mtejhqvpgiftmhcpadop.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const BUCKET_BASE = `${SUPABASE_URL}/storage/v1/object/public/product-images/products`

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const CATEGORII = {
  'adidasi-femei':  '9aca9992-f2b4-4714-a07d-56ec0db4c9b4',
  'adidasi-barbati':'015d3157-b3b9-4833-b464-a8a7b962ca01',
  'pantofi-femei':  '2eaf7bc7-a478-4619-aa9d-9db7e703d4f1',
  'copii':          '045973bf-da89-4f1d-8b17-a0c851c38c96',
  'adidasi-copii':  'cbf6f86e-f85e-4c84-b461-161f495f6b1b',
  'ghete-copii':    'c644a742-1f0f-4727-a5b0-f5c031fa7054',
  'botine-copii':   '3d869268-bda4-4eeb-b31d-c79c72aee307',
}

function imgUrl(code) {
  return `${BUCKET_BASE}/IMG-20260110-WA${code}.jpg`
}

function imgs(...codes) {
  return codes.map(imgUrl)
}

function slugify(text) {
  return text.toLowerCase()
    .replace(/ă/g, 'a').replace(/â/g, 'a').replace(/î/g, 'i')
    .replace(/ș/g, 's').replace(/ț/g, 't')
    .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

// ─── STEP 1: ACTUALIZARE PRODUSE EXISTENTE ───────────────────────────────────
// Fiecare intrare conține slug + imaginile CORECTE (restul sunt eliminate)

const UPDATES = [
  {
    // HEAD negru (WA1178-1190) + HEAD albastru deschis (WA1230-1240)
    slug: 'head-outdoor-adidasi-femei-albastru-gri',
    images: imgs('1178','1180','1182','1184','1186','1188','1190',
                 '1230','1232','1234','1236','1238','1240'),
  },
  {
    // Nike Court Legacy roz pudrat - doar imaginile reale Nike
    slug: 'nike-court-legacy-femei-roz-pudrat',
    images: imgs('1300','1301','1306','1449'),
  },
  {
    // Salamander sandale turcoaz - fara SOREL, fara JW, fara Adidas Roguera
    slug: 'salamander-sandale-femei-turcoaz',
    images: imgs('1336','1344','1354','1358','1359','1367','1368'),
  },
  {
    // Jack Wolfskin Hiking Jacky W gri-roz - adauga si WA1374-1391
    slug: 'jack-wolfskin-adidasi-femei-gri-roz',
    images: imgs('1374','1379','1383','1387','1391','1395','1399','1405','1409'),
  },
  {
    // Adidas Tensaur coral - fara SOREL (WA1694) si fara LPB (WA1787-1798)
    slug: 'adidas-tensaur-femei-coral-roz',
    images: imgs('1738','1748','1754','1759','1763','1764','1767','1774','1778','1781'),
  },
  {
    // Lotto alb - doar primul produs Lotto (WA1539-1563), cel din WA1565+ e Adidas
    slug: 'lotto-adidasi-femei-alb',
    images: imgs('1539','1543','1545','1547','1549','1551','1553','1555',
                 '1557','1559','1561','1563'),
  },
  {
    // Jack Wolfskin Barbati - doar perechea neagra/albastra
    slug: 'jack-wolfskin-barbati-negru-albastru-trail',
    images: imgs('1814','1820','1822','1826','1831','1835'),
  },
  {
    // Jack Wolfskin Femei Negru-Roz - imaginile reale JW din range WA1858-1945
    slug: 'jack-wolfskin-femei-negru-roz-trail',
    images: imgs('1840','1843','1845','1855','1861','1866','1867','1868'),
  },
  {
    // Adidas Print Colorat - fara Junior League (WA2008+)
    slug: 'adidas-adidasi-print-colorat-femei',
    images: imgs('1978','1979','1980','1984','1985','1986',
                 '1990','1991','1992','1994','1998','1999','2000','2004','2005','2006'),
  },
  {
    // LOAP SEPPA - doar primele imagini (WA1057-1073), restul sunt Lotto separat
    slug: 'loap-seppa-slip-on-femei-negru',
    images: imgs('1057','1061','1065','1069','1073'),
  },
]

// ─── STEP 2: PRODUSE NOI DE CREAT ────────────────────────────────────────────

const NEW_PRODUCTS = [
  // ── DIN RANGE HEAD (WA1192-WA1292) ──────────────────────────────────────
  {
    name: 'NASA Space Beyond Adidași Bărbați Gri',
    categorie: 'adidasi-barbati',
    brand: 'NASA',
    price: 65,
    sizes: ['43'],
    colors: ['Gri|#9ca3af','Negru|#1a1a1a'],
    descriere: 'Adidași sport NASA Beyond the Rainbow pentru bărbați din material tricotat gri cu dungi contrastante și talpă neagră. Design sportiv modern.',
    codes: ['1192','1194','1196','1198','1200','1202'],
  },
  {
    name: 'Adidas Racer TR21 Femei Negru-Coral',
    categorie: 'adidasi-femei',
    brand: 'Adidas',
    price: 65,
    sizes: ['40'],
    colors: ['Negru|#1a1a1a','Coral|#f97316'],
    descriere: 'Adidași Adidas Racer TR21 pentru femei, negri cu accente coral/portocaliu. Talpă Cloudfoam pentru amortizare, material respirabil.',
    codes: ['1204','1206','1208','1210','1212','1214'],
  },
  {
    name: 'Alpine Pro BAHAR Adidași Femei Indigo',
    categorie: 'adidasi-femei',
    brand: 'Alpine Pro',
    price: 65,
    sizes: ['38'],
    colors: ['Indigo|#3730a3','Albastru|#1d4ed8'],
    descriere: 'Adidași Alpine Pro BAHAR Mood Indigo pentru femei. Materialul speckled bleumarin-turcoaz cu talpă albă voluminoasă și detalii portocalii.',
    codes: ['1216','1218','1220','1222','1224','1226','1228'],
  },
  {
    name: 'Adidas Advantage Negru Piele Femei',
    categorie: 'adidasi-femei',
    brand: 'Adidas',
    price: 65,
    sizes: ['38'],
    colors: ['Negru|#1a1a1a','Alb|#f5f5f5'],
    descriere: 'Adidași Adidas Advantage din piele ecologică neagră pentru femei. Design clasic de tenis cu logo Adidas pe lateral și talpă albă.',
    codes: ['1242','1244','1246'],
  },
  {
    name: 'Alpine Pro STRATOS Trail Gri-Roșu',
    categorie: 'adidasi-barbati',
    brand: 'Alpine Pro',
    price: 65,
    sizes: ['44'],
    colors: ['Gri|#6b7280','Roșu|#dc2626','Negru|#1a1a1a'],
    descriere: 'Adidași trail Alpine Pro STRATOS pentru bărbați, gri cu șireturi roșii și talpă robustă neagră. Perfect pentru drumeții pe teren variat.',
    codes: ['1248','1250','1252','1254'],
  },
  {
    name: 'Puma Shuffle Alb-Negru-Verde',
    categorie: 'adidasi-barbati',
    brand: 'Puma',
    price: 65,
    sizes: ['44'],
    colors: ['Alb|#f5f5f5','Negru|#1a1a1a','Verde|#16a34a'],
    descriere: 'Adidași Puma Shuffle din piele ecologică albă cu detalii negre și verde. Talpă SoftFoam+ pentru confort optim în purtare zilnică.',
    codes: ['1256','1258','1260','1262','1264'],
  },
  {
    name: 'Schutz Sandale Aurii Femei',
    categorie: 'pantofi-femei',
    brand: 'Schutz',
    price: 58,
    sizes: ['38'],
    colors: ['Auriu|#d4af37'],
    descriere: 'Sandale elegante Schutz pentru femei în culoarea aurie/champagne. Design rafinat cu bretele subțiri și cataramă metalică. Perfecte pentru ocazii speciale.',
    codes: ['1266','1268','1270','1272'],
  },
  {
    name: 'Nike Running Roz Femei',
    categorie: 'adidasi-femei',
    brand: 'Nike',
    price: 65,
    sizes: ['38'],
    colors: ['Roz|#f472b6','Alb|#f5f5f5'],
    descriere: 'Adidași de alergare Nike pentru femei din material tricotat roz. Ușori și respirabili cu talpă albă. Pe cutie roșie Nike.',
    codes: ['1274','1276','1278','1280','1282'],
  },
  {
    name: 'Vans Doheny Negru Total',
    categorie: 'adidasi-femei',
    brand: 'Vans',
    price: 65,
    sizes: ['36'],
    colors: ['Negru|#1a1a1a'],
    descriere: 'Adidași Vans Doheny All Black din pânză neagră cu talpă vulcanizată neagră. Design skateboarding iconic, casual și versatil.',
    codes: ['1284','1286','1288','1290','1292'],
  },

  // ── DIN RANGE NIKE/VARIOUS (WA1371, WA1451-1475) ────────────────────────
  {
    name: 'SOREL Ghete Suede Cream Femei',
    categorie: 'pantofi-femei',
    brand: 'SOREL',
    price: 65,
    sizes: ['38'],
    colors: ['Crem|#f5f0e8','Bej|#e8d5b7'],
    descriere: 'Ghete înalte SOREL din piele întoarsă (suede) crem cu talpă din cauciuc. Șireturi metalice, design urban-hiking premium.',
    codes: ['1371','1694'],
  },
  {
    name: 'Skechers Performance Roșu Femei',
    categorie: 'adidasi-femei',
    brand: 'Skechers',
    price: 65,
    sizes: ['38'],
    colors: ['Roșu|#dc2626','Alb|#f5f5f5'],
    descriere: 'Adidași Skechers Performance pentru femei în culoarea roșu-intens. Material tricotat ultra-respirabil, ușori și confortabili.',
    codes: ['1451'],
  },
  {
    name: 'Alpine Pro Femei Violet Knit',
    categorie: 'adidasi-femei',
    brand: 'Alpine Pro',
    price: 65,
    sizes: ['38'],
    colors: ['Violet|#7c3aed','Lavandă|#c4b5fd'],
    descriere: 'Adidași Alpine Pro pentru femei din material tricotat violet/lavandă cu talpă albă. Design modern și ușor.',
    codes: ['1455','1457','1459','1461','1463'],
  },
  {
    name: 'Adidas Vulcraid3r Floral Femei',
    categorie: 'adidasi-femei',
    brand: 'Adidas',
    price: 65,
    sizes: ['37'],
    colors: ['Multicolor|#f97316','Alb|#f5f5f5'],
    descriere: 'Adidași Adidas Vulcraid3r cu print floral/tropical colorat pe fond alb. Design îndrăzneț, talpă vulcanizată albă.',
    codes: ['1465','1467','1469','1471','1473','1475'],
  },

  // ── DIN RANGE ADIDAS TENSAUR (WA1787-1798) ──────────────────────────────
  {
    name: 'LPB Mocasini Negru Lac Femei',
    categorie: 'pantofi-femei',
    brand: 'LPB',
    price: 58,
    sizes: ['38'],
    colors: ['Negru|#1a1a1a'],
    descriere: 'Mocasini LPB Les Petites Bombes din piele lacuită neagră cu lanț metalic decorativ. Platformă chunky, vârf ascuțit, design statement.',
    codes: ['1787','1788','1796','1798'],
  },

  // ── DIN RANGE JW BĂRBAȚI (WA1836-1854) ──────────────────────────────────
  {
    name: 'Reebok Negru Holographic Femei',
    categorie: 'adidasi-femei',
    brand: 'Reebok',
    price: 65,
    sizes: ['37'],
    colors: ['Negru|#1a1a1a','Irizat|#818cf8'],
    descriere: 'Adidași Reebok din piele ecologică neagră cu detaliu holografic iridescent la călcâi. Design modern sport-casual.',
    codes: ['1836','1837'],
  },
  {
    name: 'Avena Sandale Alb Femei',
    categorie: 'pantofi-femei',
    brand: 'Avena',
    price: 58,
    sizes: ['38'],
    colors: ['Alb|#f5f5f5','Bej|#e8d5b7'],
    descriere: 'Sandale Avena pentru femei din piele albă cu multiple barete și perforații decorative. Talpă cu toc mic, confortabile pentru vară.',
    codes: ['1847','1850','1854'],
  },

  // ── DIN RANGE JW FEMEI (WA1858, WA1875+, WA1896+, WA1913+) ─────────────
  {
    name: 'Rieker Loaferi Roz Fuchsia Femei',
    categorie: 'pantofi-femei',
    brand: 'Rieker',
    price: 58,
    sizes: ['38'],
    colors: ['Roz|#ec4899','Fuchsia|#d946ef'],
    descriere: 'Mocasini/loaferi Rieker Antistress din piele fuchsia vibrantă. Tehnologie Antistress pentru confort maxim toată ziua.',
    codes: ['1858'],
  },
  {
    name: 'Junior League Trail Copii Gri-Roz',
    categorie: 'adidasi-copii',
    brand: 'Junior League',
    price: 55,
    sizes: ['32','33','34','35','36'],
    colors: ['Gri|#6b7280','Negru|#1a1a1a','Roz|#ec4899'],
    descriere: 'Adidași trail Junior League pentru copii, gri cu negru și accente roz. Velcro pentru încălțare ușoară, talpă robustă anti-alunecare.',
    codes: ['1875','1877','1878','1879','1881','1885','1887','1889','1891','1892'],
  },
  {
    name: 'Adidas Hoops Mid Copii Negru-Albastru',
    categorie: 'adidasi-copii',
    brand: 'Adidas',
    price: 55,
    sizes: ['22','23','24','25','26','27'],
    colors: ['Negru|#1a1a1a','Albastru|#1d4ed8','Galben|#facc15'],
    descriere: 'Ghete Adidas Hoops Mid pentru copii mici cu interior plușat albastru. Velcro simplu, călduroase și confortabile.',
    codes: ['1896','1897','1898','1904','1905'],
  },
  {
    name: 'Alpine Pro Ghete Iarnă Femei Negru',
    categorie: 'pantofi-femei',
    brand: 'Alpine Pro',
    price: 65,
    sizes: ['38'],
    colors: ['Negru|#1a1a1a','Gri|#6b7280'],
    descriere: 'Ghete de iarnă Alpine Pro pentru femei din material lânos gri-negru impermeabil. Catarame și velcro, talpă anti-alunecare cu grip excelent.',
    codes: ['1913','1917','1918','1921','1922','1924','1926',
            '1929','1930','1933','1934','1937','1938','1941','1942','1945'],
  },

  // ── DIN RANGE LOTTO (WA1565-1585) ───────────────────────────────────────
  {
    name: 'Adidas Court Alb Print Femei',
    categorie: 'adidasi-femei',
    brand: 'Adidas',
    price: 65,
    sizes: ['38'],
    colors: ['Alb|#f5f5f5','Negru|#1a1a1a'],
    descriere: 'Adidași Adidas din piele albă cu print text negru pentru femei. Design clasic court, talpă plată. Stil minimal și versatil.',
    codes: ['1565','1567','1569','1571','1573','1575','1577','1579','1581','1583','1585'],
  },

  // ── DIN RANGE ADIDAS PRINT (WA2008-2024) ────────────────────────────────
  {
    name: 'Junior League Trail Copii Negru-Roz',
    categorie: 'adidasi-copii',
    brand: 'Junior League',
    price: 55,
    sizes: ['33','34','35','36','37'],
    colors: ['Negru|#1a1a1a','Gri|#6b7280','Roz|#ec4899'],
    descriere: 'Adidași trail Junior League pentru copii cu velcro și șireturi roz. Talpă robustă cu grip, design sport.',
    codes: ['2008','2011','2012','2016','2023','2024'],
  },

  // ── LOAP SEPPA - imaginile Lotto care erau greșit în LOAP SEPPA ──────────
  {
    name: 'Lotto Slip-On Negru Femei',
    categorie: 'adidasi-femei',
    brand: 'Lotto',
    price: 65,
    sizes: ['38'],
    colors: ['Negru|#1a1a1a','Alb|#f5f5f5'],
    descriere: 'Adidași slip-on Lotto pentru femei din material tricotat negru cu talpă albă. Ușori, fără șireturi, confortabili pentru purtare zilnică.',
    codes: ['1601','1605','1609','1611','1616','1620','1624','1628'],
  },
]

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function run() {
  if (!SUPABASE_SERVICE_KEY) {
    console.error('❌ Lipsă SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  let ok = 0, err = 0

  console.log('🔧 STEP 1: Actualizez produse existente...\n')

  for (const upd of UPDATES) {
    const { error } = await supabase
      .from('products')
      .update({ images: upd.images })
      .eq('slug', upd.slug)

    if (error) {
      console.log(`  ❌ ${upd.slug}: ${error.message}`)
      err++
    } else {
      console.log(`  ✅ ${upd.slug} → ${upd.images.length} imagini`)
      ok++
    }
  }

  console.log(`\n✅ Actualizate: ${ok} | ❌ Erori: ${err}`)
  ok = 0; err = 0

  console.log('\n🆕 STEP 2: Creez produse noi...\n')

  for (const p of NEW_PRODUCTS) {
    const images = p.codes.map(imgUrl)
    const slug = slugify(p.name)
    const categoryId = CATEGORII[p.categorie]

    if (!categoryId) {
      console.log(`  ❌ Categorie inexistentă: ${p.categorie}`)
      err++
      continue
    }

    const product = {
      name: p.name,
      slug,
      description: p.descriere,
      price: p.price,
      original_price: null,
      category_id: categoryId,
      brand: p.brand,
      stock_quantity: 1,
      sizes: p.sizes,
      colors: p.colors,
      images,
      is_featured: false,
      is_new: true,
      is_on_sale: false,
    }

    const { error } = await supabase
      .from('products')
      .upsert(product, { onConflict: 'slug' })

    if (error) {
      console.log(`  ❌ ${p.name}: ${error.message}`)
      err++
    } else {
      console.log(`  ✅ ${p.name} (${images.length} img)`)
      ok++
    }
  }

  console.log(`\n✅ Create: ${ok} | ❌ Erori: ${err}`)
  console.log('\n🎉 Gata! Verifică produsele pe site.')
}

run().catch(console.error)

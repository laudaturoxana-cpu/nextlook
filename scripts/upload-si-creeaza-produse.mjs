// Script: Upload imagini în Supabase Storage + Creare produse
// Rulare: node scripts/upload-si-creeaza-produse.mjs
// Funcționează din directorul proiectului nextlook-ecommerce

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mtejhqvpgiftmhcpadop.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const IMAGES_DIR = join(ROOT, 'wetransfer_img-20260110-wa2060-jpg_2026-03-03_1349')
const BUCKET = 'product-images'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

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

// Produse identificate din fotografii
const PRODUSE = [
  // ── ADIDAȘI COPII ─────────────────────────────────────
  {
    name: 'Crossroad Adidași Copii Gri-Turcoaz',
    categorie: 'Adidași copii',
    brand: 'Crossroad',
    descriere: 'Adidași sport pentru copii marca Crossroad, cu velcro pentru încălțare ușoară. Ideali pentru activitățile în aer liber. Material respirabil, talpă robustă anti-alunecare.',
    marimi: ['23','24','25','26','27','28','29','30','31','32','33','34','35'],
    culori: ['Gri','Turcoaz'],
    imageCodes: ['WA0034','WA0038','WA0090','WA0096','WA0101','WA0113','WA0119','WA0127','WA0134','WA0139'],
    is_new: true, is_featured: false, is_on_sale: false, stoc: 30,
  },
  {
    name: 'Adidas Hoops Mid 2 Copii Gri-Roz',
    categorie: 'Adidași copii',
    brand: 'Adidas',
    descriere: 'Adidași înalți Adidas Hoops Mid 2 pentru copii mici, cu interior plușat și închidere velcro. Confort și stil garantat pentru cel mic.',
    marimi: ['19','20','21','22','23','24','25','26','27'],
    culori: ['Gri','Roz'],
    imageCodes: ['WA2040','WA2041','WA2045','WA2046','WA2049','WA2050','WA2052','WA2054','WA2055','WA2057','WA2059','WA2060'],
    is_new: false, is_featured: true, is_on_sale: false, stoc: 25,
  },
  // ── GHETE COPII ───────────────────────────────────────
  {
    name: 'Willard Ghete Iarnă Copii Bleumarin',
    categorie: 'Ghete copii',
    brand: 'Willard',
    descriere: 'Ghete de iarnă impermeabile pentru copii marca Willard. Material quiltat rezistent la apă, căptușeală caldă plușată, talpă antiderapantă.',
    marimi: ['25','26','27','28','29','30','31','32'],
    culori: ['Bleumarin','Negru'],
    imageCodes: ['WA0258','WA0260','WA0262','WA0264','WA0266','WA0268','WA0270','WA0272','WA0274','WA0276','WA0278'],
    is_new: true, is_featured: false, is_on_sale: false, stoc: 20,
  },
  {
    name: 'LOAP RACLIF Ghete Copii Camo Verde',
    categorie: 'Ghete copii',
    brand: 'LOAP',
    descriere: 'Ghete outdoor LOAP RACLIF pentru copii, design camo verde. Rezistente la apă, căptușeală caldă, velcro și șireturi pentru fix sigur.',
    marimi: ['23','24','25','26','27','28','29','30','31','32','33','34','35'],
    culori: ['Verde','Negru'],
    imageCodes: ['WA0327','WA0334','WA0339','WA0343','WA0347','WA0355','WA0358','WA0372','WA0375','WA0377','WA0379','WA0381','WA0383','WA0385','WA0387','WA0389','WA0391','WA0393','WA0395','WA0397','WA0399','WA0401','WA0403','WA0405','WA0407','WA0409','WA0411'],
    is_new: false, is_featured: false, is_on_sale: false, stoc: 20,
  },
  // ── ADIDAȘI FEMEI ─────────────────────────────────────
  {
    name: 'Crossroad Adidași Femei Gri-Turcoaz',
    categorie: 'Adidași femei',
    brand: 'Crossroad',
    descriere: 'Adidași sport pentru femei marca Crossroad, perfecti pentru activitățile outdoor și drumeții. Talpă robustă cu amortizare, design modern gri-turcoaz.',
    marimi: ['36','37','38','39','40','41'],
    culori: ['Gri','Turcoaz'],
    imageCodes: ['WA0029','IMG_1692','IMG_1693','IMG_1694','IMG_1695','IMG_1696','IMG_1697','IMG_1698','IMG_1699'],
    is_new: false, is_featured: true, is_on_sale: false, stoc: 20,
  },
  {
    name: 'Crossroad Adidași Femei Albastru-Gri',
    categorie: 'Adidași femei',
    brand: 'Crossroad',
    descriere: 'Adidași trail pentru femei Crossroad, cu impermeabilizare și suport excelent pentru drumeții. Design albastru-gri cu detalii contrastante.',
    marimi: ['36','37','38','39','40','41'],
    culori: ['Albastru','Gri'],
    imageCodes: ['IMG_1710','IMG_1711','IMG_1712','IMG_1713','IMG_1714','IMG_1715','IMG_1716','IMG_1717','IMG_1718'],
    is_new: false, is_featured: false, is_on_sale: false, stoc: 20,
  },
  {
    name: 'Alpine Pro BALLOT Adidași Femei Negru-Roz',
    categorie: 'Adidași femei',
    brand: 'Alpine Pro',
    descriere: 'Adidași sport Alpine Pro BALLOT pentru femei. Talpă albă cu amortizare superioară, design negru cu accente roz. Perfecti pentru activități sportive și outdoor.',
    marimi: ['36','37','38','39','40','41'],
    culori: ['Negru','Roz'],
    imageCodes: ['WA0174','WA0176','WA0178','WA0180','WA0182','WA0184','WA0186','WA0188'],
    is_new: false, is_featured: true, is_on_sale: false, stoc: 15,
  },
  {
    name: 'LOAP BIRTE Adidași Femei Alb-Burgundy',
    categorie: 'Adidași femei',
    brand: 'LOAP',
    descriere: 'Adidași casual LOAP BIRTE pentru femei, din material textil tricotat. Design alb-burgundy cu velcro și șireturi elastice. Confortabili pentru purtare zilnică.',
    marimi: ['35','36','37','38','39','40'],
    culori: ['Alb','Burgundy'],
    imageCodes: ['WA0196','WA0198','WA0200','WA0202','WA0204','WA0206','WA0208'],
    is_new: false, is_featured: false, is_on_sale: false, stoc: 15,
  },
  {
    name: 'Reebok Royal Adidași Femei Negru',
    categorie: 'Adidași femei',
    brand: 'Reebok',
    descriere: 'Adidași clasici Reebok Royal pentru femei, din piele ecologică neagră. Comfort Footbed OrthoLite pentru susținere toată ziua.',
    marimi: ['36','37','38','39','40','41'],
    culori: ['Negru'],
    imageCodes: ['WA0210','WA0212','WA0214','WA0216'],
    is_new: false, is_featured: false, is_on_sale: false, stoc: 15,
  },
  {
    name: 'Columbia HATANA MAX OUTDRY Femei',
    categorie: 'Adidași femei',
    brand: 'Columbia',
    descriere: 'Adidași impermeabili Columbia HATANA MAX OUTDRY pentru femei. Tehnologie OutDry pentru protecție totală la apă, talpă TECHLITE+ cu amortizare superioară.',
    marimi: ['36','37','38','39','40','41'],
    culori: ['Gri','Albastru','Turcoaz'],
    imageCodes: ['WA0218','WA0220','WA0222','WA0226','WA0228','WA0230'],
    is_new: false, is_featured: true, is_on_sale: false, stoc: 10,
  },
  {
    name: 'Bensimon Adidași Femei Canvas Galben',
    categorie: 'Adidași femei',
    brand: 'Bensimon',
    descriere: 'Adidași canvas Bensimon pentru femei în culoarea galben-viu. Stil francez clasic, ușori și confortabili pentru sezonul cald. Talpă vulcanizată albă.',
    marimi: ['35','36','37','38','39','40','41'],
    culori: ['Galben','Alb'],
    imageCodes: ['WA1040','WA1043','WA1052','WA1054','WA1055'],
    is_new: true, is_featured: false, is_on_sale: false, stoc: 10,
  },
  {
    name: 'LOAP SEPPA Slip-On Femei Negru',
    categorie: 'Adidași femei',
    brand: 'LOAP',
    descriere: 'Adidași slip-on LOAP SEPPA pentru femei, din material tricotat negru. Ușori, respirabili și confortabili, perfecti pentru purtare casual zilnică.',
    marimi: ['36','37','38','39','40','41'],
    culori: ['Negru','Alb'],
    imageCodes: ['WA1057','WA1061','WA1065','WA1069','WA1073','WA1601','WA1605','WA1609','WA1611','WA1616','WA1620','WA1624','WA1628'],
    is_new: false, is_featured: false, is_on_sale: false, stoc: 20,
  },
  {
    name: 'Merrell Adidași Femei Trail Albastru',
    categorie: 'Adidași femei',
    brand: 'Merrell',
    descriere: 'Adidași trail Merrell pentru femei. Comfort Footbed OrthoLite, construcție rezistentă, branț EcoLite. Perfecti pentru drumeții și activități outdoor.',
    marimi: ['36','37','38','39','40','41'],
    culori: ['Albastru','Gri'],
    imageCodes: ['WA1119','WA1124','WA1127','WA1130','WA1133','WA1135','WA1137','WA1140'],
    is_new: false, is_featured: false, is_on_sale: false, stoc: 10,
  },
  {
    name: 'Jack Wolfskin Adidași Femei Verde-Gri',
    categorie: 'Adidași femei',
    brand: 'Jack Wolfskin',
    descriere: 'Adidași outdoor Jack Wolfskin pentru femei, cu suport excelent și material respirabil. Design verde-gri cu detalii contrastante pentru activități în natură.',
    marimi: ['36','37','38','39','40','41'],
    culori: ['Verde','Gri'],
    imageCodes: ['WA1146','WA1150','WA1151','WA1154','WA1156','WA1159','WA1167','WA1171','WA1176'],
    is_new: false, is_featured: false, is_on_sale: false, stoc: 10,
  },
  {
    name: 'HEAD Outdoor Adidași Femei Albastru-Gri',
    categorie: 'Adidași femei',
    brand: 'HEAD',
    descriere: 'Adidași sport HEAD Outdoor pentru femei. Construcție ușoară cu material respirabil, talpă cu amortizare. Design sportiv în tonuri de albastru și gri.',
    marimi: ['36','37','38','39','40','41'],
    culori: ['Albastru','Gri'],
    imageCodes: ['WA1178','WA1180','WA1182','WA1184','WA1186','WA1188','WA1190','WA1192','WA1194','WA1196','WA1198','WA1200','WA1202','WA1204','WA1206','WA1208','WA1210','WA1212','WA1214','WA1216','WA1218','WA1220','WA1222','WA1224','WA1226','WA1228','WA1230','WA1232','WA1234','WA1236','WA1238','WA1240','WA1242','WA1244','WA1246','WA1248','WA1250','WA1252','WA1254','WA1256','WA1258','WA1260','WA1262','WA1264','WA1266','WA1268','WA1270','WA1272','WA1274','WA1276','WA1278','WA1280','WA1282','WA1284','WA1286','WA1288','WA1290','WA1292'],
    is_new: false, is_featured: false, is_on_sale: false, stoc: 15,
  },
  {
    name: 'Nike Court Legacy Femei Roz Pudrat',
    categorie: 'Adidași femei',
    brand: 'Nike',
    descriere: 'Adidași Nike Court Legacy pentru femei, din piele texturată roz pudrat. Design clasic de tenis cu talpă plată, ușori și eleganti.',
    marimi: ['35.5','36','37','37.5','38','38.5','39','40','40.5','41'],
    culori: ['Roz pudrat','Alb'],
    imageCodes: ['WA1300','WA1301','WA1306','WA1336','WA1344','WA1354','WA1358','WA1359','WA1363','WA1367','WA1368','WA1371','WA1374','WA1379','WA1383','WA1387','WA1391','WA1449','WA1451','WA1455','WA1457','WA1459','WA1461','WA1463','WA1465','WA1467','WA1469','WA1471','WA1473','WA1475'],
    is_new: false, is_featured: true, is_on_sale: false, stoc: 10,
  },
  {
    name: 'Jack Wolfskin Adidași Femei Gri-Roz',
    categorie: 'Adidași femei',
    brand: 'Jack Wolfskin',
    descriere: 'Adidași trail Jack Wolfskin pentru femei în tonuri de gri și roz. Material respirabil, talpă cu amortizare. Confortabili pentru drumeții și activități outdoor.',
    marimi: ['36','37','38','39','40','41'],
    culori: ['Gri','Roz'],
    imageCodes: ['WA1395','WA1399','WA1405','WA1409'],
    is_new: false, is_featured: false, is_on_sale: false, stoc: 10,
  },
  {
    name: 'LPB Botine Femei Piele Negru Croco',
    categorie: 'Pantofi femei',
    brand: 'LPB',
    descriere: 'Botine elegante LPB Les Petites Bombes pentru femei, din piele lacuită cu model croco negru. Fermoar lateral, inel metalic decorativ, toc mic stabil.',
    marimi: ['36','37','38','39','40','41'],
    culori: ['Negru'],
    imageCodes: ['WA1413','WA1417','WA1419','WA1421','WA1425','WA1429','WA1435','WA1439','WA1443','WA1447','WA1448'],
    is_new: false, is_featured: true, is_on_sale: false, stoc: 10,
  },
  {
    name: 'HEAD Outdoor Trail Bărbați Portocaliu',
    categorie: 'Adidași bărbați',
    brand: 'HEAD',
    descriere: 'Adidași trail HEAD Outdoor pentru bărbați în culoarea portocaliu-negru. Talpă robustă cu grip excelent pentru teren variat. Material respirabil și rezistent.',
    marimi: ['40','41','42','43','44','45','46'],
    culori: ['Portocaliu','Negru'],
    imageCodes: ['WA1491','WA1493','WA1495','WA1497','WA1499','WA1501','WA1503','WA1505','WA1507','WA1509','WA1511','WA1513','WA1515','WA1517','WA1519','WA1521','WA1523','WA1525','WA1527','WA1529','WA1531'],
    is_new: false, is_featured: false, is_on_sale: false, stoc: 15,
  },
  {
    name: 'Lotto Adidași Femei Alb',
    categorie: 'Adidași femei',
    brand: 'Lotto',
    descriere: 'Adidași casual Lotto pentru femei în culoarea albă. Design clasic retro cu talpa ușoară, confortabili pentru purtare zilnică.',
    marimi: ['36','37','38','39','40','41'],
    culori: ['Alb','Gri'],
    imageCodes: ['WA1539','WA1543','WA1545','WA1547','WA1549','WA1551','WA1553','WA1555','WA1557','WA1559','WA1561','WA1563','WA1565','WA1567','WA1569','WA1571','WA1573','WA1575','WA1577','WA1579','WA1581','WA1583','WA1585'],
    is_new: false, is_featured: false, is_on_sale: false, stoc: 15,
  },
  {
    name: 'Adidas Roguera Femei Alb',
    categorie: 'Adidași femei',
    brand: 'Adidas',
    descriere: 'Adidași Adidas Roguera pentru femei din piele ecologică albă. Design minimalist cu detalii discrete, perfecti pentru ținute casual sau sport.',
    marimi: ['36','37','38','39','40','41'],
    culori: ['Alb'],
    imageCodes: ['WA1633','WA1635','WA1638','WA1642','WA1645','WA1650','WA1657','WA1660','WA1662','WA1664','WA1666','WA1668','WA1670','WA1672','WA1674','WA1676','WA1678'],
    is_new: false, is_featured: false, is_on_sale: false, stoc: 15,
  },
  {
    name: 'Adidas Tensaur Femei Coral-Roz',
    categorie: 'Adidași femei',
    brand: 'Adidas',
    descriere: 'Adidași Adidas Tensaur pentru femei în culoarea coral-roz vibrant. Talpă ușoară Cloudfoam, material textil respirabil. Ideali pentru sport și activități zilnice.',
    marimi: ['36','37','38','39','40','41'],
    culori: ['Coral','Roz','Alb'],
    imageCodes: ['WA1694','WA1738','WA1748','WA1754','WA1759','WA1763','WA1764','WA1767','WA1774','WA1778','WA1781','WA1787','WA1788','WA1796','WA1798'],
    is_new: false, is_featured: false, is_on_sale: false, stoc: 15,
  },
  {
    name: 'Adidași Femei Coral Adidas',
    categorie: 'Adidași femei',
    brand: 'Adidas',
    descriere: 'Adidași de alergare Adidas pentru femei în culoarea coral-portocaliu. Talpă ușoară cu 3 dungi albe iconice. Perfecti pentru alergare și activități sportive.',
    marimi: ['36','37','38','39','40','41'],
    culori: ['Coral','Alb'],
    imageCodes: ['IMG_1740','IMG_1741','IMG_1742','IMG_1743','IMG_1744','IMG_1745','IMG_1746','IMG_1747','IMG_1748','IMG_1749','IMG_1750','IMG_1751','IMG_1752','IMG_1753','IMG_1754','IMG_1755','IMG_1756'],
    is_new: false, is_featured: false, is_on_sale: false, stoc: 10,
  },
  {
    name: 'Alpine Pro Adidași Femei Roz Camo',
    categorie: 'Adidași femei',
    brand: 'Alpine Pro',
    descriere: 'Adidași sport Alpine Pro pentru femei cu design roz-negru camo. Talpă cu amortizare maximă, sistem de șiret rapid. Design modern și îndrăzneț.',
    marimi: ['36','37','38','39','40','41'],
    culori: ['Roz','Negru'],
    imageCodes: ['IMG_1700','IMG_1701','IMG_1702','IMG_1703','IMG_1704','IMG_1705','IMG_1706','IMG_1707','IMG_1708','IMG_1709'],
    is_new: false, is_featured: false, is_on_sale: false, stoc: 10,
  },
  {
    name: 'Adidași Femei Roz Sport Knit',
    categorie: 'Adidași femei',
    brand: 'Sport',
    descriere: 'Adidași de alergare pentru femei din material tricotat roz moale. Talpă ușoară cu amortizare, ușori și respirabili. Design roz pudrat cu talpă albă.',
    marimi: ['36','37','38','39','40','41'],
    culori: ['Roz','Alb'],
    imageCodes: ['IMG_1719','IMG_1720','IMG_1721','IMG_1722','IMG_1723','IMG_1724','IMG_1725','IMG_1726','IMG_1727','IMG_1728','IMG_1729','IMG_1730','IMG_1731','IMG_1732','IMG_1733','IMG_1734','IMG_1735','IMG_1736','IMG_1737','IMG_1738','IMG_1739'],
    is_new: true, is_featured: false, is_on_sale: false, stoc: 20,
  },
  {
    name: 'Adidas COURTPOINT Femei Alb',
    categorie: 'Adidași femei',
    brand: 'Adidas',
    descriere: 'Adidași Adidas COURTPOINT pentru femei din piele ecologică albă cu detalii aurii. Design clasic de tenis, elegant și versatil pentru orice ocazie.',
    marimi: ['36','37','38','39','40','41'],
    culori: ['Alb','Auriu'],
    imageCodes: ['WA1803','WA1805','IMG_1763','IMG_1768','IMG_1769','IMG_1770','IMG_1771','IMG_1772','IMG_1773','IMG_1774','IMG_1775','IMG_1776','IMG_1777','IMG_1778','IMG_1779','IMG_1780','IMG_1781','IMG_1782','IMG_1783','IMG_1785'],
    is_new: false, is_featured: false, is_on_sale: false, stoc: 10,
  },
  // ── ADIDAȘI BĂRBAȚI ───────────────────────────────────
  {
    name: 'Adidas Advantage Negru Piele Bărbați',
    categorie: 'Adidași bărbați',
    brand: 'Adidas',
    descriere: 'Adidași Adidas din piele ecologică neagră pentru bărbați. Logo iconic Adidas pe călcâi, talpă ușoară cu amortizare. Confort urban maxim pentru purtare zilnică.',
    marimi: ['40','41','42','43','44','45','46'],
    culori: ['Negru','Alb'],
    imageCodes: ['WA1077','WA1082','WA1083','WA1088','WA1090','WA1094','WA1096','WA1097'],
    is_new: false, is_featured: true, is_on_sale: false, stoc: 15,
  },
  {
    name: 'Puma Karmen Alb Bărbați',
    categorie: 'Adidași bărbați',
    brand: 'Puma',
    descriere: 'Adidași Puma albi pentru bărbați cu talpă SoftFoam+ pentru confort optim. Design clasic și versatil, perfecti pentru ținute casual sau smart-casual.',
    marimi: ['40','41','42','43','44','45','46'],
    culori: ['Alb','Negru'],
    imageCodes: ['WA1101','WA1108','WA1109','WA1110','WA1114','WA1116'],
    is_new: false, is_featured: false, is_on_sale: false, stoc: 15,
  },
  {
    name: 'Jack Wolfskin Bărbați Negru-Albastru Trail',
    categorie: 'Adidași bărbați',
    brand: 'Jack Wolfskin',
    descriere: 'Adidași trail Jack Wolfskin pentru bărbați în negru și albastru. Construcție robustă cu material respirabil, talpă cu grip excelent pentru teren variat.',
    marimi: ['40','41','42','43','44','45','46'],
    culori: ['Negru','Albastru'],
    imageCodes: ['WA1814','WA1820','WA1822','WA1826','WA1831','WA1835','WA1836','WA1837','WA1840','WA1843','WA1845','WA1847','WA1850','WA1854','WA1855'],
    is_new: false, is_featured: false, is_on_sale: false, stoc: 15,
  },
  {
    name: 'Jack Wolfskin Femei Negru-Roz Trail',
    categorie: 'Adidași femei',
    brand: 'Jack Wolfskin',
    descriere: 'Adidași trail Jack Wolfskin pentru femei în negru și roz. Construcție ușoară cu material respirabil, talpă cu amortizare. Perfecti pentru alergare și activități outdoor.',
    marimi: ['36','37','38','39','40','41'],
    culori: ['Negru','Roz'],
    imageCodes: ['WA1858','WA1861','WA1866','WA1867','WA1868','WA1875','WA1877','WA1878','WA1879','WA1881','WA1885','WA1887','WA1889','WA1891','WA1892','WA1896','WA1897','WA1898','WA1904','WA1905','WA1908','WA1909','WA1913','WA1917','WA1918','WA1921','WA1922','WA1924','WA1926','WA1929','WA1930','WA1933','WA1934','WA1937','WA1938','WA1941','WA1942','WA1945'],
    is_new: false, is_featured: false, is_on_sale: false, stoc: 10,
  },
  {
    name: 'Reebok Adidași Femei Negru Clasic',
    categorie: 'Adidași femei',
    brand: 'Reebok',
    descriere: 'Adidași clasici Reebok pentru femei din piele ecologică neagră. Design simplu și elegant, confortabili pentru purtare zilnică în oraș.',
    marimi: ['36','37','38','39','40','41'],
    culori: ['Negru'],
    imageCodes: ['WA1947','WA1949','WA1951','WA1952','WA1956','WA1957','WA1959','WA1960','WA1962','WA1964','WA1965','WA1967','WA1970','WA1971','WA1972','WA1974'],
    is_new: false, is_featured: false, is_on_sale: false, stoc: 15,
  },
  {
    name: 'Adidas Adidași Print Colorat Femei',
    categorie: 'Adidași femei',
    brand: 'Adidas',
    descriere: 'Adidași Adidas cu print colorat tropical pentru femei. Design vibrant și îndrăzneț, talpă vulcanizată albă. Perfecti pentru ținute casual de vară.',
    marimi: ['36','37','38','39','40','41'],
    culori: ['Multicolor','Alb'],
    imageCodes: ['WA1978','WA1979','WA1980','WA1984','WA1985','WA1986','WA1990','WA1991','WA1992','WA1994','WA1998','WA1999','WA2000','WA2004','WA2005','WA2006','WA2008','WA2011','WA2012','WA2016','WA2023','WA2024'],
    is_new: true, is_featured: false, is_on_sale: false, stoc: 10,
  },
  // ── PANTOFI FEMEI ─────────────────────────────────────
  {
    name: 'Timberland Cizme Înalte Femei Maro',
    categorie: 'Pantofi femei',
    brand: 'Timberland',
    descriere: 'Cizme înalte Timberland pentru femei din piele naturală maro închis. Construcție solidă cu talpă robustă, șireturi decorative. Elegante și rezistente.',
    marimi: ['36','37','38','39','40','41'],
    culori: ['Maro','Negru'],
    imageCodes: ['WA0734','WA0735'],
    is_new: false, is_featured: true, is_on_sale: false, stoc: 5,
  },
  {
    name: 'Salamander Sandale Femei Turcoaz',
    categorie: 'Pantofi femei',
    brand: 'Salamander',
    descriere: 'Sandale Salamander pentru femei cu design mozaic turcoaz-verde. Talpă ergonomică din plută cu suport pentru arc, catarame reglabile. Confort și stil vara.',
    marimi: ['36','37','38','39','40','41'],
    culori: ['Turcoaz','Verde'],
    imageCodes: ['WA1336','WA1344','WA1354','WA1358','WA1359','WA1363','WA1367','WA1368','WA1371','WA1374'],
    is_new: true, is_featured: false, is_on_sale: false, stoc: 10,
  },
]

function getFilePath(code) {
  if (code.startsWith('IMG_')) {
    const p1 = join(IMAGES_DIR, `${code}.JPG`)
    const p2 = join(IMAGES_DIR, `${code}.jpg`)
    if (existsSync(p1)) return p1
    if (existsSync(p2)) return p2
  } else {
    const p = join(IMAGES_DIR, `IMG-20260110-${code}.jpg`)
    if (existsSync(p)) return p
  }
  return null
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/ă/g, 'a').replace(/â/g, 'a').replace(/î/g, 'i')
    .replace(/ș/g, 's').replace(/ț/g, 't')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets()
  const exists = buckets?.some(b => b.name === BUCKET)
  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET, { public: true })
    if (error) {
      console.error('❌ Nu am putut crea bucket-ul:', error.message)
      process.exit(1)
    }
    console.log(`✅ Bucket "${BUCKET}" creat cu succes`)
  } else {
    console.log(`📦 Bucket "${BUCKET}" există deja`)
  }
}

async function uploadImage(code) {
  const localPath = getFilePath(code)
  if (!localPath) {
    console.warn(`  ⚠️  Fișier inexistent: ${code}`)
    return null
  }

  const filename = code.startsWith('IMG_')
    ? `${code}.JPG`
    : `IMG-20260110-${code}.jpg`

  const storagePath = `products/${filename}`
  const fileContent = readFileSync(localPath)

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, fileContent, {
      contentType: 'image/jpeg',
      upsert: true,
    })

  if (error) {
    console.warn(`  ⚠️  Upload eșuat ${code}: ${error.message}`)
    return null
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`
}

async function main() {
  console.log('🚀 Pornesc upload imagini + creare produse...\n')

  await ensureBucket()

  let totalOk = 0, totalErr = 0

  for (const produs of PRODUSE) {
    const categoryId = CATEGORII[produs.categorie]
    if (!categoryId) {
      console.error(`❌ Categorie inexistentă: ${produs.categorie}`)
      totalErr++
      continue
    }

    console.log(`\n📸 Procesez: ${produs.name} (${produs.imageCodes.length} imagini)`)

    // Upload imagini
    const imageUrls = []
    for (const code of produs.imageCodes) {
      const url = await uploadImage(code)
      if (url) imageUrls.push(url)
    }

    if (imageUrls.length === 0) {
      console.error(`  ❌ Nicio imagine uploadată pentru ${produs.name}`)
      totalErr++
      continue
    }

    console.log(`  ✅ ${imageUrls.length}/${produs.imageCodes.length} imagini uploadate`)

    // Creare produs
    const product = {
      name: produs.name,
      slug: slugify(produs.name),
      description: produs.descriere,
      price: 199,
      original_price: 199,
      category_id: categoryId,
      brand: produs.brand,
      stock_quantity: produs.stoc,
      sizes: produs.marimi,
      colors: produs.culori,
      images: imageUrls,
      is_featured: produs.is_featured,
      is_new: produs.is_new,
      is_on_sale: produs.is_on_sale,
    }

    const { error } = await supabase
      .from('products')
      .upsert(product, { onConflict: 'slug' })

    if (error) {
      console.error(`  ❌ Eroare la creare produs: ${error.message}`)
      totalErr++
    } else {
      console.log(`  ✅ Produs creat: ${produs.name}`)
      totalOk++
    }
  }

  console.log(`\n📊 Rezultat final: ${totalOk} produse create, ${totalErr} erori`)
  console.log('\n🎉 Gata! Verifică produsele pe site.')
}

main()

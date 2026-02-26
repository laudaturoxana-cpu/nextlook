import { Resend } from 'resend'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || '')
}

const FROM = 'NEXTLOOK <noreply@nextlook.ro>'
const OWNER_EMAIL = process.env.OWNER_EMAIL || 'contact@nextlook.ro'

const LOGO_HEADER = `
  <tr>
    <td style="background-color: #2D2D2D; padding: 30px; text-align: center;">
      <h1 style="margin: 0; font-size: 28px; letter-spacing: 2px;">
        <span style="color: #ffffff;">NEXT</span><span style="color: #A58625;">LOOK</span>
      </h1>
    </td>
  </tr>
`

const EMAIL_WRAPPER = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #FAF8F5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF8F5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
          ${LOGO_HEADER}
          ${content}
          <tr>
            <td style="background-color: #FAF8F5; padding: 25px 30px; text-align: center; border-top: 1px solid #E8DCC8;">
              <p style="margin: 0 0 6px; color: #736B66; font-size: 12px;">Arată bine. Fără stres, fără riscuri.</p>
              <p style="margin: 0; color: #A58625; font-size: 12px;">© ${new Date().getFullYear()} NEXTLOOK. Toate drepturile rezervate.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

interface OrderEmailData {
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  address: string
  city: string
  county: string
  postalCode?: string
  deliveryMethod: string
  paymentMethod: string
  items: { product_name: string; quantity: number; price: number; size?: string; color?: string }[]
  subtotal: number
  shippingCost: number
  total: number
  awbNumber?: string | null
  notes?: string
}

function deliveryLabel(method: string) {
  if (method === 'curier_rapid') return 'Curier rapid (DPD)'
  if (method === 'curier_gratuit') return 'Curier gratuit (DPD)'
  if (method === 'ridicare_personala') return 'Ridicare personală din Brașov'
  return method
}

function paymentLabel(method: string) {
  if (method === 'ramburs') return 'Ramburs (plată la livrare)'
  if (method === 'card') return 'Card online (Stripe)'
  return method
}

function itemsTable(items: OrderEmailData['items']) {
  const rows = items.map(item => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #F0EAE0; color: #2D2D2D; font-size: 15px;">
        ${item.product_name}
        ${item.size ? `<span style="color:#736B66; font-size:13px;"> — mărime: ${item.size}</span>` : ''}
        ${item.color ? `<span style="color:#736B66; font-size:13px;"> — culoare: ${item.color}</span>` : ''}
      </td>
      <td style="padding: 10px 0; border-bottom: 1px solid #F0EAE0; text-align: center; color: #736B66; font-size: 15px;">x${item.quantity}</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #F0EAE0; text-align: right; color: #2D2D2D; font-size: 15px; font-weight: bold;">${(item.price * item.quantity).toFixed(2)} RON</td>
    </tr>
  `).join('')

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
      <tr>
        <th style="text-align: left; color: #736B66; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 8px; border-bottom: 2px solid #E8DCC8;">Produs</th>
        <th style="text-align: center; color: #736B66; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 8px; border-bottom: 2px solid #E8DCC8;">Cant.</th>
        <th style="text-align: right; color: #736B66; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 8px; border-bottom: 2px solid #E8DCC8;">Preț</th>
      </tr>
      ${rows}
      <tr>
        <td colspan="2" style="padding-top: 12px; color: #736B66; font-size: 14px;">Transport</td>
        <td style="padding-top: 12px; text-align: right; color: #2D2D2D; font-size: 14px;">${Number(arguments[1]) === 0 ? 'Gratuit' : Number(arguments[1]).toFixed(2) + ' RON'}</td>
      </tr>
      <tr>
        <td colspan="2" style="padding-top: 8px; color: #2D2D2D; font-size: 17px; font-weight: bold;">TOTAL</td>
        <td style="padding-top: 8px; text-align: right; color: #A58625; font-size: 17px; font-weight: bold;">${Number(arguments[2]).toFixed(2)} RON</td>
      </tr>
    </table>
  `
}

// ─── Email pentru PROPRIETARĂ ─────────────────────────────────────────────────

export async function sendOwnerOrderNotification(data: OrderEmailData) {
  const resend = getResend()

  const itemRows = data.items.map(item => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #F0EAE0; color: #2D2D2D; font-size: 15px;">
        ${item.product_name}
        ${item.size ? ` — mărime: ${item.size}` : ''}
        ${item.color ? ` — culoare: ${item.color}` : ''}
      </td>
      <td style="padding: 10px 0; border-bottom: 1px solid #F0EAE0; text-align: center; color: #736B66; font-size: 15px;">x${item.quantity}</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #F0EAE0; text-align: right; font-weight: bold; font-size: 15px;">${(item.price * item.quantity).toFixed(2)} RON</td>
    </tr>
  `).join('')

  const html = EMAIL_WRAPPER(`
    <tr>
      <td style="padding: 35px 30px;">
        <h2 style="margin: 0 0 6px; color: #2D2D2D; font-size: 22px;">Comandă nouă primită!</h2>
        <p style="margin: 0 0 25px; color: #A58625; font-size: 16px; font-weight: bold;">Comanda #${data.orderNumber}</p>

        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px; background: #FAF8F5; border-radius: 10px; padding: 20px;">
          <tr>
            <td style="padding: 6px 0; color: #736B66; font-size: 14px; width: 140px;">Client:</td>
            <td style="padding: 6px 0; color: #2D2D2D; font-size: 14px; font-weight: bold;">${data.customerName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #736B66; font-size: 14px;">Email:</td>
            <td style="padding: 6px 0; color: #2D2D2D; font-size: 14px;">${data.customerEmail}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #736B66; font-size: 14px;">Telefon:</td>
            <td style="padding: 6px 0; color: #2D2D2D; font-size: 14px;">${data.customerPhone}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #736B66; font-size: 14px;">Adresă:</td>
            <td style="padding: 6px 0; color: #2D2D2D; font-size: 14px;">${data.address}, ${data.city}, ${data.county}${data.postalCode ? ', ' + data.postalCode : ''}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #736B66; font-size: 14px;">Livrare:</td>
            <td style="padding: 6px 0; color: #2D2D2D; font-size: 14px;">${deliveryLabel(data.deliveryMethod)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #736B66; font-size: 14px;">Plată:</td>
            <td style="padding: 6px 0; color: #2D2D2D; font-size: 14px;">${paymentLabel(data.paymentMethod)}</td>
          </tr>
          ${data.awbNumber ? `
          <tr>
            <td style="padding: 6px 0; color: #736B66; font-size: 14px;">AWB DPD:</td>
            <td style="padding: 6px 0; color: #A58625; font-size: 14px; font-weight: bold;">${data.awbNumber}</td>
          </tr>` : ''}
          ${data.notes ? `
          <tr>
            <td style="padding: 6px 0; color: #736B66; font-size: 14px;">Mențiuni:</td>
            <td style="padding: 6px 0; color: #2D2D2D; font-size: 14px;">${data.notes}</td>
          </tr>` : ''}
        </table>

        <h3 style="margin: 0 0 10px; color: #2D2D2D; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">Produse comandate</h3>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <th style="text-align: left; color: #736B66; font-size: 12px; padding-bottom: 8px; border-bottom: 2px solid #E8DCC8;">Produs</th>
            <th style="text-align: center; color: #736B66; font-size: 12px; padding-bottom: 8px; border-bottom: 2px solid #E8DCC8;">Cant.</th>
            <th style="text-align: right; color: #736B66; font-size: 12px; padding-bottom: 8px; border-bottom: 2px solid #E8DCC8;">Preț</th>
          </tr>
          ${itemRows}
          <tr>
            <td colspan="2" style="padding-top: 12px; color: #736B66; font-size: 14px;">Transport</td>
            <td style="padding-top: 12px; text-align: right; color: #2D2D2D; font-size: 14px;">${data.shippingCost === 0 ? 'Gratuit' : data.shippingCost.toFixed(2) + ' RON'}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding-top: 8px; color: #2D2D2D; font-size: 17px; font-weight: bold;">TOTAL</td>
            <td style="padding-top: 8px; text-align: right; color: #A58625; font-size: 17px; font-weight: bold;">${data.total.toFixed(2)} RON</td>
          </tr>
        </table>
      </td>
    </tr>
  `)

  await resend.emails.send({
    from: FROM,
    to: OWNER_EMAIL,
    subject: `[NEXTLOOK] Comandă nouă #${data.orderNumber} — ${data.customerName}`,
    html,
  })
}

// ─── Email pentru CLIENT ──────────────────────────────────────────────────────

export async function sendCustomerOrderConfirmation(data: OrderEmailData) {
  const resend = getResend()

  const itemRows = data.items.map(item => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #F0EAE0; color: #2D2D2D; font-size: 15px;">
        ${item.product_name}
        ${item.size ? `<span style="color:#736B66; font-size:13px;"> — mărime: ${item.size}</span>` : ''}
        ${item.color ? `<span style="color:#736B66; font-size:13px;"> — culoare: ${item.color}</span>` : ''}
      </td>
      <td style="padding: 10px 0; border-bottom: 1px solid #F0EAE0; text-align: center; color: #736B66; font-size: 15px;">x${item.quantity}</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #F0EAE0; text-align: right; font-weight: bold; color: #2D2D2D; font-size: 15px;">${(item.price * item.quantity).toFixed(2)} RON</td>
    </tr>
  `).join('')

  const isPickup = data.deliveryMethod === 'ridicare_personala'

  const html = EMAIL_WRAPPER(`
    <tr>
      <td style="padding: 35px 30px;">
        <h2 style="margin: 0 0 10px; color: #2D2D2D; font-size: 22px;">Mulțumim pentru comandă, ${data.customerName.split(' ')[0]}!</h2>
        <p style="margin: 0 0 6px; color: #736B66; font-size: 16px;">Am primit comanda ta și o vom procesa în cel mai scurt timp.</p>
        <p style="margin: 0 0 25px; color: #A58625; font-size: 16px; font-weight: bold;">Comanda #${data.orderNumber}</p>

        ${isPickup ? `
        <div style="background: #FFF8E8; border-left: 4px solid #A58625; padding: 16px 20px; border-radius: 0 8px 8px 0; margin-bottom: 25px;">
          <p style="margin: 0; color: #2D2D2D; font-size: 15px;">
            <strong>Ridicare personală:</strong> Te vom contacta la <strong>${data.customerPhone}</strong> când comanda este gata de ridicat din Brașov, Str. Carpaților nr. 6.
          </p>
        </div>` : ''}

        ${data.awbNumber ? `
        <div style="background: #F0FAF0; border-left: 4px solid #4CAF50; padding: 16px 20px; border-radius: 0 8px 8px 0; margin-bottom: 25px;">
          <p style="margin: 0 0 6px; color: #2D2D2D; font-size: 15px;"><strong>Colet în curs de pregătire!</strong></p>
          <p style="margin: 0; color: #736B66; font-size: 14px;">AWB DPD: <strong style="color: #2D2D2D;">${data.awbNumber}</strong></p>
          <p style="margin: 6px 0 0; color: #736B66; font-size: 13px;">Poți urmări coletul pe <a href="https://tracking.dpd.ro" style="color: #A58625;">tracking.dpd.ro</a></p>
        </div>` : ''}

        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px; background: #FAF8F5; border-radius: 10px; padding: 20px;">
          <tr>
            <td style="padding: 6px 0; color: #736B66; font-size: 14px; width: 140px;">Livrare:</td>
            <td style="padding: 6px 0; color: #2D2D2D; font-size: 14px;">${deliveryLabel(data.deliveryMethod)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #736B66; font-size: 14px;">Plată:</td>
            <td style="padding: 6px 0; color: #2D2D2D; font-size: 14px;">${paymentLabel(data.paymentMethod)}</td>
          </tr>
          ${!isPickup ? `
          <tr>
            <td style="padding: 6px 0; color: #736B66; font-size: 14px;">Adresă livrare:</td>
            <td style="padding: 6px 0; color: #2D2D2D; font-size: 14px;">${data.address}, ${data.city}, ${data.county}${data.postalCode ? ', ' + data.postalCode : ''}</td>
          </tr>` : ''}
        </table>

        <h3 style="margin: 0 0 10px; color: #2D2D2D; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">Produsele tale</h3>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <th style="text-align: left; color: #736B66; font-size: 12px; padding-bottom: 8px; border-bottom: 2px solid #E8DCC8;">Produs</th>
            <th style="text-align: center; color: #736B66; font-size: 12px; padding-bottom: 8px; border-bottom: 2px solid #E8DCC8;">Cant.</th>
            <th style="text-align: right; color: #736B66; font-size: 12px; padding-bottom: 8px; border-bottom: 2px solid #E8DCC8;">Preț</th>
          </tr>
          ${itemRows}
          <tr>
            <td colspan="2" style="padding-top: 12px; color: #736B66; font-size: 14px;">Transport</td>
            <td style="padding-top: 12px; text-align: right; color: #2D2D2D; font-size: 14px;">${data.shippingCost === 0 ? 'Gratuit' : data.shippingCost.toFixed(2) + ' RON'}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding-top: 8px; color: #2D2D2D; font-size: 17px; font-weight: bold;">TOTAL</td>
            <td style="padding-top: 8px; text-align: right; color: #A58625; font-size: 17px; font-weight: bold;">${data.total.toFixed(2)} RON</td>
          </tr>
        </table>

        <p style="margin: 30px 0 0; color: #736B66; font-size: 14px; line-height: 1.6;">
          Pentru orice întrebare, ne poți contacta la <a href="mailto:contact@nextlook.ro" style="color: #A58625;">contact@nextlook.ro</a>
        </p>
      </td>
    </tr>
  `)

  await resend.emails.send({
    from: FROM,
    to: data.customerEmail,
    subject: `Comanda ta NEXTLOOK #${data.orderNumber} a fost primită!`,
    html,
  })
}

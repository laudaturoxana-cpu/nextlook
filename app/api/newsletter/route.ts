import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

async function addToMailerLite(email: string) {
  const apiKey = process.env.MAILERLITE_API_KEY
  if (!apiKey) return

  try {
    await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        email,
        status: 'active',
      }),
    })
  } catch (error) {
    console.error('Failed to add subscriber to MailerLite:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id')
      .eq('email', email)
      .single()

    if (existing) {
      // Update subscription status if already exists
      await supabase
        .from('newsletter_subscribers')
        .update({ is_active: true })
        .eq('email', email)
    } else {
      // Insert new subscriber
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email, is_active: true })

      if (error) {
        throw error
      }

      // Add subscriber to MailerLite for marketing campaigns
      await addToMailerLite(email)

      // Send welcome email via Resend
      try {
        await resend.emails.send({
          from: 'NEXTLOOK <noreply@nextlook.ro>',
          to: email,
          subject: 'Bine ai venit la NEXTLOOK!',
          html: `
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
                      <!-- Header -->
                      <tr>
                        <td style="background-color: #2D2D2D; padding: 30px; text-align: center;">
                          <h1 style="margin: 0; font-size: 28px; letter-spacing: 2px;">
                            <span style="color: #ffffff;">NEXT</span><span style="color: #A58625;">LOOK</span>
                          </h1>
                        </td>
                      </tr>
                      <!-- Content -->
                      <tr>
                        <td style="padding: 40px 30px;">
                          <h2 style="margin: 0 0 20px; color: #2D2D2D; font-size: 24px;">Bine ai venit!</h2>
                          <p style="margin: 0 0 20px; color: #736B66; font-size: 16px; line-height: 1.6;">
                            Mulțumim că te-ai abonat la newsletter-ul NEXTLOOK! De acum vei fi primul care află despre:
                          </p>
                          <ul style="margin: 0 0 25px; padding-left: 20px; color: #736B66; font-size: 16px; line-height: 1.8;">
                            <li>Reduceri exclusive pentru abonați</li>
                            <li>Noutăți și colecții noi</li>
                            <li>Oferte speciale și promoții</li>
                          </ul>
                          <p style="margin: 0 0 30px; color: #736B66; font-size: 16px; line-height: 1.6;">
                            Promitem să nu te bombardăm cu emailuri - doar ce contează.
                          </p>
                          <a href="https://nextlook.ro/shop" style="display: inline-block; background-color: #A58625; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                            Vezi Colecția
                          </a>
                        </td>
                      </tr>
                      <!-- Footer -->
                      <tr>
                        <td style="background-color: #FAF8F5; padding: 25px 30px; text-align: center; border-top: 1px solid #E8DCC8;">
                          <p style="margin: 0 0 10px; color: #736B66; font-size: 12px;">
                            Arată bine. Fără stres, fără riscuri.
                          </p>
                          <p style="margin: 0; color: #A58625; font-size: 12px;">
                            © ${new Date().getFullYear()} NEXTLOOK. Toate drepturile rezervate.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `,
        })
      } catch (emailError) {
        // Log but don't fail if email fails - subscription is still valid
        console.error('Failed to send welcome email:', emailError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    )
  }
}

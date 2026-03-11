const PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID
const TOKEN = process.env.FB_CONVERSIONS_API_TOKEN

export interface CAPIEvent {
  event_name: 'PageView' | 'ViewContent' | 'AddToCart' | 'Purchase'
  event_id: string
  event_source_url: string
  client_ip_address?: string
  client_user_agent?: string
  // ViewContent / AddToCart
  content_ids?: string[]
  content_name?: string
  content_type?: string
  value?: number
  currency?: string
  // Purchase
  order_id?: string
  num_items?: number
}

export async function sendCAPIEvent(event: CAPIEvent) {
  if (!PIXEL_ID || !TOKEN) return

  const payload = {
    data: [
      {
        event_name: event.event_name,
        event_time: Math.floor(Date.now() / 1000),
        event_id: event.event_id,
        event_source_url: event.event_source_url,
        action_source: 'website',
        user_data: {
          client_ip_address: event.client_ip_address || null,
          client_user_agent: event.client_user_agent || null,
        },
        ...(event.content_ids
          ? {
              custom_data: {
                content_ids: event.content_ids,
                content_name: event.content_name,
                content_type: event.content_type || 'product',
                value: event.value,
                currency: event.currency || 'RON',
                ...(event.order_id ? { order_id: event.order_id } : {}),
                ...(event.num_items ? { num_items: event.num_items } : {}),
              },
            }
          : {}),
      },
    ],
  }

  try {
    await fetch(
      `https://graph.facebook.com/v18.0/${PIXEL_ID}/events?access_token=${TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    )
  } catch {
    // Fail silently
  }
}

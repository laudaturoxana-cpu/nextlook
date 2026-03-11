// Client-side Facebook Pixel helper cu deduplicare prin Conversions API

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

function randomId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function sendCAPI(event: Record<string, unknown>) {
  fetch('/api/fb-events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  }).catch(() => {})
}

export function fbViewContent(params: { product_id: string; product_name: string; price: number }) {
  const event_id = randomId()
  const url = window.location.href

  window.fbq?.('track', 'ViewContent', {
    content_ids: [params.product_id],
    content_name: params.product_name,
    content_type: 'product',
    value: params.price,
    currency: 'RON',
  }, { eventID: event_id })

  sendCAPI({
    event_name: 'ViewContent',
    event_id,
    event_source_url: url,
    content_ids: [params.product_id],
    content_name: params.product_name,
    value: params.price,
  })
}

export function fbAddToCart(params: { product_id: string; product_name: string; price: number }) {
  const event_id = randomId()
  const url = window.location.href

  window.fbq?.('track', 'AddToCart', {
    content_ids: [params.product_id],
    content_name: params.product_name,
    content_type: 'product',
    value: params.price,
    currency: 'RON',
  }, { eventID: event_id })

  sendCAPI({
    event_name: 'AddToCart',
    event_id,
    event_source_url: url,
    content_ids: [params.product_id],
    content_name: params.product_name,
    value: params.price,
  })
}

export function fbPurchase(params: { order_id: string; value: number; num_items: number }) {
  const event_id = randomId()
  const url = window.location.href

  window.fbq?.('track', 'Purchase', {
    value: params.value,
    currency: 'RON',
    num_items: params.num_items,
  }, { eventID: event_id })

  sendCAPI({
    event_name: 'Purchase',
    event_id,
    event_source_url: url,
    value: params.value,
    order_id: params.order_id,
    num_items: params.num_items,
  })
}

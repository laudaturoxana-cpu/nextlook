'use client'

import { useEffect, useState } from 'react'
import { Download, Package, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

interface Order {
  id: string
  order_number: string
  created_at: string
  status: string
  total: number
  payment_method: string
  guest_email: string
  guest_phone: string
  shipping_name: string
  shipping_address_text: string
  shipping_city: string
  shipping_county: string
  delivery_method: string
  awb_number: string | null
  awb_courier: 'cargus' | 'dpd' | null
  awb_pdf_url: string | null
  order_items: { id: string; product_name: string; quantity: number; price: number; size?: string }[]
}

const statusColors: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-800',
  confirmed:  'bg-blue-100 text-blue-800',
  shipped:    'bg-purple-100 text-purple-800',
  delivered:  'bg-green-100 text-green-800',
  cancelled:  'bg-red-100 text-red-800',
}

const statusLabels: Record<string, string> = {
  pending:   'În așteptare',
  confirmed: 'Confirmată',
  shipped:   'Expediată',
  delivered: 'Livrată',
  cancelled: 'Anulată',
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [generatingAwb, setGeneratingAwb] = useState<string | null>(null)
  const [confirmingOrder, setConfirmingOrder] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  const loadOrders = () => {
    fetch('/api/admin/orders')
      .then(r => r.json())
      .then(d => setOrders(d.orders || []))
      .catch(() => toast.error('Eroare la încărcarea comenzilor'))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => { loadOrders() }, [])

  const confirmOrder = async (orderId: string) => {
    setConfirmingOrder(orderId)
    try {
      const res = await fetch('/api/admin/orders/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })
      if (!res.ok) throw new Error('Eroare')
      toast.success('Comanda confirmată!')
      loadOrders()
    } catch (e: any) {
      toast.error(e.message || 'Eroare la confirmare')
    } finally {
      setConfirmingOrder(null)
    }
  }

  const regenerateAWB = async (orderId: string, courier: 'cargus' | 'dpd') => {
    setGeneratingAwb(orderId)
    try {
      const res = await fetch('/api/admin/orders/regenerate-awb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, courier }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Eroare')
      toast.success(`AWB ${courier.toUpperCase()} generat: ${data.awbNumber}`)
      loadOrders()
    } catch (e: any) {
      toast.error(e.message || 'Nu s-a putut genera AWB-ul')
    } finally {
      setGeneratingAwb(null)
    }
  }


  if (isLoading) {
    return (
      <div className="p-8 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Comenzi</h1>
        <p className="text-sm text-gray-500 mt-1">{orders.length} comenzi total</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Package className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>Nu există comenzi încă.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Row */}
              <div
                className="flex flex-wrap items-center gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              >
                {/* Order number + date */}
                <div className="min-w-[110px]">
                  <p className="font-semibold text-gray-900 text-sm">#{order.order_number}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.created_at).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>

                {/* Client */}
                <div className="flex-1 min-w-[150px]">
                  <p className="text-sm font-medium text-gray-800">{order.shipping_name}</p>
                  <p className="text-xs text-gray-400">{order.shipping_city}{order.shipping_county ? `, ${order.shipping_county}` : ''}</p>
                </div>

                {/* Contact */}
                <div className="hidden sm:block min-w-[160px]">
                  <p className="text-xs text-gray-500">{order.guest_email}</p>
                  <p className="text-xs text-gray-500">{order.guest_phone}</p>
                </div>

                {/* Total */}
                <div className="text-right min-w-[90px]">
                  <p className="font-bold text-gray-900">{order.total} lei</p>
                  <p className="text-xs text-gray-400 capitalize">
                    {order.payment_method === 'ramburs' ? 'Ramburs' : 'Card'}
                  </p>
                </div>

                {/* Status */}
                <div className="flex items-center gap-1">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                    {statusLabels[order.status] || order.status}
                  </span>
                  {order.status === 'pending' && (
                    <button
                      onClick={e => { e.stopPropagation(); confirmOrder(order.id) }}
                      disabled={confirmingOrder === order.id}
                      className="px-2 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {confirmingOrder === order.id ? '...' : 'Confirmă'}
                    </button>
                  )}
                </div>

                {/* AWB */}
                <div className="flex items-center gap-2 flex-wrap">
                  {order.awb_number ? (
                    <>
                      <span className={`text-xs font-bold px-2 py-1 rounded border font-mono ${order.awb_courier === 'dpd' ? 'bg-red-50 border-red-300 text-red-800' : 'bg-orange-50 border-orange-300 text-orange-800'}`}>
                        {order.awb_courier?.toUpperCase() || 'AWB'}: {order.awb_number}
                      </span>
                      <a
                        href={order.awb_courier === 'cargus'
                          ? `https://app.cargus.ro/Expedieri/PrintAWB?awbNumber=${order.awb_number}`
                          : `/api/admin/orders/label?awb=${order.awb_number}&courier=dpd`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg hover:bg-gray-700 transition-colors"
                        title={order.awb_courier === 'cargus' ? `Printează AWB ${order.awb_number} în WebExpress` : 'Descarcă etichetă'}
                      >
                        <Download className="h-3 w-3" />
                        Descarcă
                      </a>
                      <a
                        href={order.awb_courier === 'dpd'
                          ? `https://tracking.dpd.ro/?awb=${order.awb_number}`
                          : `https://www.cargus.ro/tracking-romanian/?trackingReference=${order.awb_number}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Tracking
                      </a>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={e => { e.stopPropagation(); regenerateAWB(order.id, 'cargus') }}
                        disabled={generatingAwb === order.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white text-xs rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                      >
                        <Package className="h-3 w-3" />
                        {generatingAwb === order.id ? '...' : 'AWB Cargus'}
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); regenerateAWB(order.id, 'dpd') }}
                        disabled={generatingAwb === order.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        <Package className="h-3 w-3" />
                        {generatingAwb === order.id ? '...' : 'AWB DPD'}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Expanded details */}
              {expanded === order.id && (
                <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Produse comandate</p>
                  <div className="space-y-1">
                    {order.order_items?.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {item.product_name}
                          {item.size ? <span className="text-gray-400 ml-1">({item.size})</span> : null}
                          <span className="text-gray-400 ml-1">× {item.quantity}</span>
                        </span>
                        <span className="font-medium text-gray-900">{item.price * item.quantity} lei</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-500">
                    <span className="font-medium">Adresă livrare: </span>
                    {order.shipping_address_text}, {order.shipping_city}, {order.shipping_county}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

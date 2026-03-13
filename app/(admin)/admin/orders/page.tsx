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
  dpd_shipment_id: number | null
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
  const [downloadingAwb, setDownloadingAwb] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/orders')
      .then(r => r.json())
      .then(d => setOrders(d.orders || []))
      .catch(() => toast.error('Eroare la încărcarea comenzilor'))
      .finally(() => setIsLoading(false))
  }, [])

  const downloadAWB = async (awbNumber: string, orderNumber: string) => {
    setDownloadingAwb(awbNumber)
    try {
      const res = await fetch(`/api/admin/orders/label?awb=${awbNumber}`)
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Eroare')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `awb-${orderNumber}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('AWB descărcat!')
    } catch (e: any) {
      toast.error(e.message || 'Nu s-a putut descărca AWB-ul')
    } finally {
      setDownloadingAwb(null)
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
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                  {statusLabels[order.status] || order.status}
                </span>

                {/* AWB */}
                <div className="flex items-center gap-2">
                  {order.awb_number ? (
                    <>
                      <span className="text-xs text-gray-500 font-mono">AWB: {order.awb_number}</span>
                      <button
                        onClick={e => { e.stopPropagation(); downloadAWB(order.awb_number!, order.order_number) }}
                        disabled={downloadingAwb === order.awb_number}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                      >
                        <Download className="h-3 w-3" />
                        {downloadingAwb === order.awb_number ? 'Se descarcă...' : 'AWB PDF'}
                      </button>
                      <a
                        href={`https://tracking.dpd.ro/?awb=${order.awb_number}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Tracking DPD
                      </a>
                    </>
                  ) : (
                    <span className="text-xs text-gray-400 italic">Fără AWB</span>
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

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return `${price.toFixed(0)} lei`
}

export function generateOrderNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `NL-${year}-${random}`
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function calculateDiscount(price: number, oldPrice: number): number {
  return Math.round(((oldPrice - price) / oldPrice) * 100)
}

export function getDeliveryDate(method: string): string {
  const today = new Date()
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }

  if (method === 'curier_rapid') {
    const date1 = new Date(today.getTime() + 24 * 60 * 60 * 1000)
    const date2 = new Date(today.getTime() + 48 * 60 * 60 * 1000)
    return `${date1.toLocaleDateString('ro-RO', options)} - ${date2.toLocaleDateString('ro-RO', options)}`
  } else if (method === 'curier_gratuit') {
    const date1 = new Date(today.getTime() + 48 * 60 * 60 * 1000)
    const date2 = new Date(today.getTime() + 72 * 60 * 60 * 1000)
    return `${date1.toLocaleDateString('ro-RO', options)} - ${date2.toLocaleDateString('ro-RO', options)}`
  }

  return 'Ridicare personală'
}

export function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function getOrderStatusText(status: string): string {
  const texts: Record<string, string> = {
    pending: 'În așteptare',
    confirmed: 'Confirmată',
    processing: 'În procesare',
    shipped: 'Expediată',
    delivered: 'Livrată',
    cancelled: 'Anulată',
  }
  return texts[status] || status
}

export function getPaymentStatusText(status: string): string {
  const texts: Record<string, string> = {
    pending: 'În așteptare',
    paid: 'Plătită',
    failed: 'Eșuată',
  }
  return texts[status] || status
}

// Romanian counties for dropdown
export const romanianCounties = [
  'Alba', 'Arad', 'Argeș', 'Bacău', 'Bihor', 'Bistrița-Năsăud', 'Botoșani',
  'Brașov', 'Brăila', 'București', 'Buzău', 'Caraș-Severin', 'Călărași',
  'Cluj', 'Constanța', 'Covasna', 'Dâmbovița', 'Dolj', 'Galați', 'Giurgiu',
  'Gorj', 'Harghita', 'Hunedoara', 'Ialomița', 'Iași', 'Ilfov', 'Maramureș',
  'Mehedinți', 'Mureș', 'Neamț', 'Olt', 'Prahova', 'Satu Mare', 'Sălaj',
  'Sibiu', 'Suceava', 'Teleorman', 'Timiș', 'Tulcea', 'Vaslui', 'Vâlcea',
  'Vrancea'
]

// Size options
export const sizeOptions = {
  clothing: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  shoes: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
}

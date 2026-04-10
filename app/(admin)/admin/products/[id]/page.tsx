import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import ProductForm from '@/components/admin/ProductForm'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const adminClient = createAdminClient()

  const { data: product, error } = await adminClient
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !product) notFound()

  // Parse colors from "Nume|#hex" format back to {name, hex} objects
  const colors = (product.colors || []).map((c: string) => {
    if (typeof c === 'string' && c.includes('|')) {
      const [name, hex] = c.split('|')
      return { name, hex }
    }
    // Handle legacy format (plain string or object)
    if (typeof c === 'object' && c !== null) return c
    return { name: String(c), hex: '#000000' }
  })

  return (
    <ProductForm
      initialData={{
        id: product.id,
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        brand: product.brand || '',
        category_id: product.category_id || '',
        price: product.price?.toString() || '',
        original_price: product.original_price?.toString() || '',
        stock_quantity: product.stock_quantity?.toString() || '0',
        sizes: product.sizes || [],
        size_stocks: product.size_stocks || {},
        colors,
        images: product.images || [],
        is_featured: product.is_featured || false,
        is_new: product.is_new || false,
        is_on_sale: product.is_on_sale || false,
      }}
    />
  )
}

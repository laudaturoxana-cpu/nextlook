import { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const supabase = createAdminClient()

  const { data: product } = await supabase
    .from('products')
    .select('name, description, images, price, brand')
    .eq('slug', params.slug)
    .single()

  if (!product) return {}

  const image = product.images?.[0] ?? null
  const title = product.brand
    ? `${product.name} | ${product.brand}`
    : product.name
  const description =
    product.description?.slice(0, 155) ??
    `Cumpără ${product.name} la cel mai bun preț pe NEXTLOOK.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://nextlook.ro/product/${params.slug}`,
      siteName: 'NEXTLOOK',
      type: 'website',
      ...(image
        ? {
            images: [
              {
                url: image,
                width: 1200,
                height: 630,
                alt: product.name,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  }
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

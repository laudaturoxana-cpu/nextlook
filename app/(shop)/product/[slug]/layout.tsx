import { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  try {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/products?slug=eq.${params.slug}&select=name,description,images,price,brand&limit=1`
    const res = await fetch(url, {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
      },
      next: { revalidate: 3600 },
    })

    const rows = await res.json()
    const product = rows?.[0]
    if (!product) return {}

    const image: string | null = Array.isArray(product.images) ? product.images[0] ?? null : null
    const title = product.brand ? `${product.name} | ${product.brand}` : product.name
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
        ...(image ? { images: [{ url: image, width: 800, height: 800, alt: product.name }] } : {}),
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        ...(image ? { images: [image] } : {}),
      },
    }
  } catch {
    return {}
  }
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

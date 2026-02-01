'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import ProductCard from '@/components/ProductCard'
import { Button } from '@/components/ui/Button'
import { Product } from '@/types'

// Mock data pentru demo - în producție, se va face fetch din Supabase
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Nike Air Max 90 Essential White/Black',
    slug: 'nike-air-max-90-essential-white-black',
    description: 'Sneakers clasici cu design iconic',
    price: 449,
    old_price: 599,
    category: 'sneakers',
    subcategory: 'running',
    brand: 'Nike',
    sizes: ['40', '41', '42', '43', '44'],
    colors: [{ name: 'Alb', hex: '#FFFFFF' }],
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'],
    stock: 12,
    is_featured: true,
    is_bestseller: true,
    is_new: false,
    rating: 4.8,
    reviews_count: 124,
    styling_suggestions: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Adidas Ultraboost 22 Running Shoes',
    slug: 'adidas-ultraboost-22-running',
    description: 'Confort maxim pentru alergare',
    price: 599,
    old_price: null,
    category: 'sneakers',
    subcategory: 'running',
    brand: 'Adidas',
    sizes: ['39', '40', '41', '42', '43'],
    colors: [{ name: 'Negru', hex: '#000000' }],
    images: ['https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800'],
    stock: 8,
    is_featured: true,
    is_bestseller: true,
    is_new: true,
    rating: 4.9,
    reviews_count: 89,
    styling_suggestions: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Zara Oversized Blazer Premium',
    slug: 'zara-oversized-blazer-premium',
    description: 'Blazer oversized pentru un look modern',
    price: 299,
    old_price: 399,
    category: 'femei',
    subcategory: 'jachete',
    brand: 'Zara',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Bej', hex: '#D4C4B0' }],
    images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800'],
    stock: 5,
    is_featured: true,
    is_bestseller: false,
    is_new: true,
    rating: 4.6,
    reviews_count: 45,
    styling_suggestions: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Puma RS-X Bold Sneakers',
    slug: 'puma-rs-x-bold-sneakers',
    description: 'Sneakers retro cu design îndrăzneț',
    price: 379,
    old_price: 499,
    category: 'sneakers',
    subcategory: 'lifestyle',
    brand: 'Puma',
    sizes: ['38', '39', '40', '41', '42'],
    colors: [{ name: 'Multicolor', hex: '#FF6B6B' }],
    images: ['https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800'],
    stock: 3,
    is_featured: true,
    is_bestseller: true,
    is_new: false,
    rating: 4.7,
    reviews_count: 67,
    styling_suggestions: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'H&M Essential Cotton T-Shirt Pack',
    slug: 'hm-essential-cotton-tshirt-pack',
    description: 'Set de tricouri basic din bumbac organic',
    price: 149,
    old_price: null,
    category: 'barbati',
    subcategory: 'tricouri',
    brand: 'H&M',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Alb', hex: '#FFFFFF' }, { name: 'Negru', hex: '#000000' }],
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'],
    stock: 25,
    is_featured: true,
    is_bestseller: true,
    is_new: false,
    rating: 4.5,
    reviews_count: 156,
    styling_suggestions: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'Nike Air Force 1 Low White',
    slug: 'nike-air-force-1-low-white',
    description: 'Clasicul sneaker alb pentru orice outfit',
    price: 499,
    old_price: null,
    category: 'sneakers',
    subcategory: 'lifestyle',
    brand: 'Nike',
    sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44'],
    colors: [{ name: 'Alb', hex: '#FFFFFF' }],
    images: ['https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800'],
    stock: 18,
    is_featured: true,
    is_bestseller: true,
    is_new: false,
    rating: 4.9,
    reviews_count: 234,
    styling_suggestions: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '7',
    name: 'Mango Wool Blend Coat',
    slug: 'mango-wool-blend-coat',
    description: 'Palton elegant din amestec de lână',
    price: 549,
    old_price: 699,
    category: 'femei',
    subcategory: 'paltoane',
    brand: 'Mango',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [{ name: 'Camel', hex: '#C19A6B' }],
    images: ['https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800'],
    stock: 6,
    is_featured: true,
    is_bestseller: false,
    is_new: true,
    rating: 4.8,
    reviews_count: 38,
    styling_suggestions: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '8',
    name: 'New Balance 574 Classic',
    slug: 'new-balance-574-classic',
    description: 'Sneakers retro pentru confort zilnic',
    price: 429,
    old_price: null,
    category: 'sneakers',
    subcategory: 'lifestyle',
    brand: 'New Balance',
    sizes: ['38', '39', '40', '41', '42', '43'],
    colors: [{ name: 'Gri', hex: '#808080' }],
    images: ['https://images.unsplash.com/photo-1539185441755-769473a23570?w=800'],
    stock: 10,
    is_featured: true,
    is_bestseller: true,
    is_new: false,
    rating: 4.7,
    reviews_count: 92,
    styling_suggestions: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export default function FeaturedProducts() {
  // În producție, aici se va face fetch din Supabase:
  // const { data: products } = await supabase
  //   .from('products')
  //   .select('*')
  //   .eq('is_bestseller', true)
  //   .limit(8)

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-title mb-4">
            CELE MAI IUBITE DE CLIENȚII NOȘTRI
          </h2>
          <p className="section-subtitle">
            Produsele la care revin mereu. Testate și aprobate de sute de clienți.
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link href="/shop">
            <Button variant="outline" size="lg">
              Vezi Toate Produsele
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

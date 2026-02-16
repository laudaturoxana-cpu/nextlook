import dynamic from 'next/dynamic'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import HeroSection from '@/components/sections/HeroSection'

// Lazy load below-fold sections to reduce initial JS bundle
const CategoriesSection = dynamic(() => import('@/components/sections/CategoriesSection'))
const FeaturedProducts = dynamic(() => import('@/components/sections/FeaturedProducts'))
const TrustBar = dynamic(() => import('@/components/sections/TrustBar'))
const Testimonials = dynamic(() => import('@/components/sections/Testimonials'))
const Newsletter = dynamic(() => import('@/components/sections/Newsletter'))

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <CategoriesSection />
        <FeaturedProducts />
        <TrustBar />
        <Testimonials />
        <Newsletter />
      </main>
      <Footer />
    </>
  )
}

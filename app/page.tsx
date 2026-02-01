import Header from '@/components/Header'
import Footer from '@/components/Footer'
import HeroSection from '@/components/sections/HeroSection'
import FearsSection from '@/components/sections/FearsSection'
import CategoriesSection from '@/components/sections/CategoriesSection'
import FeaturedProducts from '@/components/sections/FeaturedProducts'
import HowItWorks from '@/components/sections/HowItWorks'
import TrustSignals from '@/components/sections/TrustSignals'
import Testimonials from '@/components/sections/Testimonials'
import Newsletter from '@/components/sections/Newsletter'

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <FearsSection />
        <CategoriesSection />
        <FeaturedProducts />
        <HowItWorks />
        <TrustSignals />
        <Testimonials />
        <Newsletter />
      </main>
      <Footer />
    </>
  )
}

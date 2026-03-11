import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AnalyticsTracker from '@/components/AnalyticsTracker'

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <AnalyticsTracker />
      <Header />
      <main className="pt-24">{children}</main>
      <Footer />
    </>
  )
}

import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <main className="pt-24 min-h-screen bg-cream">{children}</main>
      <Footer />
    </>
  )
}

import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function AuthLayout({
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

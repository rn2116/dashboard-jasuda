import Link from "next/link"
import { FactoryIcon, ArrowRightIcon, ChartLineUpIcon, CpuIcon, ScrewdriverIcon } from "@phosphor-icons/react/dist/ssr"
import { AnimatedSection } from "@/components/landing/animated-section"
import { Button } from "@/components/ui/button"

import { FloatingGraphWrapper } from "@/components/landing/floating-graph-wrapper"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-2 font-bold text-lg text-primary">
            <FactoryIcon className="size-6" />
            <span>JasudaMonitor</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                Masuk
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 sm:py-32 lg:pb-32 lg:pt-40">
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-secondary opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
          </div>
          
          <div className="container mx-auto px-4 sm:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
              <AnimatedSection className="max-w-2xl">
                <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-foreground">
                  Pantau Mesin Industrial Anda Secara <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">Real-time</span>
                </h1>
                <p className="mt-6 text-lg leading-8 text-muted-foreground">
                  Tingkatkan efisiensi produksi dan minimalisir *downtime* dengan sistem monitoring Jasuda. Dapatkan data suhu, tekanan, kecepatan, dan hasil produksi secara instan dari ujung jari Anda.
                </p>
                <div className="mt-10 flex items-center gap-x-6">
                  <Link href="/login">
                    <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/30 transition-all hover:scale-105 hover:shadow-primary/50 group">
                      Masuk Dashboard
                      <ArrowRightIcon className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </AnimatedSection>
              
              <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
                <FloatingGraphWrapper />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 sm:py-32 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-8">
            <AnimatedSection className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-primary">Sistem Terintegrasi</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Dukungan Penuh Untuk Lini Produksi
              </p>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Pantau setiap tahap produksi mulai dari penyegelan manual hingga sistem ban berjalan otomatis dengan metrik yang akurat.
              </p>
            </AnimatedSection>

            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                {/* Mesin 1 */}
                <AnimatedSection delay={0.1} className="flex flex-col items-center text-center p-8 rounded-2xl bg-card border border-border/50 shadow-sm transition-all hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-2">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <ScrewdriverIcon className="h-8 w-8" />
                  </div>
                  <dt className="text-xl font-semibold leading-7 text-foreground">Mesin Cup Sealer Manual</dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                    <p className="flex-auto">Pantau kestabilan suhu pemanas dan tekanan penyegelan secara presisi untuk memastikan kualitas segel manual terbaik.</p>
                  </dd>
                </AnimatedSection>

                {/* Mesin 2 */}
                <AnimatedSection delay={0.3} className="flex flex-col items-center text-center p-8 rounded-2xl bg-card border border-border/50 shadow-sm transition-all hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-2">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <CpuIcon className="h-8 w-8" />
                  </div>
                  <dt className="text-xl font-semibold leading-7 text-foreground">Mesin Cup Sealer Otomatis</dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                    <p className="flex-auto">Analisis waktu siklus (timer) dan tekanan hidrolik otomatis untuk mengoptimalkan kecepatan tanpa mengorbankan kualitas.</p>
                  </dd>
                </AnimatedSection>

                {/* Mesin 3 */}
                <AnimatedSection delay={0.5} className="flex flex-col items-center text-center p-8 rounded-2xl bg-card border border-border/50 shadow-sm transition-all hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-2">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <ChartLineUpIcon className="h-8 w-8" />
                  </div>
                  <dt className="text-xl font-semibold leading-7 text-foreground">Mesin Conveyor</dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                    <p className="flex-auto">Lacak RPM motor dan hitung jumlah pouch masuk/keluar secara real-time untuk mengetahui total *throughput* harian.</p>
                  </dd>
                </AnimatedSection>
              </dl>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground sm:px-8">
          &copy; {new Date().getFullYear()} JasudaMonitor. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

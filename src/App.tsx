import {
  ArrowUpRight,
  ShieldCheck,
  BriefcaseBusiness,
  Sparkles,
} from 'lucide-react'

import Button from './components/ui/Button'

export default function App() {
  return (
    <main className="min-h-screen">

      <header className="border-b border-border bg-white">
        <div className="container-page flex h-18 items-center justify-between">

          <div className="flex items-center gap-2">
            <ShieldCheck
              className="text-primary"
              size={30}
            />

            <span className="font-display text-xl font-extrabold">
              talentbridge
              <span className="text-primary">.ai</span>
            </span>
          </div>

          <Button variant="outline">
            Sign in
          </Button>

        </div>
      </header>

      <section className="container-page py-12 lg:py-20">

        <div className="rounded-3xl bg-primary-dark px-8 py-16 text-white lg:px-16">

          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm">
            <Sparkles size={16} />
            AI-powered professional opportunities
          </div>

          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight lg:text-6xl">
            Talent has no borders.
            <span className="mt-2 block text-accent">
              Opportunity shouldn't either.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">
            Demonstrate your skills, build your professional
            identity and connect with meaningful opportunities.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">

            <Button variant="secondary" size="lg">
              Build your passport
              <ArrowUpRight size={18} />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="border-white/25 bg-transparent text-white hover:bg-white/10"
            >
              Explore opportunities
            </Button>

          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">

          <div className="surface-card">
            <ShieldCheck className="mb-4 text-primary" size={32} />
            <h2 className="text-xl font-bold">
              Prove your skills
            </h2>
            <p className="mt-2 text-muted">
              Build an evidence-backed professional profile.
            </p>
          </div>

          <div className="surface-card">
            <Sparkles className="mb-4 text-primary" size={32} />
            <h2 className="text-xl font-bold">
              Discover your potential
            </h2>
            <p className="mt-2 text-muted">
              Transform experience into structured competencies.
            </p>
          </div>

          <div className="surface-card">
            <BriefcaseBusiness
              className="mb-4 text-primary"
              size={32}
            />
            <h2 className="text-xl font-bold">
              Access opportunities
            </h2>
            <p className="mt-2 text-muted">
              Connect with relevant professional opportunities.
            </p>
          </div>

        </div>

      </section>
    </main>
  )
}
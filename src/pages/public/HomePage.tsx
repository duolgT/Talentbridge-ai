import { Link } from 'react-router-dom'

import {
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  BriefcaseBusiness,
  CheckCircle2,
  UserRound,
  FileCheck2,
  Globe2,
  Fingerprint,
  ScanLine,
  Handshake,
  ListChecks,
} from 'lucide-react'

const benefits = [
  {
    icon: Fingerprint,
    title: 'Prove your skills',
    description:
      'Transform professional experience, practical work and available credentials into an evidence-backed profile.',
    number: '01',
  },
  {
    icon: ShieldCheck,
    title: 'Prepare for employment',
    description:
      'Understand employment requirements, identify missing documentation and access reliable guidance.',
    number: '02',
  },
  {
    icon: Handshake,
    title: 'Connect to opportunities',
    description:
      'Discover professional opportunities that align with your demonstrated abilities and career goals.',
    number: '03',
  },
]

const steps = [
  {
    number: '01',
    title: 'Create your profile',
    description:
      'Tell us about your experience, education and career interests.',
  },
  {
    number: '02',
    title: 'Discover your skills',
    description:
      'Turn your experience into structured professional competencies.',
  },
  {
    number: '03',
    title: 'Build your evidence',
    description:
      'Submit work samples and complete practical assessments.',
  },
  {
    number: '04',
    title: 'Share your passport',
    description:
      'Present your professional evidence to potential employers.',
  },
]

const goals = [
  { number: 4, name: 'Quality Education', color: '#C5192D' },
  { number: 8, name: 'Decent Work', color: '#A21942' },
  { number: 10, name: 'Reduced Inequalities', color: '#DD1367' },
  { number: 16, name: 'Strong Institutions', color: '#00689D' },
  { number: 17, name: 'Partnerships', color: '#19486A' },
]

function PassportPreview() {
  return (
    <div className="relative mx-auto w-full max-w-md">

      <div className="absolute -inset-5 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative rounded-3xl border border-white/20 bg-white p-6 text-ink shadow-2xl sm:p-8">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2">
            <ShieldCheck className="text-primary" size={23} />

            <span className="text-xs font-semibold uppercase tracking-widest text-muted">
              Skills passport
            </span>
          </div>

          <ScanLine size={22} className="text-muted" />

        </div>

        <div className="my-6 flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100">
            <UserRound size={30} className="text-primary" />
          </div>

          <div>
            <h3 className="text-xl font-bold">Samuel M.</h3>
            <p className="text-sm text-muted">Software Developer</p>

            <div className="mt-1 flex items-center gap-1 text-xs text-muted">
              <Globe2 size={12} />
              Kenya
            </div>
          </div>

        </div>

        <div className="border-y border-border py-5">

          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">
            Reviewed competencies
          </p>

          <div className="space-y-4">

            {[
              'Front-end development',
              'REST API integration',
              'Responsive web design',
            ].map((skill) => (
              <div
                key={skill}
                className="flex items-center justify-between gap-3"
              >
                <span className="text-sm font-medium">
                  {skill}
                </span>

                <CheckCircle2
                  size={18}
                  className="shrink-0 text-success"
                />
              </div>
            ))}

          </div>

        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">

          <div className="rounded-xl bg-canvas p-4">
            <FileCheck2 size={20} className="text-primary" />
            <p className="mt-2 text-2xl font-bold">03</p>
            <p className="text-xs text-muted">Work samples</p>
          </div>

          <div className="rounded-xl bg-canvas p-4">
            <BriefcaseBusiness size={20} className="text-primary" />
            <p className="mt-2 text-2xl font-bold">02</p>
            <p className="text-xs text-muted">References</p>
          </div>

        </div>

        <div className="mt-5 rounded-xl bg-brand-50 p-3">

          <p className="text-xs font-medium text-brand-700">
            Demonstration profile — fictional data
          </p>

        </div>

      </div>

    </div>
  )
}

export default function HomePage() {
  return (
    <>

      {/* Hero */}

      <section className="relative overflow-hidden bg-primary-dark text-white">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_40%,rgba(213,247,106,0.09),transparent_50%)]" />

        <div className="container-page relative grid items-center gap-16 py-20 lg:grid-cols-2 lg:py-28">

          <div>

            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-accent">

              <Sparkles size={15} />
              Unlocking displaced talent

            </div>

            <h1 className="font-display text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl xl:text-7xl">

              Your skills.
              <br />
              Your identity.
              <br />

              <span className="text-accent">
                Your future.
              </span>

            </h1>

            <p className="mt-7 max-w-lg text-lg leading-relaxed text-white/75">

              A new pathway for displaced professionals
              to demonstrate their abilities, build trusted
              professional identities and access meaningful
              employment opportunities.

            </p>

            <div className="mt-9 flex flex-wrap gap-4">

              <Link
                to="/register"
                className="inline-flex items-center gap-3 rounded-button bg-accent px-6 py-4 font-semibold text-primary-dark hover:bg-lime-300"
              >
                Build your passport
                <ArrowUpRight size={19} />
              </Link>

              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-button border border-white/25 px-6 py-4 font-semibold hover:bg-white/10"
              >
                How it works
                <ArrowRight size={18} />
              </a>

            </div>

            <p className="mt-7 text-sm text-white/60">

              Built for dignity, inclusion and professional
              opportunity.

            </p>

          </div>

          <PassportPreview />

        </div>

      </section>

      {/* Platform benefits */}

      <section className="container-page py-20 lg:py-24">

        <div className="max-w-2xl">

          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            The UjuziLink difference
          </span>

          <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
            Talent deserves recognition.
          </h2>

          <p className="mt-4 leading-relaxed text-muted">

            We address the barriers that prevent skilled
            displaced professionals from turning their
            experience into meaningful opportunities.

          </p>

        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">

          {benefits.map(({ icon: Icon, title, description, number }) => (

            <article
              key={title}
              className="surface-card group transition-shadow hover:shadow-elevated"
            >

              <div className="flex items-center justify-between">

                <div className="rounded-xl bg-brand-50 p-4">
                  <Icon className="text-primary" size={28} />
                </div>

                <span className="font-display text-3xl font-bold text-brand-100">
                  {number}
                </span>

              </div>

              <h3 className="mt-7 text-xl font-bold">
                {title}
              </h3>

              <p className="mt-3 leading-relaxed text-muted">
                {description}
              </p>

            </article>

          ))}

        </div>

      </section>

      {/* How it works */}

      <section
        id="how-it-works"
        className="scroll-mt-20 border-y border-border bg-white py-20"
      >

        <div className="container-page">

          <div className="mx-auto max-w-2xl text-center">

            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Your professional journey
            </span>

            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
              From potential to opportunity.
            </h2>

            <p className="mt-4 text-muted">
              Four simple steps to build your professional identity.
            </p>

          </div>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">

            {steps.map((step) => (

              <article key={step.number}>

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-dark font-bold text-accent">
                  {step.number}
                </div>

                <h3 className="mt-5 text-lg font-bold">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {step.description}
                </p>

              </article>

            ))}

          </div>

        </div>

      </section>

      {/* Social impact */}

      <section className="container-page py-20">

        <div className="grid items-center gap-10 lg:grid-cols-2">

          <div>

            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Purpose-driven technology
            </span>

            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
              Designed for lasting impact.
            </h2>

            <p className="mt-4 leading-relaxed text-muted">

              UjuziLink is designed to contribute to
              inclusive education, decent work, reduced
              inequalities and stronger partnerships.

            </p>

            <div className="mt-6 flex items-center gap-3 text-sm font-medium text-primary">
              <ListChecks size={22} />
              Aligned with five Sustainable Development Goals
            </div>

          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

            {goals.map((goal) => (

              <article
                key={goal.number}
                style={{ backgroundColor: goal.color }}
                className="min-h-32 rounded-xl p-5 text-white"
              >

                <span className="font-display text-4xl font-extrabold">
                  {goal.number}
                </span>

                <h3 className="mt-3 text-sm font-semibold">
                  {goal.name}
                </h3>

              </article>

            ))}

          </div>

        </div>

      </section>

      {/* Call to action */}

      <section className="container-page pb-20">

        <div className="rounded-3xl bg-accent px-6 py-14 text-center text-primary-dark sm:px-14">

          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Your next chapter starts here.
          </h2>

          <p className="mx-auto mt-4 max-w-lg leading-relaxed">

            Build a professional identity that reflects
            what you can do, not simply the documents
            you possess.

          </p>

          <Link
            to="/register"
            className="mt-7 inline-flex items-center gap-2 rounded-button bg-primary-dark px-6 py-4 font-semibold text-white hover:bg-brand-700"
          >
            Get started
            <ArrowUpRight size={18} />
          </Link>

        </div>

      </section>

    </>
  )
}
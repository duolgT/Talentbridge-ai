import { Construction, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

interface PlaceholderPageProps {
  title: string
  description: string
  backTo?: string
}

export default function PlaceholderPage({
  title,
  description,
  backTo = '/dashboard',
}: PlaceholderPageProps) {
  return (
    <section className="container-page py-16">

      <div className="surface-card mx-auto max-w-xl text-center">

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50">

          <Construction size={30} className="text-primary" />

        </div>

        <h1 className="mt-6 text-2xl font-extrabold">
          {title}
        </h1>

        <p className="mt-3 leading-relaxed text-muted">
          {description}
        </p>

        <p className="mt-4 text-sm font-medium text-primary">
          This module is currently under development.
        </p>

        <Link
          to={backTo}
          className="mt-7 inline-flex items-center gap-2 rounded-button bg-primary-dark px-5 py-3 text-sm font-semibold text-white"
        >
          <ArrowLeft size={17} />
          Go back
        </Link>

      </div>

    </section>
  )
}
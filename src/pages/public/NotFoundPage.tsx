import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas p-6 text-center">

      <div className="max-w-lg">

        <p className="font-display text-8xl font-extrabold text-brand-200">
          404
        </p>

        <h1 className="mt-5 text-3xl font-bold">
          This path doesn't exist.
        </h1>

        <p className="mt-4 text-muted">

          The page you're looking for may have moved
          or is no longer available.

        </p>

        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-button bg-primary-dark px-6 py-3 font-medium text-white"
        >
          <ArrowLeft size={18} />
          Return home
        </Link>

      </div>

    </main>
  )
}
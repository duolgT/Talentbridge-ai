import { Link } from 'react-router-dom'
import Logo from '../common/Logo'

export default function Footer() {
  return (
    <footer className="bg-brand-950 text-white">

      <div className="container-page py-14">

        <div className="grid gap-10 md:grid-cols-3">

          <div>

            <Logo light />

            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/65">

              Empowering displaced professionals through
              skills recognition, employment readiness
              and meaningful opportunities.

            </p>

          </div>

          <div>

            <h3 className="font-semibold">Platform</h3>

            <div className="mt-5 flex flex-col gap-3 text-sm text-white/65">

              <Link to="/" className="hover:text-white">
                Home
              </Link>

              <Link to="/about" className="hover:text-white">
                About UjuziLink
              </Link>

              <Link to="/register" className="hover:text-white">
                Get started
              </Link>

              <Link to="/login" className="hover:text-white">
                Sign in
              </Link>

            </div>

          </div>

          <div>

            <h3 className="font-semibold">Our mission</h3>

            <p className="mt-5 text-sm leading-relaxed text-white/65">

              Advancing professional inclusion and
              contributing to the United Nations
              Sustainable Development Goals.

            </p>

            <a
              href="https://sdgs.un.org/goals"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm text-accent"
            >
              Explore the SDGs
            </a>

          </div>

        </div>

        <div className="mt-12 flex flex-wrap justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/55">

          <p>
            © {new Date().getFullYear()} UjuziLink.
            All rights reserved.
          </p>

          <p>Skills without borders.</p>

        </div>

      </div>

    </footer>
  )
}
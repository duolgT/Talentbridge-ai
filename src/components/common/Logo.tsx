import { Link } from 'react-router-dom'

interface LogoProps {
  light?: boolean
}

export default function Logo({ light = false }: LogoProps) {
  return (
    <Link to="/" className="inline-flex items-center gap-3">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-dark">

        <svg
          viewBox="0 0 48 48"
          className="h-8 w-8"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M7 36V22Q24 1 41 22V36M7 25H41M16 17V36M32 17V36M3 37H45"
            stroke="#D5F76A"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>

      </div>

      <span
        className={`font-display text-xl font-extrabold tracking-tight ${
          light ? 'text-white' : 'text-primary-dark'
        }`}
      >
        talentbridge
        <span className={light ? 'text-accent' : 'text-primary'}>
          .ai
        </span>
      </span>

    </Link>
  )
}
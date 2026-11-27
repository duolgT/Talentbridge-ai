import { Link } from 'react-router-dom'
import { BRAND } from '../../constants/branding'

interface LogoProps {
  light?: boolean
}

export default function Logo({ light = false }: LogoProps) {
  return (
    <Link aria-label={BRAND.name} to="/" className="inline-flex items-center gap-3">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-dark">

        <img src={BRAND.logo} alt="" className="h-10 w-10" />

      </div>

      <span
        className={`font-display text-xl font-extrabold tracking-tight ${
          light ? 'text-white' : 'text-primary-dark'
        }`}
      >
        Ujuzi
        <span className={light ? 'text-accent' : 'text-primary'}>
          Link
        </span>
      </span>

    </Link>
  )
}
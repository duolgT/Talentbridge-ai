import { Link } from 'react-router-dom'
import { BRAND } from '../../constants/branding'

interface LogoProps {
  light?: boolean
  variant?: 'light' | 'dark'
  showTagline?: boolean
  showText?: boolean
  to?: string
  className?: string
}

export default function Logo({
  light = false,
  variant,
  showTagline = false,
  showText = true,
  to = '/',
  className = '',
}: LogoProps) {

  const dark = variant
    ? variant === 'dark'
    : light

  return (
    <Link
      to={to}
      aria-label={`${BRAND.name} home`}
      className={`inline-flex items-center gap-3 ${className}`}
    >

      <img
        src={BRAND.logo}
        alt=""
        width={44}
        height={44}
        className="h-11 w-11 shrink-0 rounded-xl"
      />

      {showText && (
        <div>

          <span
            className={`font-display text-xl font-extrabold tracking-tight ${
              dark
                ? 'text-white'
                : 'text-[#123C35]'
            }`}
          >
            Ujuzi
            <span
              className={
                dark
                  ? 'text-[#D5F76A]'
                  : 'text-[#16826B]'
              }
            >
              Link
            </span>
          </span>

          {showTagline && (
            <p
              className={`mt-0.5 text-xs ${
                dark
                  ? 'text-white/60'
                  : 'text-slate-500'
              }`}
            >
              {BRAND.tagline}
            </p>
          )}

        </div>
      )}

    </Link>
  )
}
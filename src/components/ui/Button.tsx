import type { ButtonHTMLAttributes } from 'react'
import { LoaderCircle } from 'lucide-react'
import { cn } from '../../lib/utils'

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const variants = {
  primary:
    'bg-primary text-white hover:bg-brand-600',
  secondary:
    'bg-accent text-primary-dark hover:bg-lime-300',
  outline:
    'border border-border bg-surface hover:bg-brand-50',
  ghost:
    'hover:bg-brand-50 text-ink',
  danger:
    'bg-danger text-white hover:bg-red-800',
}

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-6 text-base',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
      className={cn(
        'inline-flex items-center justify-center gap-2',
        'rounded-button font-medium transition-colors',
        'disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {loading && (
        <LoaderCircle
          size={18}
          className="animate-spin"
          aria-hidden="true"
        />
      )}

      {children}
    </button>
  )
}
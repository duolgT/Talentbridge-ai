import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  description: string
  icon: LucideIcon
}

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: StatCardProps) {
  return (
    <article className="surface-card">

      <div className="flex items-center justify-between gap-3">

        <p className="text-sm font-medium text-muted">
          {title}
        </p>

        <div className="rounded-xl bg-brand-50 p-3">
          <Icon className="text-primary" size={22} />
        </div>

      </div>

      <p className="mt-4 font-display text-3xl font-extrabold">
        {value}
      </p>

      <p className="mt-2 text-xs text-muted">
        {description}
      </p>

    </article>
  )
}
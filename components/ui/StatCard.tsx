'use client'

interface StatCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  variant?: 'default' | 'dark' | 'accent' | 'success' | 'warning' | 'danger'
  className?: string
}

const variantClasses = {
  default: 'bg-white border-neutral-300 text-neutral-900',
  dark: 'bg-neutral-950 border-neutral-700 text-neutral-50',
  accent: 'bg-primary-500 border-primary-600 text-white',
  success: 'bg-success-50 border-success-100 text-success-600',
  warning: 'bg-warning-100 border-warning-200 text-warning-600',
  danger: 'bg-danger-50 border-danger-200 text-danger-600',
}

export function StatCard({
  label,
  value,
  icon,
  variant = 'default',
  className = '',
}: StatCardProps) {
  return (
    <div
      className={[
        'border rounded-card p-5 flex flex-col justify-between h-full',
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      <div className="flex items-start justify-between">
        <div className="text-tiny uppercase tracking-wider opacity-70 font-semibold">{label}</div>
        {icon && <div className="ml-auto text-xl flex-shrink-0">{icon}</div>}
      </div>
      <div className="text-mono-md mt-3 font-semibold">{value}</div>
    </div>
  )
}

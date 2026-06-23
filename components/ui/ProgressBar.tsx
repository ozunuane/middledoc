'use client'

interface ProgressBarProps {
  value: number // 0–100
  label?: string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  color?: 'primary' | 'success' | 'warning' | 'danger'
  className?: string
}

const sizeClasses = {
  sm: 'h-1',
  md: 'h-1.5',
  lg: 'h-2',
}

const trackClasses = {
  sm: 'h-1 bg-neutral-200',
  md: 'h-1.5 bg-neutral-200',
  lg: 'h-2 bg-neutral-200',
}

const fillClasses = {
  primary: 'bg-primary-500',
  success: 'bg-success-600',
  warning: 'bg-warning-600',
  danger: 'bg-danger-600',
}

export function ProgressBar({
  value,
  label,
  size = 'md',
  showLabel = false,
  color = 'primary',
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min(Math.max(value, 0), 100)

  return (
    <div className={className}>
      {showLabel && label && (
        <div className="flex justify-between mb-2">
          <span className="text-label font-semibold text-neutral-900">{label}</span>
          <span className="text-caption text-neutral-500">{percentage}%</span>
        </div>
      )}
      <div className={`w-full rounded-full overflow-hidden ${trackClasses[size]}`}>
        <div
          className={`h-full ${fillClasses[color]} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label}
        />
      </div>
    </div>
  )
}

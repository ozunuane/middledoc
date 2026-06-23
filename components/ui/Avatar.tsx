'use client'

interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'primary' | 'success' | 'warning'
  className?: string
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
}

const variantClasses = {
  default: 'bg-neutral-200 text-neutral-700',
  primary: 'bg-primary-100 text-primary-700',
  success: 'bg-success-100 text-success-700',
  warning: 'bg-warning-100 text-warning-700',
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function Avatar({ name, size = 'md', variant = 'default', className = '' }: AvatarProps) {
  const initials = getInitials(name)

  return (
    <div
      className={[
        'rounded-full flex items-center justify-center font-semibold flex-shrink-0',
        sizeClasses[size],
        variantClasses[variant],
        className,
      ].join(' ')}
      title={name}
      aria-label={name}
    >
      {initials}
    </div>
  )
}

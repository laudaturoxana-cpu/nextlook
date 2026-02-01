import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'gold' | 'new' | 'sale' | 'stock' | 'default'
  className?: string
  pulse?: boolean
}

export function Badge({ children, variant = 'default', className, pulse }: BadgeProps) {
  const variants = {
    gold: 'bg-gold text-white',
    new: 'bg-gold text-white',
    sale: 'bg-red-500 text-white',
    stock: 'bg-orange-500 text-white',
    default: 'bg-cream-100 text-text',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 text-xs font-body font-bold uppercase tracking-wider rounded-full',
        variants[variant],
        pulse && 'animate-pulse-gold',
        className
      )}
    >
      {children}
    </span>
  )
}

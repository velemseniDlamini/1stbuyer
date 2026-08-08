import { ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Logo({
  className,
  showText = true,
}: {
  className?: string
  showText?: boolean
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground gold-glow">
        <ShieldCheck className="size-5" />
      </span>
      {showText && (
        <span className="text-base font-bold tracking-tight">
          1st <span className="text-primary">Buyer</span>
        </span>
      )}
    </div>
  )
}

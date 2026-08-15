import Image from 'next/image'
import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/logo-wordmark.png"
      alt="1st Buyer"
      width={393}
      height={241}
      priority
      className={cn('h-8 w-auto', className)}
    />
  )
}

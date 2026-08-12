'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Map, MessageCircle, Compass, User, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/contexts/language-context'

const navItems = [
  { href: '/', key: 'nav.home', icon: Home },
  { href: '/journey', key: 'nav.journey', icon: Map },
  { href: '/explore', key: 'nav.explore', icon: Compass },
  { href: '/profile', key: 'nav.profile', icon: User },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { t } = useLanguage()

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background md:my-6 md:min-h-[calc(100dvh-3rem)] md:rounded-3xl md:border md:border-border md:shadow-2xl md:overflow-hidden">
      <main className="flex-1 pb-28">{children}</main>

      {/* Bottom navigation */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-border bg-card/90 backdrop-blur-xl md:absolute md:rounded-b-3xl"
      >
        <div className="relative grid grid-cols-5 items-center px-2 py-2">
          {navItems.slice(0, 2).map((item) => (
            <NavLink key={item.href} href={item.href} icon={item.icon} label={t(item.key)} active={pathname === item.href} />
          ))}

          {/* Guardian FAB */}
          <div className="flex items-center justify-center">
            <Link
              href="/chat"
              aria-label="Ask Guardian"
              className={cn(
                'flex size-14 -translate-y-4 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg gold-glow transition-transform active:scale-95',
                pathname === '/chat' && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
              )}
            >
              <span className="relative">
                <ShieldCheck className="size-6" />
                <span className="absolute -right-1 -top-1 size-2.5 animate-pulse rounded-full bg-success" />
              </span>
            </Link>
          </div>

          {navItems.slice(2).map((item) => (
            <NavLink key={item.href} href={item.href} icon={item.icon} label={t(item.key)} active={pathname === item.href} />
          ))}
        </div>
      </nav>
    </div>
  )
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string
  label: string
  icon: typeof Home
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex flex-col items-center gap-1 rounded-lg py-1 text-[11px] font-medium transition-colors',
        active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      <Icon className="size-5" />
      {label}
    </Link>
  )
}

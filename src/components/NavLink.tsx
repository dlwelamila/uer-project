"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type Props = {
  href: string
  children: React.ReactNode
  classNameOverride?: 'secondary-nav'
}

export function NavLink({ href, children, classNameOverride }: Props) {
  const pathname = usePathname()
  const isActive =
    href === '/'
      ? pathname === '/'
      : pathname === href || pathname.startsWith(`${href}/`)

  const baseClasses =
    'rounded-full px-4 py-1.5 text-sm font-medium transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-100'
  const secondaryInactive =
    'text-slate-100 hover:bg-white hover:text-slate-900 hover:shadow-[0_10px_24px_-12px_rgba(255,255,255,0.75)]'
  const defaultInactive = 'text-slate-200 hover:text-white hover:bg-white/10'

  const activeClasses = isActive
    ? 'bg-white text-slate-900 shadow-[0_4px_14px_-6px_rgba(255,255,255,0.6)]'
    : classNameOverride === 'secondary-nav'
    ? secondaryInactive
    : defaultInactive

  return (
    <Link href={href} aria-current={isActive ? 'page' : undefined} className={`${baseClasses} ${activeClasses}`}>
      {children}
    </Link>
  )
}

"use client"

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

type SupportLink = {
  href: string
  label: string
}

type Props = {
  items: SupportLink[]
}

const itemBaseClasses =
  'rounded-full px-4 py-1.5 text-sm font-medium transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-100'

export function SupportCenterMenu({ items }: Props) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  const isActive = items.some((item) =>
    item.href === '/'
      ? pathname === '/'
      : pathname === item.href || pathname.startsWith(`${item.href}/`)
  )

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      window.addEventListener('mousedown', handleClick)
    }

    return () => window.removeEventListener('mousedown', handleClick)
  }, [open])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const buttonClasses = isActive
    ? 'bg-white text-slate-900 shadow-[0_10px_24px_-12px_rgba(255,255,255,0.65)]'
    : 'text-slate-200 hover:bg-white/80 hover:text-slate-900 hover:shadow-[0_10px_24px_-12px_rgba(255,255,255,0.75)]'

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        className={`${itemBaseClasses} ${buttonClasses} flex items-center gap-1`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        Support Center
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 7.5 10 12.5 15 7.5" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Support Center"
          className="absolute left-0 top-full z-50 mt-2 min-w-[14rem] rounded-2xl border border-white/10 bg-[#101f39] p-2 shadow-[0_16px_30px_-12px_rgba(11,21,38,0.65)]"
        >
          <div className="flex flex-col gap-1">
            {items.map((item) => {
              const active =
                item.href === '/'
                  ? pathname === '/'
                  : pathname === item.href || pathname.startsWith(`${item.href}/`)

              const itemClasses = active
                ? 'bg-white text-slate-900 shadow-[0_10px_24px_-12px_rgba(255,255,255,0.65)]'
                : 'text-slate-200 hover:bg-white hover:text-slate-900 hover:shadow-[0_10px_24px_-12px_rgba(255,255,255,0.7)]'

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${itemClasses}`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

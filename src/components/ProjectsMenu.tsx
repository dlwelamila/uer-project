"use client"

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type MenuLink = {
  href: string
  label: string
  description?: string
}

type Props = {
  items: MenuLink[]
}

const baseButtonClasses =
  'rounded-full px-4 py-1.5 text-sm font-medium transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-100'

export function ProjectsMenu({ items }: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const menuRef = useRef<HTMLDivElement>(null)

  const isActive = items.some((item) =>
    item.href === '/projects'
      ? pathname === '/projects'
      : pathname === item.href || pathname.startsWith(`${item.href}/`)
  )

  useEffect(() => {
    if (!open) return
    function handleClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    window.addEventListener('mousedown', handleClick)
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
        className={`${baseButtonClasses} ${buttonClasses} flex items-center gap-2`}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        Projects
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
          aria-label="Projects"
          className="absolute left-0 top-full z-50 mt-2 min-w-[17rem] rounded-2xl border border-white/10 bg-[#0c1a30] p-3 shadow-[0_20px_40px_-20px_rgba(7,19,39,0.7)] backdrop-blur-sm"
        >
          <div className="grid gap-2">
            {items.map((item) => {
              const active =
                item.href === '/projects'
                  ? pathname === '/projects'
                  : pathname === item.href || pathname.startsWith(`${item.href}/`)

              const itemClasses = active
                ? 'bg-white text-slate-900 shadow-[0_14px_30px_-14px_rgba(255,255,255,0.7)]'
                : 'text-slate-200 hover:bg-white hover:text-slate-900 hover:shadow-[0_14px_30px_-14px_rgba(255,255,255,0.65)]'

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-xl px-3 py-2 text-sm transition-colors ${itemClasses}`}
                  role="menuitem"
                >
                  <div className="font-semibold">{item.label}</div>
                  {item.description ? (
                    <p className="mt-1 text-xs text-slate-500">{item.description}</p>
                  ) : null}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

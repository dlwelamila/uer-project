import './globals.css'
import { NavLink } from '@/components/NavLink'
import { SupportCenterMenu } from '@/components/SupportCenterMenu'

export const metadata = { title: 'Unified Enterprise Report (UER)' }

const SUPPORT_CENTER_LINKS = [
  { href: '/incidents', label: 'Incidents' },
  { href: '/health/code-currency', label: 'Health & Risk Analysis' },
  { href: '/contracts-review', label: 'Contracts Review' },
  { href: '/risk-register', label: 'Risk Register' },
  { href: '/standard-information', label: 'Standard Information' },
  { href: '/action-summary', label: 'Action Summary' },
  { href: '/sessions/new', label: 'New Session' },
]

const SECONDARY_NAV = [
  { href: '/projects', label: 'Projects' },
  { href: '/competency', label: 'Competency' },
  { href: '/finance', label: 'Finance' },
  { href: '/sales-marketing', label: 'Sales & Marketing' },
  { href: '/project-history-trends', label: 'Project History & Trends' },
  { href: '/settings', label: 'Settings' },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-gray-50 text-gray-900">
        <header className="relative z-40 bg-[#0b1526] text-white shadow-[0_6px_16px_rgba(8,23,46,0.35)]">
          <div className="site-shell flex flex-wrap items-center justify-between gap-4 py-3 sm:py-4">
            <CombinedLogo className="h-16 w-auto" />
            <nav className="ml-auto flex items-center gap-3 rounded-full border border-white/10 bg-white/6 px-6 py-2 backdrop-blur-sm">
              <NavLink href="/">
                <HomeGlyph />
              </NavLink>
              <SupportCenterMenu items={SUPPORT_CENTER_LINKS} />
              {SECONDARY_NAV.map((item) => (
                <NavLink key={item.href} href={item.href} classNameOverride="secondary-nav">
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </header>
        <main className="site-shell site-main">{children}</main>
      </body>
    </html>
  )
}

function CombinedLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 220 80"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="UER logo"
    >
      <defs>
        <linearGradient id="uer-bars" x1="0" y1="60" x2="0" y2="5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0b6edc" />
          <stop offset="1" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id="uer-text" x1="95" y1="10" x2="170" y2="10" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4cc3ff" />
          <stop offset="1" stopColor="#0fe29f" />
        </linearGradient>
      </defs>
      <g transform="translate(0 10)">
        <path d="M6 48c12 14 38 18 56 3" stroke="#0b6edc" strokeWidth="7" strokeLinecap="round" fill="none" />
        <rect x="4" y="28" width="19" height="32" rx="4" fill="url(#uer-bars)" />
        <rect x="30" y="16" width="19" height="44" rx="4" fill="url(#uer-bars)" />
        <rect x="56" y="4" width="19" height="56" rx="4" fill="url(#uer-bars)" />
      </g>
      <text
        x="95"
        y="46"
        fontSize="44"
        fontWeight="700"
        fill="url(#uer-text)"
        fontFamily="Segoe UI, Helvetica, Arial, sans-serif"
      >
        UER
      </text>
    </svg>
  )
}

function HomeGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v9h5v-5h4v5h5v-9" />
    </svg>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IncidentsFiltersProvider, REPORT_TYPES, useIncidentsFilters } from '@/components/IncidentsFilters'

export default function IncidentsLayout({ children }: { children: React.ReactNode }) {
  return (
    <IncidentsFiltersProvider>
      <IncidentsLayoutShell>{children}</IncidentsLayoutShell>
    </IncidentsFiltersProvider>
  )
}

function IncidentsLayoutShell({ children }: { children: React.ReactNode }) {
  const {
    organizations,
    organizationsLoading,
    selectedOrgId,
    setSelectedOrgId,
    reportType,
    setReportType,
    engagements,
    engagementsLoading,
    selectedEngagementId,
    setSelectedEngagementId,
    filtersError,
  } = useIncidentsFilters()
  const path = usePathname()

  const Tab = ({ href, label }: { href: string; label: string }) => {
    const active = path?.startsWith(href)
    return (
      <Link
        href={href}
        className={`rounded px-3 py-1.5 text-sm ${
          active ? 'bg-blue-600 text-white' : 'border bg-white text-slate-700'
        }`}
      >
        {label}
      </Link>
    )
  }

  if (organizationsLoading) {
    return <div className="rounded-lg bg-white p-4 shadow">Loading customers...</div>
  }

  if (!organizations.length) {
    return (
      <div className="rounded-lg bg-white p-4 shadow">
        <h1 className="mb-2 text-lg font-semibold">Incidents</h1>
        <p className="text-sm text-slate-700">
          No customers found. Add organizations before reviewing incidents.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm">
        <div className="flex items-center gap-2">
          <label className="text-slate-600">Customer:</label>
          <select
            className="h-8 rounded-md border border-slate-300 px-2 leading-none"
            value={selectedOrgId}
            onChange={(event) => setSelectedOrgId(event.target.value)}
          >
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-slate-600">Interval:</label>
          <select
            className="h-8 rounded-md border border-slate-300 px-2 leading-none"
            value={reportType}
            onChange={(event) => setReportType(event.target.value as (typeof REPORT_TYPES)[number]['value'])}
          >
            {REPORT_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-slate-600">Published period:</label>
          <select
            className="h-8 rounded-md border border-slate-300 px-2 leading-none"
            value={selectedEngagementId}
            onChange={(event) => setSelectedEngagementId(event.target.value)}
            disabled={!engagements.length}
          >
            {engagements.map((eng) => (
              <option key={eng.id} value={eng.id}>
                {formatPeriodRange(eng.periodStart, eng.periodEnd)} {'·'} {eng.status}
              </option>
            ))}
          </select>
        </div>

        {engagementsLoading && <span className="text-xs text-slate-500">Loading engagements…</span>}
      </div>

      <div className="text-xs text-slate-500">
        Only engagements marked as Published appear here. Use the Guided Capture flow to edit the data and publish the period.
      </div>

      {filtersError && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {filtersError}
        </div>
      )}

      <div className="flex gap-2 print:hidden">
        <Tab href="/incidents/dashboard" label="Incident Dashboard" />
        <Tab href="/incidents/major" label="Major Incidents" />
      </div>

      {children}
    </div>
  )
}

function formatPeriodRange(startISO: string, endISO: string) {
  if (!startISO) return 'Period not set'
  const start = new Date(startISO)
  const end = endISO ? new Date(endISO) : start
  if (Number.isNaN(start.getTime())) return 'Period not set'
  const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const startLabel = formatter.format(start)
  const endLabel = Number.isNaN(end.getTime()) ? startLabel : formatter.format(end)
  return startLabel === endLabel ? startLabel : `${startLabel} – ${endLabel}`
}

import { useEffect } from 'react'
import { REPORT_TYPES } from '@/components/IncidentsFilters'

type ReportsFiltersBarProps = {
  organizations: Array<{ id: string; name: string }>
  organizationsLoading: boolean
  selectedOrgId: string
  setSelectedOrgId: (value: string) => void
  reportType: (typeof REPORT_TYPES)[number]['value']
  setReportType: (value: (typeof REPORT_TYPES)[number]['value']) => void
  engagements: Array<{ id: string; periodStart: string; periodEnd: string; status: string }>
  engagementsLoading: boolean
  selectedEngagementId: string
  setSelectedEngagementId: (value: string) => void
  filtersError: string | null
  setFiltersError: (message: string | null) => void
}

export function ReportsFiltersBar({
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
  setFiltersError,
}: ReportsFiltersBarProps) {
  useEffect(() => {
    if (filtersError) {
      const timer = window.setTimeout(() => setFiltersError(null), 4000)
      return () => window.clearTimeout(timer)
    }
    return undefined
  }, [filtersError, setFiltersError])

  return (
    <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="flex items-center gap-2">
          <span className="text-slate-600">Customer:</span>
          <select
            className="rounded border border-slate-300 px-2 py-1"
            value={selectedOrgId}
            onChange={(event) => setSelectedOrgId(event.target.value)}
            disabled={organizationsLoading}
          >
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <span className="text-slate-600">Interval:</span>
          <select
            className="rounded border border-slate-300 px-2 py-1"
            value={reportType}
            onChange={(event) => setReportType(event.target.value as (typeof REPORT_TYPES)[number]['value'])}
          >
            {REPORT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <span className="text-slate-600">Engagement:</span>
          <select
            className="rounded border border-slate-300 px-2 py-1"
            value={selectedEngagementId}
            onChange={(event) => setSelectedEngagementId(event.target.value)}
            disabled={engagementsLoading || !engagements.length}
          >
            {engagements.map((eng) => (
              <option key={eng.id} value={eng.id}>
                {eng.periodStart.slice(0, 10)} - {eng.periodEnd.slice(0, 10)} ({eng.status})
              </option>
            ))}
          </select>
        </label>
        {engagementsLoading && <span className="text-xs text-slate-500">Loading engagements...</span>}
      </div>
      {filtersError && (
        <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">{filtersError}</div>
      )}
    </div>
  )
}

import { Fragment } from 'react'
import type { MajorIncidentDraft } from './MajorIncidentsForm'

export type MajorIncidentSummary = {
  total: number
  open: number
  resolved: number
  closed: number
  other: number
  lastUpdated: string | null
}

type Props = {
  incidents: MajorIncidentDraft[]
  summary?: MajorIncidentSummary | null
}

const TABLE_HEADERS = [
  'System',
  'SN#',
  'Installed Code Level',
  'Problem Summary',
  'Created Date',
  'Resolution Date',
  'Closed Date',
  'Status',
] as const

function displayOrDash(value: string | null | undefined) {
  const trimmed = value?.trim()
  return trimmed && trimmed.length ? trimmed : '--'
}

function formatStatus(value: string) {
  if (!value) return '--'
  const trimmed = value.trim()
  if (!trimmed.length) return '--'
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

function formatDate(value: string | null | undefined) {
  if (!value) return '--'
  const parsed = new Date(`${value}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function MajorIncidentsShowcase({ incidents, summary }: Props) {
  const headline = summary?.total
    ? `Major Incidents Detail - ${summary.total} ${summary.total === 1 ? 'Case' : 'Cases'} Reported for the Period in Review`
    : 'Major Incidents Detail - No Major Incidents Reported for the Period in Review'

  const subline = summary?.lastUpdated
    ? `Details on major incidents during the reporting period. Last updated ${summary.lastUpdated}.`
    : 'Details on major incidents during the reporting period.'

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
      <header className="border-b border-slate-300 bg-[#f5f7fb] px-6 pt-6 pb-3">
        <h2 className="text-sm font-semibold text-[#123b88]">{headline}</h2>
        <p className="mt-1 text-xs text-slate-600">{subline}</p>
      </header>
      <div className="h-1 bg-[#d68933]" />

      <div className="overflow-x-auto px-6 py-5">
        <table className="min-w-full border border-slate-300 text-sm text-slate-800">
          <thead className="bg-[#eceff3] text-xs font-semibold uppercase tracking-wide text-slate-700">
            <tr>
              {TABLE_HEADERS.map((label) => (
                <th key={label} scope="col" className="border border-slate-300 px-3 py-2 text-left">
                  {label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {incidents.map((incident, index) => {
              const isLast = index === incidents.length - 1
              return (
                <Fragment key={incident.id ?? `incident-${index}`}>
                  <tr className="bg-white">
                    <td className="border border-slate-300 px-3 py-3 font-semibold text-slate-900">
                      {displayOrDash(incident.system)}
                    </td>
                    <td className="border border-slate-300 px-3 py-3">{displayOrDash(incident.sn)}</td>
                    <td className="border border-slate-300 px-3 py-3">{displayOrDash(incident.codeLevel)}</td>
                    <td className="border border-slate-300 px-3 py-3">{displayOrDash(incident.summary)}</td>
                    <td className="border border-slate-300 px-3 py-3">{formatDate(incident.createdAt)}</td>
                    <td className="border border-slate-300 px-3 py-3">{formatDate(incident.resolvedAt)}</td>
                    <td className="border border-slate-300 px-3 py-3">{formatDate(incident.closedAt)}</td>
                    <td className="border border-slate-300 px-3 py-3">{formatStatus(incident.status)}</td>
                  </tr>

                  <tr className="bg-[#f9fafb] text-slate-700">
                    <th
                      scope="row"
                      className="border border-slate-300 bg-[#eceff3] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600"
                    >
                      Impact
                    </th>
                    <td className="border border-slate-300 px-3 py-2" colSpan={7}>
                      {displayOrDash(incident.impact)}
                    </td>
                  </tr>

                  <tr className="bg-[#f9fafb] text-slate-700">
                    <th
                      scope="row"
                      className="border border-slate-300 bg-[#eceff3] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600"
                    >
                      Resolution
                    </th>
                    <td className="border border-slate-300 px-3 py-2" colSpan={4}>
                      {displayOrDash(incident.resolution)}
                    </td>
                    <th
                      scope="row"
                      className="border border-slate-300 bg-[#eceff3] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600"
                    >
                      Recommendations
                    </th>
                    <td className="border border-slate-300 px-3 py-2" colSpan={2}>
                      {displayOrDash(incident.recommendation)}
                    </td>
                  </tr>

                  {!isLast && (
                    <tr>
                      <td colSpan={8} className="border-t-2 border-slate-300 bg-white py-2" />
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

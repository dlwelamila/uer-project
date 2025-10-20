'use client'

import { useEffect, useMemo, useState } from 'react'
import type { MajorIncidentDraft } from '@/components/MajorIncidentsForm'
import { MajorIncidentsShowcase } from '@/components/MajorIncidentsShowcase'
import { useIncidentsFilters } from '@/components/IncidentsFilters'

function toDateInput(value: string | Date | null | undefined) {
  if (!value) return ''
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date?.getTime?.())) return ''
  return date.toISOString().slice(0, 10)
}

function formatDisplayDate(value: string | null | undefined) {
  if (!value) return null
  const parsed = new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function normalizeIncident(row: any): MajorIncidentDraft {
  return {
    id: row?.id ? String(row.id) : undefined,
    system: (row?.systemName ?? row?.system ?? '').trim(),
    sn: (row?.sn ?? row?.srNumber ?? '').trim(),
    codeLevel: (row?.codeLevel ?? '').trim(),
    summary: (row?.summary ?? '').trim(),
    createdAt: toDateInput(row?.createdAt) ?? '',
    resolvedAt: toDateInput(row?.resolvedAt ?? row?.resolutionDate) ?? '',
    closedAt: toDateInput(row?.closedAt) ?? '',
    status: (row?.status ?? '').trim(),
    impact: (row?.impact ?? '').trim(),
    resolution: (row?.resolution ?? '').trim(),
    recommendation: (row?.recommendation ?? '').trim(),
  }
}

export default function MajorIncidentsPage() {
  const {
    selectedEngagementId,
    periodLabel,
    reportTypeLabel,
    currentEngagement,
    engagementsLoading,
  } = useIncidentsFilters()

  const [incidents, setIncidents] = useState<MajorIncidentDraft[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedEngagementId) {
      setIncidents([])
      setLoading(false)
      return
    }

    let cancelled = false
    async function loadIncidents() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/incidents?engagementId=${encodeURIComponent(selectedEngagementId)}`)
        if (!res.ok) throw new Error(`Failed to load incidents (${res.status})`)
        const rows = await res.json()
        if (!cancelled) {
          const drafts = Array.isArray(rows) ? rows.map(normalizeIncident) : []
          setIncidents(drafts)
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err)
          setError('Unable to load major incidents for this engagement.')
          setIncidents([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadIncidents()
    return () => {
      cancelled = true
    }
  }, [selectedEngagementId])

  const hasIncidents = incidents.length > 0
  const incidentRows = useMemo(() => incidents, [incidents])
  const summary = useMemo(() => {
    if (!incidents.length) return null

    const normalizeStatus = (value: string | undefined) => value?.toLowerCase().trim() ?? ''

    const counts = incidents.reduce(
      (acc, incident) => {
        const status = normalizeStatus(incident.status)
        if (status.includes('open') && !status.includes('closed')) {
          acc.open += 1
        } else if (status.includes('closed')) {
          acc.closed += 1
        } else if (status.includes('resolved')) {
          acc.resolved += 1
        } else {
          acc.other += 1
        }
        return acc
      },
      { open: 0, resolved: 0, closed: 0, other: 0 },
    )

    const latest = incidents.reduce<Date | null>((acc, incident) => {
      const candidates = [incident.closedAt, incident.resolvedAt, incident.createdAt]
        .map((value) => (value ? new Date(`${value}T00:00:00Z`) : null))
        .filter((date): date is Date => Boolean(date) && !Number.isNaN(date.getTime()))

      const newest = candidates.reduce<Date | null>((prev, current) => {
        if (!prev) return current
        return current.getTime() > prev.getTime() ? current : prev
      }, null)

      if (!acc) return newest
      if (!newest) return acc
      return newest.getTime() > acc.getTime() ? newest : acc
    }, null)

    const lastUpdatedDay = latest ? latest.toISOString().slice(0, 10) : null

    return {
      total: incidents.length,
      ...counts,
      lastUpdated: formatDisplayDate(lastUpdatedDay),
    }
  }, [incidents])

  if (engagementsLoading && !selectedEngagementId) {
    return <div className="rounded-lg bg-white p-4 shadow">Loading engagements…</div>
  }

  if (!selectedEngagementId) {
    return (
      <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
        Select a published engagement to view major incidents.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {currentEngagement && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white/95 px-5 py-4 text-sm text-slate-600 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xs uppercase tracking-wide text-slate-500">Engagement Window</h2>
              <p className="mt-1 text-lg font-semibold text-slate-900">{periodLabel}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                Interval: {reportTypeLabel}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                  currentEngagement.status === 'Published'
                    ? 'bg-emerald-500/15 text-emerald-600'
                    : 'bg-amber-500/15 text-amber-700'
                }`}
              >
                Status: {currentEngagement.status}
              </span>
            </div>
          </div>
        </section>
      )}

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && <div className="rounded-lg bg-white p-4 shadow">Loading incidents…</div>}

      {!loading && !hasIncidents && (
        <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
          No major incidents captured for this engagement.
        </div>
      )}

      {!loading && hasIncidents && <MajorIncidentsShowcase incidents={incidentRows} summary={summary} />}
    </div>
  )
}

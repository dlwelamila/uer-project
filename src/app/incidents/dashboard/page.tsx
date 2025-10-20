'use client'

import { useEffect, useMemo, useState } from 'react'
import IncidentDashboard from '@/components/IncidentDashboard'
import {
  CHANNEL_ORDER,
  DEFAULT_CHANNEL_SPLIT,
  DEFAULT_KEY_NOTES,
  DEFAULT_SEVERITY_SPLIT,
  DEFAULT_SPARE_PARTS,
  DEFAULT_TOP_PRODUCTS,
  DEFAULT_TREND_POINTS,
  cloneChannelSplit,
  cloneKeyNotes,
  cloneSeveritySplit,
  cloneSpareParts,
  cloneTopProducts,
  cloneTrendPoints,
  type DashboardSummary,
} from '@/lib/dashboard'
import { useIncidentsFilters } from '@/components/IncidentsFilters'

const SEVERITY_ORDER = ['S1', 'S2', 'S3', 'S5'] as const
const CHANNEL_ORDER_SET = new Set<string>(CHANNEL_ORDER)

function withSummaryFallback(summary?: Partial<DashboardSummary>): DashboardSummary {
  return {
    topProducts: summary?.topProducts?.length
      ? cloneTopProducts(summary.topProducts)
      : cloneTopProducts(DEFAULT_TOP_PRODUCTS),
    trend: summary?.trend?.length
      ? cloneTrendPoints(summary.trend)
      : cloneTrendPoints(DEFAULT_TREND_POINTS),
    severity: summary?.severity?.length
      ? cloneSeveritySplit(summary.severity)
      : cloneSeveritySplit(DEFAULT_SEVERITY_SPLIT),
    channels: summary?.channels?.length
      ? cloneChannelSplit(summary.channels)
      : cloneChannelSplit(DEFAULT_CHANNEL_SPLIT),
    keyNotes: summary?.keyNotes?.length
      ? cloneKeyNotes(summary.keyNotes)
      : cloneKeyNotes(DEFAULT_KEY_NOTES),
    spareParts: summary?.spareParts?.length
      ? cloneSpareParts(summary.spareParts)
      : cloneSpareParts(DEFAULT_SPARE_PARTS),
  }
}

export default function IncidentsDashboardPage() {
  const {
    selectedEngagementId,
    engagementsLoading,
    periodLabel,
    reportTypeLabel,
    currentEngagement,
  } = useIncidentsFilters()

  const [summaryLoading, setSummaryLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<DashboardSummary | null>(null)

  useEffect(() => {
    if (!selectedEngagementId) {
      setSummary(null)
      setSummaryLoading(false)
      return
    }

    let cancelled = false
    async function loadSummary() {
      setSummaryLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/dashboard-summary?engagementId=${encodeURIComponent(selectedEngagementId)}`)
        if (!res.ok) throw new Error(`Failed to load summary (${res.status})`)
        const payload: Partial<DashboardSummary> = await res.json()
        if (cancelled) return
        const next = withSummaryFallback(payload)
        setSummary(next)
      } catch (err) {
        if (!cancelled) {
          console.error(err)
          setError('Unable to load dashboard summary for this engagement.')
          setSummary(null)
        }
      } finally {
        if (!cancelled) setSummaryLoading(false)
      }
    }

    void loadSummary()
    return () => {
      cancelled = true
    }
  }, [selectedEngagementId])

  const dashboardData = useMemo(() => {
    const base = summary ?? withSummaryFallback()

    const trendPoints = Array.from({ length: 12 }, (_, i) => {
      const point = base.trend.find((entry) => Number(entry.month) === i + 1)
      return {
        month: i + 1,
        value: Number(point?.value ?? 0),
        comparison:
          point?.comparison === undefined || point?.comparison === null
            ? null
            : Number(point.comparison),
        note: point?.note ?? '',
      }
    })

    const severities = SEVERITY_ORDER.map((label) => {
      const match = base.severity.find((slice) => slice.severity === label)
      return { label, value: Number(match?.percent ?? 0) }
    })

    const orderedChannels = CHANNEL_ORDER.map((label) => {
      const match = base.channels.find((row) => row.channel === label)
      return { label, value: Number(match?.percent ?? 0) }
    })
    const extraChannels = base.channels
      .filter((row) => row.channel && !CHANNEL_ORDER_SET.has(row.channel))
      .map((row) => ({ label: row.channel, value: Number(row.percent ?? 0) }))

    return {
      top5: base.topProducts,
      trend: trendPoints,
      severities,
      channels: [...orderedChannels, ...extraChannels],
      notes: base.keyNotes,
      spareParts: base.spareParts,
      periodLabel,
      reportTypeLabel,
    }
  }, [summary, periodLabel, reportTypeLabel])

  if (engagementsLoading && !selectedEngagementId) {
    return <div className="rounded-lg bg-white p-4 shadow">Loading engagements…</div>
  }

  if (!selectedEngagementId) {
    return (
      <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
        Select a published engagement to view dashboard data.
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {currentEngagement && (
        <div className="flex flex-wrap justify-between gap-2 text-sm text-slate-600">
          <span>{periodLabel}</span>
          <span>
            Interval: {reportTypeLabel} {'·'} Status: {currentEngagement.status}
          </span>
        </div>
      )}

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {summaryLoading && <div className="rounded-lg bg-white p-4 shadow">Loading dashboard data…</div>}

      {!summaryLoading && (
        <IncidentDashboard
          top5={dashboardData.top5}
          trend={dashboardData.trend}
          severities={dashboardData.severities}
          channels={dashboardData.channels}
          notes={dashboardData.notes}
          spareParts={dashboardData.spareParts}
          periodLabel={dashboardData.periodLabel}
          reportTypeLabel={reportTypeLabel}
        />
      )}
    </div>
  )
}

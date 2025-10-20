'use client'

import { useEffect, useState } from 'react'
import { useIncidentsFilters } from '@/components/IncidentsFilters'
import { FcoTseTable } from '@/components/FcoTseTable'
import { cloneFcoTseRows, type FcoTseRow } from '@/lib/fco-tse'

export default function FcoTsePage() {
  const { periodLabel, reportTypeLabel, currentEngagement, selectedEngagementId } = useIncidentsFilters()
  const [rows, setRows] = useState<FcoTseRow[]>(cloneFcoTseRows([]))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedEngagementId) {
      setRows(cloneFcoTseRows([]))
      setLoading(false)
      return
    }

    let cancelled = false
    async function loadFcoTse() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/fco-tse?engagementId=${encodeURIComponent(selectedEngagementId)}`)
        if (!res.ok) throw new Error(`Failed to load FCO & TSE detail (${res.status})`)
        const payload = await res.json()
        if (!cancelled) {
          const parsed = Array.isArray(payload?.rows) ? payload.rows : []
          setRows(parsed.map((row: any) => cloneRow(row)))
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err)
          setError('Unable to load FCO & TSE detail for this engagement.')
          setRows(cloneFcoTseRows([]))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadFcoTse()
    return () => {
      cancelled = true
    }
  }, [selectedEngagementId])

  return (
    <div className="space-y-5">
      {currentEngagement && (
        <div className="flex flex-wrap justify-between gap-2 text-sm text-slate-600">
          <span>{periodLabel}</span>
          <span>
            Interval: {reportTypeLabel} - Status: {currentEngagement.status}
          </span>
        </div>
      )}

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      {loading && (
        <div className="rounded border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
          Loading FCO &amp; TSE detail...
        </div>
      )}

      <FcoTseTable rows={rows} emptyMessage="No FCOs or TSEs were captured for this engagement." />
    </div>
  )
}

function cloneRow(entry: any): FcoTseRow {
  return {
    srCreated: String(entry?.srCreated ?? '').trim(),
    fcoId: String(entry?.fcoId ?? '').trim(),
    description: String(entry?.description ?? '').trim(),
    srNumber: String(entry?.srNumber ?? '').trim(),
    severity: String(entry?.severity ?? '').trim(),
    serialNumber: String(entry?.serialNumber ?? '').trim(),
    status: String(entry?.status ?? '').trim(),
    productName: String(entry?.productName ?? '').trim(),
    problemSummary: String(entry?.problemSummary ?? '').trim(),
  }
}

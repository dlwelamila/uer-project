'use client'

import { useEffect, useState } from 'react'
import { useIncidentsFilters } from '@/components/IncidentsFilters'
import { cloneCapacityReview, DEFAULT_CAPACITY_REVIEW, type CapacityReviewSection } from '@/lib/capacity-review'

export default function CapacityReviewPage() {
  const { periodLabel, reportTypeLabel, currentEngagement, selectedEngagementId } = useIncidentsFilters()
  const [section, setSection] = useState<CapacityReviewSection>(cloneCapacityReview(DEFAULT_CAPACITY_REVIEW))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedEngagementId) {
      setSection(cloneCapacityReview(DEFAULT_CAPACITY_REVIEW))
      setLoading(false)
      return
    }

    let cancelled = false
    async function loadCapacityReview() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/capacity-review?engagementId=${encodeURIComponent(selectedEngagementId)}`)
        if (!res.ok) throw new Error(`Failed to load capacity review (${res.status})`)
        const payload = await res.json()
        if (!cancelled) {
          setSection(cloneCapacityReview(payload?.section))
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err)
          setError('Unable to load capacity review for this engagement.')
          setSection(cloneCapacityReview(DEFAULT_CAPACITY_REVIEW))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadCapacityReview()
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
          Loading capacity review...
        </div>
      )}

      <div className="space-y-4 rounded-2xl border border-[#d6dbe7] bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-[#123c73]">{section.title || 'Capacity Review'}</h2>
          {section.summary && <p className="mt-2 text-sm text-[#1f2a44]">{section.summary}</p>}
        </div>

        {!!section.highlightBullets.length && (
          <div className="space-y-2 rounded border border-[#e2e7f2] bg-[#f5f8ff] p-4 text-sm text-[#1f2a44]">
            <h3 className="text-sm font-semibold text-[#123c73]">Highlights</h3>
            <ul className="space-y-2">
              {section.highlightBullets.map((bullet, index) => (
                <li key={index} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#0d5cad]" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full border-collapse text-sm text-[#1f2a44]">
            <thead className="bg-[#f5f8ff] text-xs uppercase tracking-wide text-[#4a5d7a]">
              <tr>
                <th className="px-4 py-3 text-left">System Name</th>
                <th className="px-4 py-3 text-left">Health Score</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {!section.systems.length && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-xs text-[#5b6b7c]">
                    No system health entries recorded for this engagement.
                  </td>
                </tr>
              )}
              {section.systems.map((row, index) => (
                <tr key={index} className="border-t border-[#e2e7f2]">
                  <td className="px-4 py-3">{row.systemName || '-'}</td>
                  <td className="px-4 py-3">{row.healthScore || '-'}</td>
                  <td className="px-4 py-3">{row.status || '-'}</td>
                  <td className="px-4 py-3">{row.remarks || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {section.screenshotCaption && (
          <div className="rounded border border-[#e2e7f2] bg-[#f5f8ff] px-3 py-2 text-xs text-[#4a5d7a]">
            Screenshot: {section.screenshotCaption}
          </div>
        )}
      </div>
    </div>
  )
}

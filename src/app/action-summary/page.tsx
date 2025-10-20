'use client'

import { useEffect, useState } from 'react'
import { IncidentsFiltersProvider, useIncidentsFilters } from '@/components/IncidentsFilters'
import { ReportsFiltersBar } from '@/components/ReportsFiltersBar'
import { cloneActionSummary, DEFAULT_ACTION_SUMMARY, type ActionSummarySection } from '@/lib/action-summary'

export default function ActionSummaryPage() {
  return (
    <IncidentsFiltersProvider>
      <ActionSummaryView />
    </IncidentsFiltersProvider>
  )
}

function ActionSummaryView() {
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
    periodLabel,
    reportTypeLabel,
    currentEngagement,
    filtersError,
    setFiltersError,
  } = useIncidentsFilters()

  const [section, setSection] = useState<ActionSummarySection>(cloneActionSummary(DEFAULT_ACTION_SUMMARY))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedEngagementId) {
      setSection(cloneActionSummary(DEFAULT_ACTION_SUMMARY))
      setLoading(false)
      return
    }

    let cancelled = false
    async function loadActionSummary() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/action-summary?engagementId=${encodeURIComponent(selectedEngagementId)}`)
        if (!res.ok) throw new Error(`Failed to load action summary (${res.status})`)
        const payload = await res.json()
        if (!cancelled) {
          setSection(cloneActionSummary(payload?.section))
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err)
          setError('Unable to load action summary for this engagement.')
          setSection(cloneActionSummary(DEFAULT_ACTION_SUMMARY))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadActionSummary()
    return () => {
      cancelled = true
    }
  }, [selectedEngagementId])

  return (
    <div className="space-y-5">
      <ReportsFiltersBar
        organizations={organizations}
        organizationsLoading={organizationsLoading}
        selectedOrgId={selectedOrgId}
        setSelectedOrgId={setSelectedOrgId}
        reportType={reportType}
        setReportType={setReportType}
        engagements={engagements}
        engagementsLoading={engagementsLoading}
        selectedEngagementId={selectedEngagementId}
        setSelectedEngagementId={setSelectedEngagementId}
        filtersError={filtersError}
        setFiltersError={setFiltersError}
      />

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
          Loading action summary...
        </div>
      )}

      <div className="space-y-4 rounded-2xl border border-[#f0d98a] bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-lg font-semibold text-[#b36b00]">{section.title || 'Action Summary'}</h1>
          {section.summary && <p className="mt-2 text-sm text-[#1f2a44]">{section.summary}</p>}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[880px] w-full border-collapse text-sm text-[#1f2a44]">
            <thead className="bg-[#fff5e6] text-xs uppercase tracking-wide text-[#7a5c00]">
              <tr>
                <th className="px-3 py-2 text-left">Action</th>
                <th className="px-3 py-2 text-left">Owner</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Due Date</th>
                <th className="px-3 py-2 text-left">Notes</th>
              </tr>
            </thead>
            <tbody>
              {!section.rows.length && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-xs text-[#5b6b7c]">
                    No action items captured for this engagement.
                  </td>
                </tr>
              )}
              {section.rows.map((row, index) => (
                <tr key={index} className="border-t border-[#f0d98a]">
                  <td className="px-3 py-2 font-medium text-[#b36b00]">{row.action || '-'}</td>
                  <td className="px-3 py-2">{row.owner || '-'}</td>
                  <td className="px-3 py-2">{row.status || '-'}</td>
                  <td className="px-3 py-2">{row.dueDate || '-'}</td>
                  <td className="px-3 py-2">{row.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

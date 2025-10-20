'use client'

import { useEffect, useState } from 'react'
import { IncidentsFiltersProvider, useIncidentsFilters } from '@/components/IncidentsFilters'
import { ReportsFiltersBar } from '@/components/ReportsFiltersBar'
import { cloneRiskRegister, DEFAULT_RISK_REGISTER, type RiskRegisterSection } from '@/lib/risk-register'

export default function RiskRegisterPage() {
  return (
    <IncidentsFiltersProvider>
      <RiskRegisterView />
    </IncidentsFiltersProvider>
  )
}

function RiskRegisterView() {
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

  const [section, setSection] = useState<RiskRegisterSection>(cloneRiskRegister(DEFAULT_RISK_REGISTER))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedEngagementId) {
      setSection(cloneRiskRegister(DEFAULT_RISK_REGISTER))
      setLoading(false)
      return
    }

    let cancelled = false
    async function loadRiskRegister() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/risk-register?engagementId=${encodeURIComponent(selectedEngagementId)}`)
        if (!res.ok) throw new Error(`Failed to load risk register (${res.status})`)
        const payload = await res.json()
        if (!cancelled) {
          setSection(cloneRiskRegister(payload?.section))
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err)
          setError('Unable to load risk register for this engagement.')
          setSection(cloneRiskRegister(DEFAULT_RISK_REGISTER))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadRiskRegister()
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
          Loading risk register...
        </div>
      )}

      <div className="space-y-4 rounded-2xl border border-[#d6dbe7] bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-lg font-semibold text-[#123c73]">{section.title || 'Risk Register'}</h1>
          {section.summary && <p className="mt-2 text-sm text-[#1f2a44]">{section.summary}</p>}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[960px] w-full border-collapse text-sm text-[#1f2a44]">
            <thead className="bg-[#f5f8ff] text-xs uppercase tracking-wide text-[#4a5d7a]">
              <tr>
                <th className="px-3 py-2 text-left">Risk Category</th>
                <th className="px-3 py-2 text-left">Description</th>
                <th className="px-3 py-2 text-left">Priority</th>
                <th className="px-3 py-2 text-left">DU/DL Prob.</th>
                <th className="px-3 py-2 text-left">Owner</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Due Date</th>
                <th className="px-3 py-2 text-left">Mitigation Plan / Action</th>
              </tr>
            </thead>
            <tbody>
              {!section.rows.length && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-xs text-[#5b6b7c]">
                    No risks captured for this engagement.
                  </td>
                </tr>
              )}
              {section.rows.map((row, index) => (
                <tr key={index} className="border-t border-[#e2e7f2]">
                  <td className="px-3 py-2 font-medium text-[#123c73]">{row.category || '-'}</td>
                  <td className="px-3 py-2 text-[#1f2a44]">{row.description || '-'}</td>
                  <td className="px-3 py-2">{row.priority || '-'}</td>
                  <td className="px-3 py-2">{row.probability || '-'}</td>
                  <td className="px-3 py-2">{row.owner || '-'}</td>
                  <td className="px-3 py-2">{row.status || '-'}</td>
                  <td className="px-3 py-2">{row.dueDate || '-'}</td>
                  <td className="px-3 py-2">{row.mitigation || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

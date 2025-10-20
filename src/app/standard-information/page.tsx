'use client'

import { useEffect, useState } from 'react'
import { IncidentsFiltersProvider, useIncidentsFilters } from '@/components/IncidentsFilters'
import { ReportsFiltersBar } from '@/components/ReportsFiltersBar'
import {
  cloneStandardInformation,
  DEFAULT_STANDARD_INFORMATION,
  type StandardInformationSection,
} from '@/lib/standard-information'

export default function StandardInformationPage() {
  return (
    <IncidentsFiltersProvider>
      <StandardInformationView />
    </IncidentsFiltersProvider>
  )
}

function StandardInformationView() {
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

  const [section, setSection] = useState<StandardInformationSection>(cloneStandardInformation(DEFAULT_STANDARD_INFORMATION))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedEngagementId) {
      setSection(cloneStandardInformation(DEFAULT_STANDARD_INFORMATION))
      setLoading(false)
      return
    }

    let cancelled = false
    async function loadStandardInformation() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/standard-information?engagementId=${encodeURIComponent(selectedEngagementId)}`)
        if (!res.ok) throw new Error(`Failed to load standard information (${res.status})`)
        const payload = await res.json()
        if (!cancelled) {
          setSection(cloneStandardInformation(payload?.section))
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err)
          setError('Unable to load standard information for this engagement.')
          setSection(cloneStandardInformation(DEFAULT_STANDARD_INFORMATION))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadStandardInformation()
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
          Loading standard information...
        </div>
      )}

      <div className="space-y-4 rounded-2xl border border-[#d6dbe7] bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-lg font-semibold text-[#123c73]">{section.title || 'Standard Information'}</h1>
          {section.summary && <p className="mt-2 text-sm text-[#1f2a44]">{section.summary}</p>}
        </div>

        {!!section.contacts.length && (
          <div className="grid gap-4 md:grid-cols-2">
            {section.contacts.map((contact, index) => (
              <div key={index} className="space-y-2 rounded border border-[#e2e7f2] bg-[#f5f8ff] p-4 text-sm text-[#1f2a44]">
                <div className="text-xs font-semibold uppercase tracking-wide text-[#0d5cad]">
                  {contact.tier || `Escalation ${index + 1}`}
                </div>
                <div className="text-base font-semibold">{contact.name || '-'}</div>
                {contact.role && <div className="text-xs text-[#4a5d7a]">{contact.role}</div>}
                <div className="space-y-1 text-xs text-[#1f2a44]">
                  {contact.email && (
                    <div>
                      <span className="font-semibold">Email:</span> {contact.email}
                    </div>
                  )}
                  {contact.phone && (
                    <div>
                      <span className="font-semibold">Phone:</span> {contact.phone}
                    </div>
                  )}
                  {contact.notes && <div>{contact.notes}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {!!section.additionalNotes.length && (
          <div className="space-y-2 rounded border border-[#e2e7f2] bg-[#f5f8ff] p-4 text-xs text-[#1f2a44]">
            <h2 className="text-sm font-semibold text-[#123c73]">Additional Notes</h2>
            <ul className="space-y-2">
              {section.additionalNotes.map((note, index) => (
                <li key={index} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#0d5cad]" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

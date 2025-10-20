'use client'

import { useEffect, useState } from 'react'
import { useIncidentsFilters } from '@/components/IncidentsFilters'
import { cloneAdvisories, DEFAULT_ADVISORIES, type AdvisorySection } from '@/lib/advisories'

export default function AdvisoriesPage() {
  const { periodLabel, reportTypeLabel, currentEngagement, selectedEngagementId } = useIncidentsFilters()
  const [sections, setSections] = useState<AdvisorySection[]>(cloneAdvisories(DEFAULT_ADVISORIES))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedEngagementId) {
      setSections(cloneAdvisories(DEFAULT_ADVISORIES))
      setLoading(false)
      return
    }

    let cancelled = false
    async function loadAdvisories() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/advisories?engagementId=${encodeURIComponent(selectedEngagementId)}`)
        if (!res.ok) throw new Error(`Failed to load advisories (${res.status})`)
        const payload = await res.json()
        if (!cancelled) {
          const parsed = Array.isArray(payload?.sections) ? payload.sections : []
          const incoming = parsed.map((section: any) => cloneSection(section))
          const defaults = cloneAdvisories(DEFAULT_ADVISORIES)
          const normalized =
            incoming.length >= defaults.length
              ? incoming.slice(0, defaults.length)
              : [...incoming, ...defaults.slice(incoming.length)]
          setSections(normalized)
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err)
          setError('Unable to load advisories for this engagement.')
          setSections(cloneAdvisories(DEFAULT_ADVISORIES))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadAdvisories()
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
          Loading advisories...
        </div>
      )}

      {sections.map((section, index) => (
        <div key={index} className="rounded-2xl border border-[#d6dbe7] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#123c73]">{section.title || 'Advisory Section'}</h2>
          {section.subtitle && <p className="mt-1 text-sm font-medium text-[#0d5cad]">{section.subtitle}</p>}
          {section.summary && <p className="mt-3 text-sm text-[#1f2a44]">{section.summary}</p>}
          {!!section.notes.length && (
            <ul className="mt-4 space-y-2 text-sm text-[#1f2a44]">
              {section.notes.map((note, noteIndex) => (
                <li key={noteIndex} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#0d5cad]" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  )
}

function cloneSection(section: any): AdvisorySection {
  return {
    title: String(section?.title ?? '').trim(),
    subtitle: String(section?.subtitle ?? '').trim(),
    summary: String(section?.summary ?? '').trim(),
    notes: Array.isArray(section?.notes)
      ? section.notes.map((note: any) => String(note ?? '').trim()).filter((note: string) => note.length > 0)
      : [],
  }
}

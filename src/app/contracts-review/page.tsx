'use client'

import { useEffect, useMemo, useState } from 'react'
import { IncidentsFiltersProvider, useIncidentsFilters } from '@/components/IncidentsFilters'
import { ReportsFiltersBar } from '@/components/ReportsFiltersBar'
import { cloneContractsReview, DEFAULT_CONTRACTS_REVIEW, type ContractsReviewSection } from '@/lib/contracts-review'

const STATUS_COLORS = ['#d13f1a', '#f28c1a', '#f5cf1a', '#1457b4', '#0f2c62', '#8a8f9a']
const PRODUCT_COLORS = ['#f97316', '#2563eb', '#0f766e', '#7c3aed', '#facc15']

export default function ContractsReviewPage() {
  return (
    <IncidentsFiltersProvider>
      <ContractsReviewView />
    </IncidentsFiltersProvider>
  )
}

function ContractsReviewView() {
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

  const [section, setSection] = useState<ContractsReviewSection>(cloneContractsReview(DEFAULT_CONTRACTS_REVIEW))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedEngagementId) {
      setSection(cloneContractsReview(DEFAULT_CONTRACTS_REVIEW))
      setLoading(false)
      return
    }

    let cancelled = false
    async function loadContracts() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/contracts-review?engagementId=${encodeURIComponent(selectedEngagementId)}`)
        if (!res.ok) throw new Error(`Failed to load contracts review (${res.status})`)
        const payload = await res.json()
        if (!cancelled) {
          setSection(cloneContractsReview(payload?.section))
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err)
          setError('Unable to load contracts review for this engagement.')
          setSection(cloneContractsReview(DEFAULT_CONTRACTS_REVIEW))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadContracts()
    return () => {
      cancelled = true
    }
  }, [selectedEngagementId])

  const statusData = useMemo(
    () =>
      (section.statusHighlights ?? []).map((item, index) => {
        const percentMatch = item.value?.match(/[\d.]+/)
        const percent = percentMatch ? Math.min(Number(percentMatch[0]), 100) : 0
        return {
          label: item.label || 'Status',
          valueLabel: item.value || '',
          percent,
          color: STATUS_COLORS[index % STATUS_COLORS.length],
        }
      }),
    [section.statusHighlights],
  )

  const productData = useMemo(
    () =>
      (section.productHighlights ?? []).map((item, index) => {
        const countMatch = item.value?.match(/[\d.]+/)
        const count = countMatch ? Number(countMatch[0]) : 0
        return {
          label: item.label || 'Product',
          valueLabel: item.value || '',
          count,
          color: PRODUCT_COLORS[index % PRODUCT_COLORS.length],
        }
      }),
    [section.productHighlights],
  )

  return (
    <div className="space-y-6">
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
            Interval: {reportTypeLabel} • Status: {currentEngagement.status}
          </span>
        </div>
      )}

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      {loading && (
        <div className="rounded border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
          Loading contracts review...
        </div>
      )}

      <div className="grid gap-6 rounded-3xl border border-[#c9d5ec] bg-[#f3f6fc] p-6 shadow-xl lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-4 rounded-2xl bg-gradient-to-b from-[#3666b8] to-[#294c83] p-5 text-sm text-slate-100 shadow-lg">
          <h2 className="text-base font-semibold uppercase tracking-wide text-white">Key to Note</h2>
          <ul className="space-y-3">
            {(section.keyNotes?.length ? section.keyNotes : DEFAULT_CONTRACTS_REVIEW.keyNotes).map((note, index) => (
              <li key={index} className="flex gap-2 text-[13px] leading-relaxed">
                <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-white" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </aside>

        <div className="space-y-6 rounded-2xl bg-white p-6 shadow-inner">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200 pb-4">
            <div>
              <h1 className="text-xl font-semibold text-[#123c73]">
                {section.title || 'Support Contracts Status • Current Period'}
              </h1>
              {section.summary && <p className="text-sm text-[#4a5d7a]">{section.summary}</p>}
            </div>
          </div>

          {!!statusData.length && (
            <div className="space-y-4">
              <div className="text-sm font-semibold uppercase tracking-wide text-[#123c73]">
                Renewal Outlook (Percent of Assets)
              </div>
              <div className="rounded-xl border border-[#d7e3f7] bg-[#f8fbff] p-4 shadow-sm">
                <div className="space-y-3">
                  {statusData.map((item) => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-medium text-[#123c73]">
                        <span>{item.label}</span>
                        <span>{item.valueLabel}</span>
                      </div>
                      <div className="relative h-3 rounded-full bg-slate-200/70">
                        <div
                          className="absolute inset-y-0 rounded-full"
                          style={{
                            width: `${Math.min(Math.max(item.percent, 3), 100)}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!!productData.length && (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
              <div className="space-y-3 rounded-xl border border-[#d7e3f7] bg-[#f8fbff] p-4 shadow-sm">
                <div className="text-sm font-semibold uppercase tracking-wide text-[#123c73]">
                  Product Family Coverage
                </div>
                <div className="space-y-2">
                  {productData.map((item) => (
                    <div key={item.label} className="flex items-center gap-3 text-sm text-[#1f2a44]">
                      <div className="h-2 w-10 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="flex-1">{item.label}</span>
                      <span className="text-xs text-[#4a5d7a]">{item.valueLabel}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-[#d7e3f7] bg-[#f8fbff] p-4 text-xs text-[#1f2a44] shadow-sm">
                <div className="flex items-center justify-between text-sm font-semibold text-[#123c73]">
                  <span>Legend</span>
                </div>
                <ul className="mt-3 space-y-2">
                  {statusData.slice(0, 6).map((item) => (
                    <li key={item.label} className="flex items-center gap-2">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs text-[#4a5d7a]">{item.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {section.screenshotCaption && (
            <div className="rounded-xl border border-dashed border-[#c9d5ec] bg-[#f5f7fb] px-4 py-3 text-xs text-[#4a5d7a]">
              {section.screenshotCaption}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

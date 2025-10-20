'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export const REPORT_TYPES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annual', label: 'Annual' },
] as const

type ReportTypeValue = (typeof REPORT_TYPES)[number]['value']

type Organization = { id: string; name: string }
type EngagementOption = {
  id: string
  type: string
  periodStart: string
  periodEnd: string
  status: string
  organizationName?: string | null
}

type IncidentsFiltersContextValue = {
  organizations: Organization[]
  organizationsLoading: boolean
  selectedOrgId: string
  setSelectedOrgId: (value: string) => void

  reportType: ReportTypeValue
  setReportType: (value: ReportTypeValue) => void

  engagements: EngagementOption[]
  engagementsLoading: boolean
  selectedEngagementId: string
  setSelectedEngagementId: (value: string) => void

  periodLabel: string
  reportTypeLabel: string
  currentEngagement: EngagementOption | null

  filtersError: string | null
  setFiltersError: (message: string | null) => void
}

const IncidentsFiltersContext = createContext<IncidentsFiltersContextValue | undefined>(undefined)

export function IncidentsFiltersProvider({ children }: { children: React.ReactNode }) {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [organizationsLoading, setOrganizationsLoading] = useState(true)
  const [selectedOrgId, setSelectedOrgId] = useState<string>('')

  const [reportType, setReportTypeState] = useState<ReportTypeValue>(REPORT_TYPES[0].value)
  const [engagements, setEngagements] = useState<EngagementOption[]>([])
  const [engagementsLoading, setEngagementsLoading] = useState(false)
  const [selectedEngagementId, setSelectedEngagementId] = useState<string>('')

  const [filtersError, setFiltersError] = useState<string | null>(null)

  const clearFiltersError = useCallback(() => setFiltersError(null), [])

  useEffect(() => {
    let cancelled = false
    async function loadOrganizations() {
      setOrganizationsLoading(true)
      setFiltersError(null)
      try {
        const res = await fetch('/api/organizations')
        if (!res.ok) throw new Error(`Failed to load customers (${res.status})`)
        const rows = (await res.json()) as Organization[]
        if (cancelled) return
        setOrganizations(rows ?? [])
        setSelectedOrgId((current) => (current && rows.some((row) => row.id === current) ? current : rows[0]?.id ?? ''))
      } catch (err) {
        if (!cancelled) {
          console.error(err)
          setFiltersError('Unable to load customers.')
          setOrganizations([])
          setSelectedOrgId('')
        }
      } finally {
        if (!cancelled) setOrganizationsLoading(false)
      }
    }

    loadOrganizations()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!selectedOrgId) {
      setEngagements([])
      setSelectedEngagementId('')
      return
    }

    let cancelled = false
    async function loadEngagements() {
      setEngagementsLoading(true)
      clearFiltersError()
      try {
        const params = new URLSearchParams({
          organizationId: selectedOrgId,
          status: 'Published',
        })
        if (reportType) params.set('type', reportType)

        const res = await fetch(`/api/engagements?${params.toString()}`)
        if (!res.ok) throw new Error(`Failed to load engagements (${res.status})`)
        const rows = (await res.json()) as EngagementOption[]
        if (cancelled) return
        setEngagements(rows ?? [])
        const stillSelected = rows?.some((row) => row.id === selectedEngagementId)
        const nextId = stillSelected ? selectedEngagementId : rows?.[0]?.id ?? ''
        setSelectedEngagementId(nextId)
      } catch (err) {
        if (!cancelled) {
          console.error(err)
          setFiltersError('Unable to load published engagements for this selection.')
          setEngagements([])
          setSelectedEngagementId('')
        }
      } finally {
        if (!cancelled) setEngagementsLoading(false)
      }
    }

    void loadEngagements()
    return () => {
      cancelled = true
    }
  }, [selectedOrgId, reportType, selectedEngagementId, clearFiltersError])

  const periodLabel = useMemo(() => {
    if (!selectedEngagementId) return ''
    const engagement = engagements.find((row) => row.id === selectedEngagementId)
    if (!engagement) return ''
    return formatPeriodRange(engagement.periodStart, engagement.periodEnd)
  }, [engagements, selectedEngagementId])

  const currentEngagement = useMemo(
    () => engagements.find((row) => row.id === selectedEngagementId) ?? null,
    [engagements, selectedEngagementId],
  )

  const reportTypeLabel = useMemo(
    () => REPORT_TYPES.find((option) => option.value === reportType)?.label ?? reportType,
    [reportType],
  )

  const contextValue = useMemo<IncidentsFiltersContextValue>(
    () => ({
      organizations,
      organizationsLoading,
      selectedOrgId,
      setSelectedOrgId,
      reportType,
      setReportType: (value: ReportTypeValue) => setReportTypeState(value),
      engagements,
      engagementsLoading,
      selectedEngagementId,
      setSelectedEngagementId,
      periodLabel,
      reportTypeLabel,
      currentEngagement,
      filtersError,
      setFiltersError,
    }),
    [
      organizations,
      organizationsLoading,
      selectedOrgId,
      reportType,
      engagements,
      engagementsLoading,
      selectedEngagementId,
      periodLabel,
      reportTypeLabel,
      currentEngagement,
      filtersError,
    ],
  )

  return <IncidentsFiltersContext.Provider value={contextValue}>{children}</IncidentsFiltersContext.Provider>
}

export function useIncidentsFilters() {
  const context = useContext(IncidentsFiltersContext)
  if (!context) throw new Error('useIncidentsFilters must be used within IncidentsFiltersProvider')
  return context
}

function formatPeriodRange(startISO: string, endISO: string) {
  if (!startISO) return 'Period not set'
  const start = new Date(startISO)
  const end = endISO ? new Date(endISO) : start
  if (Number.isNaN(start.getTime())) return 'Period not set'
  const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const startLabel = formatter.format(start)
  const endLabel = Number.isNaN(end.getTime()) ? startLabel : formatter.format(end)
  return startLabel === endLabel ? startLabel : `${startLabel} – ${endLabel}`
}

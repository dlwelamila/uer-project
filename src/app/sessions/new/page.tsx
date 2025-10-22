/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { WizardStepper, WIZARD_STEPS } from '@/components/WizardStepper'
import { FileDropZone } from '@/components/FileDropZone'
import { TopFiveForm } from '@/components/TopFiveForm'
import { TrendForm } from '@/components/TrendForm'
import { SeverityForm } from '@/components/SeverityForm'
import { ChannelsForm } from '@/components/ChannelsForm'
import { KeyNotesForm } from '@/components/KeyNotesForm'
import { SparePartsForm } from '@/components/SparePartsForm'
import { CodeCurrencyForm } from '@/components/CodeCurrencyForm'
import { ConnectivityCaptureForm } from '@/components/ConnectivityCaptureForm'
import { ConnectivityNotesEditor } from '@/components/ConnectivityNotesEditor'
import { CapacityReviewForm } from '@/components/CapacityReviewForm'
import { ContractsReviewForm } from '@/components/ContractsReviewForm'
import { RiskRegisterForm } from '@/components/RiskRegisterForm'
import { ActionSummaryForm } from '@/components/ActionSummaryForm'
import { StandardInformationForm } from '@/components/StandardInformationForm'
import { FcoTseForm, type FcoTseRowDraft } from '@/components/FcoTseForm'
import { AdvisoriesForm } from '@/components/AdvisoriesForm'
import { MajorIncidentsForm, type MajorIncidentDraft } from '@/components/MajorIncidentsForm'
import {
  DEFAULT_CHANNEL_SPLIT,
  DEFAULT_SEVERITY_SPLIT,
  DEFAULT_TOP_PRODUCTS,
  DEFAULT_TREND_POINTS,
  DEFAULT_KEY_NOTES,
  DEFAULT_SPARE_PARTS,
  cloneChannelSplit,
  cloneSeveritySplit,
  cloneTopProducts,
  cloneTrendPoints,
  cloneKeyNotes,
  cloneSpareParts,
  type DashboardChannelSplit,
  type DashboardSeveritySplit,
  type DashboardSummary,
  type DashboardTopProduct,
  type DashboardTrendPoint,
  type DashboardKeyNote,
  type DashboardSparePart,
  withSummaryFallback,
} from '@/lib/dashboard'
import {
  DEFAULT_CONNECTIVITY_NOTES,
  cloneConnectivityNotes,
  mapConnectivityCsvRows,
  type ConnectivityRowDraft,
} from '@/lib/connectivity'
import { parseCsvFile } from '@/lib/csv'
import { DEFAULT_ADVISORIES, cloneAdvisories, type AdvisorySection } from '@/lib/advisories'
import { cloneCapacityReview, DEFAULT_CAPACITY_REVIEW } from '@/lib/capacity-review'
import {
  cloneContractsReview,
  DEFAULT_CONTRACTS_REVIEW,
  mapContractsReviewCsvRows,
  mergeContractsReviewSections,
} from '@/lib/contracts-review'
import { type CodeCurrencyRowDraft } from '@/lib/code-currency'
import { cloneRiskRegister, DEFAULT_RISK_REGISTER } from '@/lib/risk-register'
import { cloneActionSummary, DEFAULT_ACTION_SUMMARY } from '@/lib/action-summary'
import { cloneStandardInformation, DEFAULT_STANDARD_INFORMATION } from '@/lib/standard-information'
import { mapTopProductsCsvRows, mergeTopProducts } from '@/lib/top-products'

const REPORT_TYPES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annual', label: 'Annual' },
]

const MIN_DATE = '2024-01-01'
const MAX_DATE = '2030-01-31'

function toDateInput(value: string | Date | null | undefined) {
  if (!value) return ''
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date?.getTime?.())) return ''
  return date.toISOString().slice(0, 10)
}

function parseDateKey(value: string) {
  if (!value) return null
  const [yearStr, monthStr = '01', dayStr = '01'] = value.split('-')
  const year = Number(yearStr)
  const month = Number(monthStr)
  const day = Number(dayStr)
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null
  return { year, month, day }
}

function compareDateStrings(a: string, b: string) {
  const left = parseDateKey(a)
  const right = parseDateKey(b)
  if (!left || !right) return 0
  const leftValue = left.year * 372 + left.month * 31 + left.day
  const rightValue = right.year * 372 + right.month * 31 + right.day
  return leftValue - rightValue
}

function normalizeDateInput(value: string) {
  const parsed = parseDateKey(value)
  if (!parsed) return ''
  const date = new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day))
  if (Number.isNaN(date.getTime())) return ''
  const normalized = date.toISOString().slice(0, 10)
  if (compareDateStrings(normalized, MIN_DATE) < 0 || compareDateStrings(normalized, MAX_DATE) > 0) return ''
  return normalized
}

function addMonths(date: Date, months: number) {
  const result = new Date(date.getTime())
  result.setUTCMonth(result.getUTCMonth() + months)
  return result
}

function defaultEndForType(type: string, normalizedStart: string) {
  const startDate = new Date(`${normalizedStart}T00:00:00Z`)
  if (Number.isNaN(startDate.getTime())) return normalizedStart
  let endDate: Date
  if (type === 'annual') {
    endDate = addMonths(startDate, 12)
    endDate.setUTCDate(endDate.getUTCDate() - 1)
  } else if (type === 'quarterly') {
    endDate = addMonths(startDate, 3)
    endDate.setUTCDate(endDate.getUTCDate() - 1)
  } else {
    endDate = addMonths(startDate, 1)
    endDate.setUTCDate(endDate.getUTCDate() - 1)
  }
  const normalized = endDate.toISOString().slice(0, 10)
  return compareDateStrings(normalized, MAX_DATE) > 0 ? MAX_DATE : normalized
}

function computeBounds(type: string, startValue: string, endValue: string) {
  const normalizedStart = normalizeDateInput(startValue)
  if (!normalizedStart) return null
  let normalizedEnd = normalizeDateInput(endValue)
  if (!normalizedEnd) {
    normalizedEnd = defaultEndForType(type, normalizedStart)
  }
  if (compareDateStrings(normalizedEnd, normalizedStart) < 0) {
    normalizedEnd = normalizedStart
  }
  if (compareDateStrings(normalizedEnd, MAX_DATE) > 0) {
    normalizedEnd = MAX_DATE
  }
  const startDate = new Date(`${normalizedStart}T00:00:00Z`)
  const endDate = new Date(`${normalizedEnd}T23:59:59Z`)
  return {
    startDate,
    endDate,
    normalizedStart,
    normalizedEnd,
  }
}

function findEngagementForRange(engagements: any[], startValue: string, endValue: string) {
  if (!startValue) return undefined
  return engagements.find((eng) => {
    const engagementStart = toDateInput(eng.periodStart)
    const engagementEnd = toDateInput(eng.periodEnd)
    return engagementStart === startValue && engagementEnd === endValue
  })
}

function normalizeIncidentDraft(row: any): MajorIncidentDraft {
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

function normalizeCodeCurrencyDraft(row: any): CodeCurrencyRowDraft {
  return {
    systemModel: String(row?.systemModel ?? '').trim(),
    assetCount: Number.isFinite(Number(row?.assetCount)) ? Number(row.assetCount) : 0,
    installedCode: String(row?.installedCode ?? '').trim(),
    statuses: {
      o: Boolean(row?.statuses?.o),
      m: Boolean(row?.statuses?.m),
      r: Boolean(row?.statuses?.r),
      l: Boolean(row?.statuses?.l),
    },
    minSupported7: String(row?.minSupported7 ?? '').trim(),
    minSupported8: String(row?.minSupported8 ?? '').trim(),
    recommended7: String(row?.recommended7 ?? '').trim(),
    recommended8: String(row?.recommended8 ?? '').trim(),
    latest7: String(row?.latest7 ?? '').trim(),
    latest8: String(row?.latest8 ?? '').trim(),
  }
}

function normalizeConnectivitySummary(summary: any) {
  return {
    totalAssets: Number.isFinite(Number(summary?.totalAssets)) ? Number(summary.totalAssets) : 0,
    connectedCount: Number.isFinite(Number(summary?.connectedCount))
      ? Number(summary.connectedCount)
      : 0,
  }
}

function normalizeConnectivityDraft(row: any): {
  status: 'Connected' | 'Not Connected'
  draft: ConnectivityRowDraft
} {
  const status = row?.connectivityStatus === 'Not Connected' ? 'Not Connected' : 'Connected'
  return {
    status,
    draft: {
      assetId: String(row?.assetId ?? '').trim(),
      alternateAssetId: String(row?.alternateAssetId ?? '').trim(),
      productName: String(row?.productName ?? '').trim(),
      assetAlias: String(row?.assetAlias ?? '').trim(),
      lastAlertAt: String(row?.lastAlertAt ?? '').trim(),
      connectionType: String(row?.connectionType ?? '').trim(),
      healthScore:
        row?.healthScore === null || row?.healthScore === undefined || Number.isNaN(Number(row.healthScore))
          ? ''
          : Number(row.healthScore),
      healthLabel:
        row?.healthLabel === 'Good' || row?.healthLabel === 'Fair' || row?.healthLabel === 'Poor'
          ? row.healthLabel
          : '',
    },
  }
}

function connectivityRowKey(row: ConnectivityRowDraft): string {
  const parts = [row.assetId, row.alternateAssetId, row.productName, row.assetAlias]
  return parts
    .filter((part) => Boolean(part && part.trim()))
    .map((part) => part.trim().toLowerCase())
    .join('::')
}

function mergeConnectivityRowSets(
  current: ConnectivityRowDraft[],
  incoming: ConnectivityRowDraft[],
): ConnectivityRowDraft[] {
  const map = new Map<string, ConnectivityRowDraft>()
  current.forEach((row) => {
    map.set(connectivityRowKey(row), { ...row })
  })
  incoming.forEach((row) => {
    map.set(connectivityRowKey(row), { ...row })
  })
  return Array.from(map.values()).sort((a, b) => {
    const productCompare = a.productName.localeCompare(b.productName)
    if (productCompare !== 0) return productCompare
    const assetCompare = a.assetId.localeCompare(b.assetId)
    if (assetCompare !== 0) return assetCompare
    return a.alternateAssetId.localeCompare(b.alternateAssetId)
  })
}

const CONNECTIVITY_IMPORT_REPLACE_PROMPT =
  'Replace existing connectivity entries and summary totals with the imported data? Click Cancel to merge instead.'

const CONTRACTS_IMPORT_REPLACE_PROMPT =
  'Replace the current contracts review content with the imported data? Click Cancel to merge instead.'

const TOP_PRODUCTS_IMPORT_REPLACE_PROMPT =
  'Replace the current Top 5 Products table with the imported data? Click Cancel to merge instead.'

function normalizeFcoTseDraft(row: any): FcoTseRowDraft {
  return {
    srCreated: String(row?.srCreated ?? '').trim(),
    fcoId: String(row?.fcoId ?? '').trim(),
    description: String(row?.description ?? '').trim(),
    srNumber: String(row?.srNumber ?? '').trim(),
    severity: String(row?.severity ?? '').trim(),
    serialNumber: String(row?.serialNumber ?? '').trim(),
    status: String(row?.status ?? '').trim(),
    productName: String(row?.productName ?? '').trim(),
    problemSummary: String(row?.problemSummary ?? '').trim(),
  }
}



export default function NewSessionPage() {
  const [organizations, setOrganizations] = useState<any[]>([])
  const [organizationsLoading, setOrganizationsLoading] = useState(true)
  const [selectedOrgId, setSelectedOrgId] = useState<string>('')
  const [reportType, setReportType] = useState<string>(REPORT_TYPES[0].value)
  const [engagements, setEngagements] = useState<any[]>([])
  const [engagementsLoading, setEngagementsLoading] = useState(true)
  const [engagementId, setEngagementId] = useState<string>('')
  const [periodRange, setPeriodRange] = useState<{ start: string; end: string }>({ start: '', end: '' })

  const [step, setStep] = useState(0)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState('')
  const [publishing, setPublishing] = useState(false)

  const [topProducts, setTopProducts] = useState<DashboardTopProduct[]>(cloneTopProducts(DEFAULT_TOP_PRODUCTS))
  const [topProductsImporting, setTopProductsImporting] = useState(false)
  const [trendPoints, setTrendPoints] = useState<DashboardTrendPoint[]>(cloneTrendPoints(DEFAULT_TREND_POINTS))
  const [severitySplit, setSeveritySplit] = useState<DashboardSeveritySplit[]>(cloneSeveritySplit(DEFAULT_SEVERITY_SPLIT))
  const [channelSplit, setChannelSplit] = useState<DashboardChannelSplit[]>(cloneChannelSplit(DEFAULT_CHANNEL_SPLIT))
  const [keyNotes, setKeyNotes] = useState<DashboardKeyNote[]>(cloneKeyNotes(DEFAULT_KEY_NOTES))
  const [spareParts, setSpareParts] = useState<DashboardSparePart[]>(cloneSpareParts(DEFAULT_SPARE_PARTS))
  const [codeCurrencyRows, setCodeCurrencyRows] = useState<CodeCurrencyRowDraft[]>([])
  const [codeCurrencyLoading, setCodeCurrencyLoading] = useState(false)
  const [connectivitySummary, setConnectivitySummary] = useState({ totalAssets: 0, connectedCount: 0 })
  const [connectivityConnectedRows, setConnectivityConnectedRows] = useState<ConnectivityRowDraft[]>([])
  const [connectivityNotConnectedRows, setConnectivityNotConnectedRows] = useState<ConnectivityRowDraft[]>([])
  const [connectivityNotes, setConnectivityNotes] = useState<string[]>(cloneConnectivityNotes(DEFAULT_CONNECTIVITY_NOTES))
  const [connectivityLoading, setConnectivityLoading] = useState(false)
  const [connectivityImporting, setConnectivityImporting] = useState(false)
  const [capacityReview, setCapacityReview] = useState(cloneCapacityReview(DEFAULT_CAPACITY_REVIEW))
  const [capacityLoading, setCapacityLoading] = useState(false)
  const [contractsReview, setContractsReview] = useState(cloneContractsReview(DEFAULT_CONTRACTS_REVIEW))
  const [contractsLoading, setContractsLoading] = useState(false)
  const [contractsImporting, setContractsImporting] = useState(false)
  const [riskRegister, setRiskRegister] = useState(cloneRiskRegister(DEFAULT_RISK_REGISTER))
  const [riskRegisterLoading, setRiskRegisterLoading] = useState(false)
  const [actionSummary, setActionSummary] = useState(cloneActionSummary(DEFAULT_ACTION_SUMMARY))
  const [actionSummaryLoading, setActionSummaryLoading] = useState(false)
  const [standardInformation, setStandardInformation] = useState(
    cloneStandardInformation(DEFAULT_STANDARD_INFORMATION),
  )
  const [standardInformationLoading, setStandardInformationLoading] = useState(false)
  const [advisories, setAdvisories] = useState<AdvisorySection[]>(cloneAdvisories(DEFAULT_ADVISORIES))
  const [advisoriesLoading, setAdvisoriesLoading] = useState(false)
  const [fcoTseRows, setFcoTseRows] = useState<FcoTseRowDraft[]>([])
  const [fcoTseLoading, setFcoTseLoading] = useState(false)
  const [majorIncidents, setMajorIncidents] = useState<MajorIncidentDraft[]>([])
  const [incidentsLoading, setIncidentsLoading] = useState(false)
  const topProductsFileInputRef = useRef<HTMLInputElement | null>(null)
  const connectivityFileInputRef = useRef<HTMLInputElement | null>(null)
  const contractsFileInputRef = useRef<HTMLInputElement | null>(null)

  const MAX_STEP = WIZARD_STEPS.length - 1
  const SPARE_PART_STEP = WIZARD_STEPS.indexOf('Spare Parts')
  const CODE_CURRENCY_STEP = WIZARD_STEPS.indexOf('Code Currency')
  const CONNECTIVITY_STEP = WIZARD_STEPS.indexOf('Connectivity')
  const CAPACITY_REVIEW_STEP = WIZARD_STEPS.indexOf('Capacity Review')
  const CONTRACTS_REVIEW_STEP = WIZARD_STEPS.indexOf('Contracts Review')
  const RISK_REGISTER_STEP = WIZARD_STEPS.indexOf('Risk Register')
  const ACTION_SUMMARY_STEP = WIZARD_STEPS.indexOf('Action Summary')
  const STANDARD_INFORMATION_STEP = WIZARD_STEPS.indexOf('Standard Information')
  const ADVISORIES_STEP = WIZARD_STEPS.indexOf('Advisories')
  const FCO_TSE_STEP = WIZARD_STEPS.indexOf('FCO & TSE')
  const MAJOR_INCIDENT_STEP = WIZARD_STEPS.indexOf('Major Incidents')


  useEffect(() => {
    async function loadOrganizations() {
      setError(null)
      try {
        const res = await fetch('/api/organizations')
        const rows = await res.json()
        setOrganizations(rows || [])
        if (rows?.length) {
          setSelectedOrgId(rows[0].id)
        }
      } catch (err) {
        console.error(err)
        setError('Unable to load customers.')
      } finally {
        setOrganizationsLoading(false)
      }
    }
    loadOrganizations()
  }, [])

  useEffect(() => {
    if (!selectedOrgId) {
      setEngagements([])
      setEngagementId('')
      setPeriodRange({ start: '', end: '' })
      setEngagementsLoading(false)
      return
    }

    let cancelled = false
    async function loadEngagements() {
      setEngagementsLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams({ organizationId: selectedOrgId })
        if (reportType) params.set('type', reportType)
        const res = await fetch(`/api/engagements?${params.toString()}`)
        if (!res.ok) throw new Error(`Failed to load engagements (${res.status})`)
        const rows = await res.json()
        if (!cancelled) {
          setEngagements(rows || [])
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err)
          setError('Unable to load engagements for this selection.')
          setEngagements([])
          setEngagementId('')
          setPeriodRange({ start: '', end: '' })
        }
      } finally {
        if (!cancelled) setEngagementsLoading(false)
      }
    }

    loadEngagements()
    return () => {
      cancelled = true
    }
  }, [selectedOrgId, reportType])

  useEffect(() => {
    if (!engagements.length) {
      setEngagementId('')
      setPeriodRange({ start: '', end: '' })
      return
    }
    const current = engagements.find((eng) => eng.id === engagementId)
    if (current) {
      const normalizedStart = normalizeDateInput(toDateInput(current.periodStart))
      const normalizedEnd = normalizeDateInput(toDateInput(current.periodEnd)) || normalizedStart
      setPeriodRange({ start: normalizedStart, end: normalizedEnd })
      return
    }
    const first = engagements[0]
    const normalizedStart = normalizeDateInput(toDateInput(first.periodStart))
    const normalizedEnd = normalizeDateInput(toDateInput(first.periodEnd)) || normalizedStart
    setEngagementId(first.id)
    setPeriodRange({ start: normalizedStart, end: normalizedEnd })
  }, [engagements, engagementId])

const upsertEngagementInState = useCallback((eng: any) => {
  setEngagements((prev) => {
    const others = prev.filter((item) => item.id !== eng.id)
    const next = [...others, eng]
    next.sort((a, b) => new Date(b.periodStart).getTime() - new Date(a.periodStart).getTime())
    return next
  })
}, [])

const ensureEngagement = useCallback(
  async (startValue: string, endValue: string) => {
    if (!selectedOrgId) {
      setEngagementId('')
      setPeriodRange({ start: '', end: '' })
      setTopProducts(cloneTopProducts(DEFAULT_TOP_PRODUCTS))
      setTrendPoints(cloneTrendPoints(DEFAULT_TREND_POINTS))
      setSeveritySplit(cloneSeveritySplit(DEFAULT_SEVERITY_SPLIT))
      setChannelSplit(cloneChannelSplit(DEFAULT_CHANNEL_SPLIT))
      setKeyNotes(cloneKeyNotes(DEFAULT_KEY_NOTES))
      setSpareParts(cloneSpareParts(DEFAULT_SPARE_PARTS))
      setCodeCurrencyRows([])
      setCodeCurrencyLoading(false)
      setConnectivitySummary({ totalAssets: 0, connectedCount: 0 })
      setConnectivityConnectedRows([])
      setConnectivityNotConnectedRows([])
      setConnectivityNotes(cloneConnectivityNotes(DEFAULT_CONNECTIVITY_NOTES))
      setConnectivityLoading(false)
      setCapacityReview(cloneCapacityReview(DEFAULT_CAPACITY_REVIEW))
      setCapacityLoading(false)
      setContractsReview(cloneContractsReview(DEFAULT_CONTRACTS_REVIEW))
      setContractsLoading(false)
      setRiskRegister(cloneRiskRegister(DEFAULT_RISK_REGISTER))
      setRiskRegisterLoading(false)
      setActionSummary(cloneActionSummary(DEFAULT_ACTION_SUMMARY))
      setActionSummaryLoading(false)
      setStandardInformation(cloneStandardInformation(DEFAULT_STANDARD_INFORMATION))
      setStandardInformationLoading(false)
      setAdvisories(cloneAdvisories(DEFAULT_ADVISORIES))
      setAdvisoriesLoading(false)
      setFcoTseRows([])
      setFcoTseLoading(false)
      setMajorIncidents([])
      return undefined
    }

    const bounds = computeBounds(reportType, startValue, endValue)
    if (!bounds) {
      setEngagementId('')
      setPeriodRange({ start: '', end: '' })
      setTopProducts(cloneTopProducts(DEFAULT_TOP_PRODUCTS))
      setTrendPoints(cloneTrendPoints(DEFAULT_TREND_POINTS))
      setSeveritySplit(cloneSeveritySplit(DEFAULT_SEVERITY_SPLIT))
      setChannelSplit(cloneChannelSplit(DEFAULT_CHANNEL_SPLIT))
      setKeyNotes(cloneKeyNotes(DEFAULT_KEY_NOTES))
      setSpareParts(cloneSpareParts(DEFAULT_SPARE_PARTS))
      setCodeCurrencyRows([])
      setCodeCurrencyLoading(false)
      setConnectivitySummary({ totalAssets: 0, connectedCount: 0 })
      setConnectivityConnectedRows([])
      setConnectivityNotConnectedRows([])
      setConnectivityNotes(cloneConnectivityNotes(DEFAULT_CONNECTIVITY_NOTES))
      setConnectivityLoading(false)
      setCapacityReview(cloneCapacityReview(DEFAULT_CAPACITY_REVIEW))
      setCapacityLoading(false)
      setContractsReview(cloneContractsReview(DEFAULT_CONTRACTS_REVIEW))
      setContractsLoading(false)
      setRiskRegister(cloneRiskRegister(DEFAULT_RISK_REGISTER))
      setRiskRegisterLoading(false)
      setActionSummary(cloneActionSummary(DEFAULT_ACTION_SUMMARY))
      setActionSummaryLoading(false)
      setStandardInformation(cloneStandardInformation(DEFAULT_STANDARD_INFORMATION))
      setStandardInformationLoading(false)
      setAdvisories(cloneAdvisories(DEFAULT_ADVISORIES))
      setAdvisoriesLoading(false)
      setFcoTseRows([])
      setFcoTseLoading(false)
      setMajorIncidents([])
      return undefined
    }

    setPeriodRange({ start: bounds.normalizedStart, end: bounds.normalizedEnd })

    const existing = findEngagementForRange(engagements, bounds.normalizedStart, bounds.normalizedEnd)
    if (existing) {
      setEngagementId(existing.id)
      return existing
    }

    const res = await fetch('/api/engagements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        organizationId: selectedOrgId,
        type: reportType,
        periodStart: bounds.startDate.toISOString(),
        periodEnd: bounds.endDate.toISOString(),
      }),
    })

    if (!res.ok) {
      const message = (await res.json().catch(() => ({})))?.error ?? 'Unable to create engagement for the selected period.'
      setError(message)
      setEngagementId('')
      return undefined
    }

    const engagement = await res.json()
    upsertEngagementInState(engagement)
    setEngagementId(engagement.id)
    setTopProducts(cloneTopProducts(DEFAULT_TOP_PRODUCTS))
    setTrendPoints(cloneTrendPoints(DEFAULT_TREND_POINTS))
    setSeveritySplit(cloneSeveritySplit(DEFAULT_SEVERITY_SPLIT))
    setChannelSplit(cloneChannelSplit(DEFAULT_CHANNEL_SPLIT))
    setKeyNotes(cloneKeyNotes(DEFAULT_KEY_NOTES))
    setSpareParts(cloneSpareParts(DEFAULT_SPARE_PARTS))
    setCodeCurrencyRows([])
    setCodeCurrencyLoading(false)
    setConnectivitySummary({ totalAssets: 0, connectedCount: 0 })
    setConnectivityConnectedRows([])
    setConnectivityNotConnectedRows([])
    setConnectivityNotes(cloneConnectivityNotes(DEFAULT_CONNECTIVITY_NOTES))
    setConnectivityLoading(false)
    setCapacityReview(cloneCapacityReview(DEFAULT_CAPACITY_REVIEW))
    setCapacityLoading(false)
    setContractsReview(cloneContractsReview(DEFAULT_CONTRACTS_REVIEW))
    setContractsLoading(false)
    setRiskRegister(cloneRiskRegister(DEFAULT_RISK_REGISTER))
    setRiskRegisterLoading(false)
    setActionSummary(cloneActionSummary(DEFAULT_ACTION_SUMMARY))
    setActionSummaryLoading(false)
    setStandardInformation(cloneStandardInformation(DEFAULT_STANDARD_INFORMATION))
    setStandardInformationLoading(false)
    setAdvisories(cloneAdvisories(DEFAULT_ADVISORIES))
    setAdvisoriesLoading(false)
    setFcoTseRows([])
    setFcoTseLoading(false)
    setMajorIncidents([])
    return engagement
  },
  [engagements, reportType, selectedOrgId, upsertEngagementInState],
)

  const selectedOrg = useMemo(
    () => organizations.find((row: any) => row.id === selectedOrgId) ?? null,
    [organizations, selectedOrgId],
  )

  const currentEngagement = useMemo(
    () => engagements.find((row) => row.id === engagementId) ?? null,
    [engagementId, engagements],
  )
  const isPublished = currentEngagement?.status === 'Published'

  useEffect(() => {
    if (!engagementId) {
      setSummaryLoading(false)
      setTopProducts(cloneTopProducts(DEFAULT_TOP_PRODUCTS))
      setTrendPoints(cloneTrendPoints(DEFAULT_TREND_POINTS))
      setSeveritySplit(cloneSeveritySplit(DEFAULT_SEVERITY_SPLIT))
      setChannelSplit(cloneChannelSplit(DEFAULT_CHANNEL_SPLIT))
      setKeyNotes(cloneKeyNotes(DEFAULT_KEY_NOTES))
      setSpareParts(cloneSpareParts(DEFAULT_SPARE_PARTS))
      setCodeCurrencyRows([])
      setCodeCurrencyLoading(false)
      setConnectivitySummary({ totalAssets: 0, connectedCount: 0 })
      setConnectivityConnectedRows([])
      setConnectivityNotConnectedRows([])
      setConnectivityNotes(cloneConnectivityNotes(DEFAULT_CONNECTIVITY_NOTES))
      setConnectivityLoading(false)
      setCapacityReview(cloneCapacityReview(DEFAULT_CAPACITY_REVIEW))
      setCapacityLoading(false)
      setAdvisories(cloneAdvisories(DEFAULT_ADVISORIES))
      setAdvisoriesLoading(false)
      setFcoTseRows([])
      setFcoTseLoading(false)
      setMajorIncidents([])
      setIncidentsLoading(false)
      return
    }

    let cancelled = false
    async function loadSummary() {
      setSummaryLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/dashboard-summary?engagementId=${encodeURIComponent(engagementId)}`)
        if (!res.ok) throw new Error(`Failed to load summary (${res.status})`)
        const payload: Partial<DashboardSummary> = await res.json()
        if (cancelled) return
        const next = withSummaryFallback(payload)
        setTopProducts(next.topProducts)
        setTrendPoints(next.trend)
        setSeveritySplit(next.severity)
        setChannelSplit(next.channels)
        setKeyNotes(next.keyNotes)
        setSpareParts(next.spareParts)
      } catch (err) {
        if (!cancelled) {
          console.error(err)
          setError('Unable to load dashboard summary for this engagement.')
        }
      } finally {
        if (!cancelled) setSummaryLoading(false)
      }
    }

    loadSummary()
    return () => {
      cancelled = true
    }
  }, [engagementId])

  useEffect(() => {
    if (!engagementId) {
      setCodeCurrencyRows([])
      setCodeCurrencyLoading(false)
      return
    }

    let cancelled = false
    async function loadCodeCurrency() {
      setCodeCurrencyLoading(true)
      try {
        const res = await fetch(`/api/code-currency?engagementId=${encodeURIComponent(engagementId)}`)
        if (!res.ok) throw new Error(`Failed to load code currency (${res.status})`)
        const rows = await res.json()
        if (!cancelled) {
          const drafts = Array.isArray(rows) ? rows.map(normalizeCodeCurrencyDraft) : []
          setCodeCurrencyRows(drafts)
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err)
          setError((prev) => prev ?? 'Unable to load code currency for this engagement.')
          setCodeCurrencyRows([])
        }
      } finally {
        if (!cancelled) setCodeCurrencyLoading(false)
      }
    }

    void loadCodeCurrency()
    return () => {
      cancelled = true
    }
  }, [engagementId])

  useEffect(() => {
    if (!engagementId) {
      setConnectivitySummary({ totalAssets: 0, connectedCount: 0 })
      setConnectivityConnectedRows([])
      setConnectivityNotConnectedRows([])
      setConnectivityNotes(cloneConnectivityNotes(DEFAULT_CONNECTIVITY_NOTES))
      setConnectivityLoading(false)
      return
    }

    let cancelled = false
    async function loadConnectivity() {
      setConnectivityLoading(true)
      try {
        const res = await fetch(`/api/connectivity?engagementId=${encodeURIComponent(engagementId)}`)
        if (!res.ok) throw new Error(`Failed to load connectivity (${res.status})`)
        const payload = await res.json()
        if (cancelled) return
        const summary = normalizeConnectivitySummary(payload?.summary)
        const connected: ConnectivityRowDraft[] = []
        const notConnected: ConnectivityRowDraft[] = []
        const rows = Array.isArray(payload?.rows) ? payload.rows : []
        rows.forEach((row: any) => {
          const normalized = normalizeConnectivityDraft(row)
          if (normalized.status === 'Not Connected') {
            notConnected.push(normalized.draft)
          } else {
            connected.push(normalized.draft)
          }
        })
        const notes = Array.isArray(payload?.notes)
          ? payload.notes
              .map((note: any) => String(note ?? '').trim())
              .filter((note: string) => note.length > 0)
          : cloneConnectivityNotes(DEFAULT_CONNECTIVITY_NOTES)

        setConnectivitySummary(summary)
        setConnectivityConnectedRows(connected)
        setConnectivityNotConnectedRows(notConnected)
        setConnectivityNotes(notes.length ? notes : [])
      } catch (err) {
        if (!cancelled) {
          console.error(err)
          setError((prev) => prev ?? 'Unable to load connectivity for this engagement.')
          setConnectivitySummary({ totalAssets: 0, connectedCount: 0 })
          setConnectivityConnectedRows([])
          setConnectivityNotConnectedRows([])
          setConnectivityNotes(cloneConnectivityNotes(DEFAULT_CONNECTIVITY_NOTES))
        }
      } finally {
        if (!cancelled) setConnectivityLoading(false)
      }
    }

    void loadConnectivity()
    return () => {
      cancelled = true
    }
  }, [engagementId])

  useEffect(() => {
    if (!engagementId) {
      setAdvisories(cloneAdvisories(DEFAULT_ADVISORIES))
      setAdvisoriesLoading(false)
      return
    }

    let cancelled = false
    async function loadAdvisories() {
      setAdvisoriesLoading(true)
      try {
        const res = await fetch(`/api/advisories?engagementId=${encodeURIComponent(engagementId)}`)
        if (!res.ok) throw new Error(`Failed to load advisories (${res.status})`)
        const payload = await res.json()
        if (!cancelled) {
          const sections = Array.isArray(payload?.sections) ? payload.sections : []
          const incoming = cloneAdvisories(sections)
          const defaults = cloneAdvisories(DEFAULT_ADVISORIES)
          const normalized =
            incoming.length >= defaults.length
              ? incoming.slice(0, defaults.length)
              : [...incoming, ...defaults.slice(incoming.length)]
          setAdvisories(normalized)
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err)
          setError((prev) => prev ?? 'Unable to load advisories for this engagement.')
          setAdvisories(cloneAdvisories(DEFAULT_ADVISORIES))
        }
      } finally {
        if (!cancelled) setAdvisoriesLoading(false)
      }
    }

    void loadAdvisories()
    return () => {
      cancelled = true
    }
  }, [engagementId])

  useEffect(() => {
    if (!engagementId) {
      setContractsReview(cloneContractsReview(DEFAULT_CONTRACTS_REVIEW))
      setContractsLoading(false)
      return
    }

    let cancelled = false
    async function loadContractsReview() {
      setContractsLoading(true)
      try {
        const res = await fetch(`/api/contracts-review?engagementId=${encodeURIComponent(engagementId)}`)
        if (!res.ok) throw new Error(`Failed to load contracts review (${res.status})`)
        const payload = await res.json()
        if (!cancelled) {
          setContractsReview(cloneContractsReview(payload?.section))
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err)
          setError((prev) => prev ?? 'Unable to load contracts review for this engagement.')
          setContractsReview(cloneContractsReview(DEFAULT_CONTRACTS_REVIEW))
        }
      } finally {
        if (!cancelled) setContractsLoading(false)
      }
    }

    void loadContractsReview()
    return () => {
      cancelled = true
    }
  }, [engagementId])

  useEffect(() => {
    if (!engagementId) {
      setRiskRegister(cloneRiskRegister(DEFAULT_RISK_REGISTER))
      setRiskRegisterLoading(false)
      return
    }

    let cancelled = false
    async function loadRiskRegister() {
      setRiskRegisterLoading(true)
      try {
        const res = await fetch(`/api/risk-register?engagementId=${encodeURIComponent(engagementId)}`)
        if (!res.ok) throw new Error(`Failed to load risk register (${res.status})`)
        const payload = await res.json()
        if (!cancelled) {
          setRiskRegister(cloneRiskRegister(payload?.section))
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err)
          setError((prev) => prev ?? 'Unable to load risk register for this engagement.')
          setRiskRegister(cloneRiskRegister(DEFAULT_RISK_REGISTER))
        }
      } finally {
        if (!cancelled) setRiskRegisterLoading(false)
      }
    }

    void loadRiskRegister()
    return () => {
      cancelled = true
    }
  }, [engagementId])

  useEffect(() => {
    if (!engagementId) {
      setActionSummary(cloneActionSummary(DEFAULT_ACTION_SUMMARY))
      setActionSummaryLoading(false)
      return
    }

    let cancelled = false
    async function loadActionSummary() {
      setActionSummaryLoading(true)
      try {
        const res = await fetch(`/api/action-summary?engagementId=${encodeURIComponent(engagementId)}`)
        if (!res.ok) throw new Error(`Failed to load action summary (${res.status})`)
        const payload = await res.json()
        if (!cancelled) {
          setActionSummary(cloneActionSummary(payload?.section))
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err)
          setError((prev) => prev ?? 'Unable to load action summary for this engagement.')
          setActionSummary(cloneActionSummary(DEFAULT_ACTION_SUMMARY))
        }
      } finally {
        if (!cancelled) setActionSummaryLoading(false)
      }
    }

    void loadActionSummary()
    return () => {
      cancelled = true
    }
  }, [engagementId])

  useEffect(() => {
    if (!engagementId) {
      setStandardInformation(cloneStandardInformation(DEFAULT_STANDARD_INFORMATION))
      setStandardInformationLoading(false)
      return
    }

    let cancelled = false
    async function loadStandardInformation() {
      setStandardInformationLoading(true)
      try {
        const res = await fetch(`/api/standard-information?engagementId=${encodeURIComponent(engagementId)}`)
        if (!res.ok) throw new Error(`Failed to load standard information (${res.status})`)
        const payload = await res.json()
        if (!cancelled) {
          setStandardInformation(cloneStandardInformation(payload?.section))
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err)
          setError((prev) => prev ?? 'Unable to load standard information for this engagement.')
          setStandardInformation(cloneStandardInformation(DEFAULT_STANDARD_INFORMATION))
        }
      } finally {
        if (!cancelled) setStandardInformationLoading(false)
      }
    }

    void loadStandardInformation()
    return () => {
      cancelled = true
    }
  }, [engagementId])

  useEffect(() => {
    if (!engagementId) {
      setCapacityReview(cloneCapacityReview(DEFAULT_CAPACITY_REVIEW))
      setCapacityLoading(false)
      return
    }

    let cancelled = false
    async function loadCapacityReview() {
      setCapacityLoading(true)
      try {
        const res = await fetch(`/api/capacity-review?engagementId=${encodeURIComponent(engagementId)}`)
        if (!res.ok) throw new Error(`Failed to load capacity review (${res.status})`)
        const payload = await res.json()
        if (!cancelled) {
          setCapacityReview(cloneCapacityReview(payload?.section))
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err)
          setError((prev) => prev ?? 'Unable to load capacity review for this engagement.')
          setCapacityReview(cloneCapacityReview(DEFAULT_CAPACITY_REVIEW))
        }
      } finally {
        if (!cancelled) setCapacityLoading(false)
      }
    }

    void loadCapacityReview()
    return () => {
      cancelled = true
    }
  }, [engagementId])

  useEffect(() => {
    if (!engagementId) {
      setFcoTseRows([])
      setFcoTseLoading(false)
      return
    }

    let cancelled = false
    async function loadFcoTse() {
      setFcoTseLoading(true)
      try {
        const res = await fetch(`/api/fco-tse?engagementId=${encodeURIComponent(engagementId)}`)
        if (!res.ok) throw new Error(`Failed to load FCO & TSE detail (${res.status})`)
        const payload = await res.json()
        if (!cancelled) {
          const rows = Array.isArray(payload?.rows) ? payload.rows : []
          setFcoTseRows(rows.map((row: any) => normalizeFcoTseDraft(row)))
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err)
          setError((prev) => prev ?? 'Unable to load FCO & TSE detail for this engagement.')
          setFcoTseRows([])
        }
      } finally {
        if (!cancelled) setFcoTseLoading(false)
      }
    }

    void loadFcoTse()
    return () => {
      cancelled = true
    }
  }, [engagementId])

  useEffect(() => {
    if (!engagementId) {
      setMajorIncidents([])
      setIncidentsLoading(false)
      return
    }

    let cancelled = false
    async function loadIncidents() {
      setIncidentsLoading(true)
      try {
        const res = await fetch(`/api/incidents?engagementId=${encodeURIComponent(engagementId)}`)
        if (!res.ok) throw new Error(`Failed to load major incidents (${res.status})`)
        const rows = await res.json()
        if (!cancelled) {
          const drafts = Array.isArray(rows) ? rows.map(normalizeIncidentDraft) : []
          setMajorIncidents(drafts)
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err)
          setError((prev) => prev ?? 'Unable to load major incidents for this engagement.')
          setMajorIncidents([])
        }
      } finally {
        if (!cancelled) setIncidentsLoading(false)
      }
    }

    void loadIncidents()
    return () => {
      cancelled = true
    }
  }, [engagementId])

  const topProductsBusy = summaryLoading || topProductsImporting
  const connectivityBusy = connectivityLoading || connectivityImporting
  const contractsBusy = contractsLoading || contractsImporting

  const currentStepLoading =
    step === MAJOR_INCIDENT_STEP
      ? incidentsLoading
      : step === FCO_TSE_STEP
        ? fcoTseLoading
        : step === ADVISORIES_STEP
          ? advisoriesLoading
          : step === STANDARD_INFORMATION_STEP
            ? standardInformationLoading
            : step === ACTION_SUMMARY_STEP
              ? actionSummaryLoading
              : step === RISK_REGISTER_STEP
                ? riskRegisterLoading
                : step === CONTRACTS_REVIEW_STEP
                  ? contractsBusy
                  : step === CAPACITY_REVIEW_STEP
                    ? capacityLoading
                    : step === CONNECTIVITY_STEP
                      ? connectivityBusy
                      : step === CODE_CURRENCY_STEP
                        ? codeCurrencyLoading
                          : step === 0
                            ? topProductsBusy
                            : summaryLoading
  const canSave = useMemo(
    () => Boolean(engagementId) && !saving && !currentStepLoading,
    [engagementId, saving, currentStepLoading]
  )

  const disabledInputs = !engagementId || saving
  const disabledConnectivityInputs = disabledInputs || connectivityBusy
  const disabledContractsInputs = disabledInputs || contractsBusy
  const disabledTopProductsInputs = disabledInputs || summaryLoading || topProductsImporting

  const handleTopProductsCsvImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setTopProductsImporting(true)
    setError(null)
    try {
      const { rows, errors } = await parseCsvFile(file)
      if (errors?.length) {
        console.warn('Top products CSV import reported errors', errors)
      }

      const {
        topProducts: imported,
        detected,
        skipped,
        totalRows,
        processedRows,
        provided,
        inferred,
        filtered,
        metadata,
      } = mapTopProductsCsvRows(rows, {
        customerName: selectedOrg?.name,
      })
      if (!detected) {
        const reasonParts: string[] = []
        if (filtered.byCustomer) {
          reasonParts.push(`${filtered.byCustomer} row(s) filtered by the selected customer`)
        }
        if (skipped) {
          reasonParts.push(`${skipped} row(s) missing a product name`)
        }
        const reasonText = reasonParts.length ? ` (${reasonParts.join('; ')})` : ''
        window.alert(`No top products were detected in the CSV file after applying the selected filters${reasonText}.`)
        return
      }

      const hasExisting = topProducts.some(
        (row) => row.product.trim() || row.count !== 0 || row.percent !== 0,
      )
      const replace = !hasExisting || window.confirm(TOP_PRODUCTS_IMPORT_REPLACE_PROMPT)

      const next = mergeTopProducts(topProducts, imported, replace ? 'replace' : 'merge')
      setTopProducts(next)

      if (skipped) {
        console.info(`Top products import skipped ${skipped} row(s) without a product name.`)
      }
      if (filtered.byCustomer) {
        console.info('Top products import applied customer filtering', filtered)
      }
      console.debug('Top products import data', {
        totalRows,
        processedRows,
        provided,
        inferred,
        filtered,
        metadata,
      })

      setStatusMessage('Top products imported')
      setTimeout(() => setStatusMessage(''), 2500)
    } catch (error) {
      console.error('Failed to import top products CSV', error)
      window.alert('Unable to import top products CSV. Confirm the file matches the expected format and try again.')
    } finally {
      setTopProductsImporting(false)
    }
  }

  const handleConnectivityCsvImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setConnectivityImporting(true)
    setError(null)
    try {
      const { rows, errors } = await parseCsvFile(file)
      if (errors?.length) {
        console.warn('Connectivity CSV import reported errors', errors)
      }

      const {
        connected,
        notConnected,
        skipped,
        statusCounts,
        totalRows,
        processedRows,
        filtered,
        metadata,
      } = mapConnectivityCsvRows(rows, {
        customerName: selectedOrg?.name,
      })
      if (!connected.length && !notConnected.length) {
        window.alert('No connectivity rows were detected in the CSV file.')
        return
      }

      const hasExisting = connectivityConnectedRows.length > 0 || connectivityNotConnectedRows.length > 0
      const replace = !hasExisting || window.confirm(CONNECTIVITY_IMPORT_REPLACE_PROMPT)

      const nextConnected = replace
        ? connected
        : mergeConnectivityRowSets(connectivityConnectedRows, connected)
      const nextNotConnected = replace
        ? notConnected
        : mergeConnectivityRowSets(connectivityNotConnectedRows, notConnected)

      setConnectivityConnectedRows(nextConnected)
      setConnectivityNotConnectedRows(nextNotConnected)
      setConnectivitySummary({
        totalAssets: nextConnected.length + nextNotConnected.length,
        connectedCount: nextConnected.length,
      })

      if (skipped) {
        console.info(`Connectivity import skipped ${skipped} row(s) without sufficient identifiers.`)
      }
      if (Object.keys(statusCounts).length) {
        console.debug('Connectivity import status counts', statusCounts)
      }
      if (filtered.byCustomer) {
        console.info('Connectivity import applied customer filtering', filtered)
      }
      if (metadata.customerColumn === null && selectedOrg?.name) {
        console.info('Connectivity CSV import did not find a customer column to validate the selected account.')
      }
      console.debug('Connectivity import data', {
        totalRows,
        processedRows,
        filtered,
        metadata,
      })
      setStatusMessage('Connectivity data imported')
      setTimeout(() => setStatusMessage(''), 2500)
    } catch (error) {
      console.error('Failed to import connectivity CSV', error)
      window.alert('Unable to import connectivity CSV. Confirm the file matches the expected columns and try again.')
    } finally {
      setConnectivityImporting(false)
    }
  }

  const handleContractsCsvImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setContractsImporting(true)
    setError(null)
    try {
      const { rows, errors } = await parseCsvFile(file)
      if (errors?.length) {
        console.warn('Contracts review CSV import reported errors', errors)
      }

      const {
        section: imported,
        provided,
        skipped,
        categoryCounts,
        totalRows,
        processedRows,
        filtered,
        metadata,
      } = mapContractsReviewCsvRows(rows, {
        customerName: selectedOrg?.name,
      })
      const hasContent =
        provided.title ||
        provided.summary ||
        provided.keyNotes > 0 ||
        provided.statusHighlights > 0 ||
        provided.productHighlights > 0 ||
        provided.screenshotCaption

      if (!hasContent) {
        window.alert('No contracts review content was detected in the CSV file.')
        return
      }

      const hasExisting = Boolean(
        contractsReview.title.trim() ||
          contractsReview.summary.trim() ||
          contractsReview.screenshotCaption.trim() ||
          contractsReview.keyNotes.length ||
          contractsReview.statusHighlights.length ||
          contractsReview.productHighlights.length,
      )

      const replace = !hasExisting || window.confirm(CONTRACTS_IMPORT_REPLACE_PROMPT)

      const next = mergeContractsReviewSections(
        contractsReview,
        imported,
        provided,
        replace ? 'replace' : 'merge',
      )

      setContractsReview(next)
      if (skipped) {
        console.info(`Contracts review import skipped ${skipped} row(s) without recognised values.`)
      }
      if (Object.keys(categoryCounts).length) {
        console.debug('Contracts review import category counts', categoryCounts)
      }
      if (filtered.byCustomer) {
        console.info('Contracts review import applied customer filtering', filtered)
      }
      if (metadata.customerColumn === null && selectedOrg?.name) {
        console.info('Contracts review CSV import did not find a customer column to validate the selected account.')
      }
      console.debug('Contracts review import data', {
        totalRows,
        processedRows,
        filtered,
        metadata,
      })
      setStatusMessage('Contracts review imported')
      setTimeout(() => setStatusMessage(''), 2500)
    } catch (error) {
      console.error('Failed to import contracts review CSV', error)
      window.alert('Unable to import contracts review CSV. Confirm the file matches the expected format and try again.')
    } finally {
      setContractsImporting(false)
    }
  }


  const persistSummary = useCallback(async () => {
    if (!engagementId) return
    setSaving(true)
    setError(null)
    setStatusMessage('')
    try {
      const res = await fetch('/api/dashboard-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          engagementId,
          topProducts,
          trend: trendPoints,
          severity: severitySplit,
          channels: channelSplit,
          keyNotes,
          spareParts,
        }),
      })
      if (!res.ok) throw new Error(`Failed to save summary (${res.status})`)
      setStatusMessage('Saved')
      setTimeout(() => setStatusMessage(''), 2500)
    } catch (err) {
      console.error(err)
      setError('Unable to save dashboard summary. Try again.')
    } finally {
      setSaving(false)
    }
  }, [engagementId, topProducts, trendPoints, severitySplit, channelSplit, keyNotes, spareParts]);

  const persistCodeCurrency = useCallback(async () => {
    if (!engagementId) return
    setSaving(true)
    setError(null)
    setStatusMessage('')
    try {
      const res = await fetch('/api/code-currency', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          engagementId,
          rows: codeCurrencyRows.map((row) => ({
            systemModel: row.systemModel.trim(),
            assetCount: Number.isFinite(row.assetCount) ? row.assetCount : 0,
            installedCode: row.installedCode.trim(),
            statuses: {
              o: Boolean(row.statuses.o),
              m: Boolean(row.statuses.m),
              r: Boolean(row.statuses.r),
              l: Boolean(row.statuses.l),
            },
            minSupported7: row.minSupported7.trim(),
            minSupported8: row.minSupported8.trim(),
            recommended7: row.recommended7.trim(),
            recommended8: row.recommended8.trim(),
            latest7: row.latest7.trim(),
            latest8: row.latest8.trim(),
          })),
        }),
      })
      if (!res.ok) throw new Error(`Failed to save code currency (${res.status})`)
      setStatusMessage('Saved')
      setTimeout(() => setStatusMessage(''), 2500)
    } catch (err) {
      console.error(err)
      setError('Unable to save code currency. Try again.')
    } finally {
      setSaving(false)
    }
  }, [engagementId, codeCurrencyRows]);

  const persistConnectivity = useCallback(async () => {
    if (!engagementId) return
    setSaving(true)
    setError(null)
    setStatusMessage('')
    try {
      const totalAssets = Number.isFinite(connectivitySummary.totalAssets) && connectivitySummary.totalAssets > 0
        ? connectivitySummary.totalAssets
        : connectivityConnectedRows.length + connectivityNotConnectedRows.length
      const connectedCount = Number.isFinite(connectivitySummary.connectedCount) && connectivitySummary.connectedCount >= 0
        ? connectivitySummary.connectedCount
        : connectivityConnectedRows.length

      const safeTotal = Math.max(totalAssets, connectivityConnectedRows.length + connectivityNotConnectedRows.length)
      const safeConnected = Math.min(connectedCount, safeTotal)

      const rows = [
        ...connectivityConnectedRows.map((row) => ({
          assetId: row.assetId.trim(),
          alternateAssetId: row.alternateAssetId.trim() || undefined,
          productName: row.productName.trim(),
          assetAlias: row.assetAlias.trim() || undefined,
          connectivityStatus: 'Connected' as const,
          lastAlertAt: row.lastAlertAt.trim() || undefined,
          connectionType: row.connectionType.trim() || undefined,
          healthScore: row.healthScore === '' ? null : Number(row.healthScore),
          healthLabel: row.healthLabel || undefined,
        })),
        ...connectivityNotConnectedRows.map((row) => ({
          assetId: row.assetId.trim(),
          alternateAssetId: row.alternateAssetId.trim() || undefined,
          productName: row.productName.trim(),
          assetAlias: row.assetAlias.trim() || undefined,
          connectivityStatus: 'Not Connected' as const,
          lastAlertAt: row.lastAlertAt.trim() || undefined,
          connectionType: row.connectionType.trim() || undefined,
          healthScore: row.healthScore === '' ? null : Number(row.healthScore),
          healthLabel: row.healthLabel || undefined,
        })),
      ]
      const notes = connectivityNotes.map((note) => note.trim()).filter((note) => note.length > 0)

      const res = await fetch('/api/connectivity', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          engagementId,
          summary: {
            totalAssets: safeTotal,
            connectedCount: safeConnected,
          },
          rows,
          notes,
        }),
      })
      if (!res.ok) throw new Error(`Failed to save connectivity (${res.status})`)
      setStatusMessage('Saved')
      setTimeout(() => setStatusMessage(''), 2500)
    } catch (err) {
      console.error(err)
      setError('Unable to save connectivity. Try again.')
    } finally {
      setSaving(false)
    }
  }, [engagementId, connectivitySummary, connectivityConnectedRows, connectivityNotConnectedRows, connectivityNotes]);

  const persistCapacityReview = useCallback(async () => {
    if (!engagementId) return
    setSaving(true)
    setError(null)
    setStatusMessage('')
    try {
      const section = {
        title: capacityReview.title.trim(),
        summary: capacityReview.summary.trim(),
        highlightBullets: (capacityReview.highlightBullets ?? [])
          .map((bullet) => bullet.trim())
          .filter((bullet) => bullet.length > 0),
        systems: (capacityReview.systems ?? [])
          .map((row) => ({
            systemName: row.systemName.trim(),
            healthScore: row.healthScore.trim(),
            status: row.status.trim(),
            remarks: row.remarks.trim(),
          }))
          .filter((row) => row.systemName || row.healthScore || row.status || row.remarks),
        screenshotCaption: capacityReview.screenshotCaption.trim(),
      }

      const res = await fetch('/api/capacity-review', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          engagementId,
          section,
        }),
      })
      if (!res.ok) throw new Error(`Failed to save capacity review (${res.status})`)
      setStatusMessage('Saved')
      setTimeout(() => setStatusMessage(''), 2500)
    } catch (err) {
      console.error(err)
      setError('Unable to save capacity review. Try again.')
    } finally {
      setSaving(false)
    }
  }, [engagementId, capacityReview]);

  const persistContractsReview = useCallback(async () => {
    if (!engagementId) return
    setSaving(true)
    setError(null)
    setStatusMessage('')
    try {
      const section = {
        title: contractsReview.title.trim(),
        summary: contractsReview.summary.trim(),
        keyNotes: (contractsReview.keyNotes ?? []).map((note) => note.trim()).filter((note) => note.length > 0),
        statusHighlights: (contractsReview.statusHighlights ?? []).map((item) => ({
          label: item.label.trim(),
          value: item.value.trim(),
        })),
        productHighlights: (contractsReview.productHighlights ?? []).map((item) => ({
          label: item.label.trim(),
          value: item.value.trim(),
        })),
        screenshotCaption: contractsReview.screenshotCaption.trim(),
      }

      const res = await fetch('/api/contracts-review', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          engagementId,
          section,
        }),
      })
      if (!res.ok) throw new Error(`Failed to save contracts review (${res.status})`)
      setStatusMessage('Saved')
      setTimeout(() => setStatusMessage(''), 2500)
    } catch (err) {
      console.error(err)
      setError('Unable to save contracts review. Try again.')
    } finally {
      setSaving(false)
    }
  }, [engagementId, contractsReview]);

  const persistRiskRegister = useCallback(async () => {
    if (!engagementId) return
    setSaving(true)
    setError(null)
    setStatusMessage('')
    try {
      const section = {
        title: riskRegister.title.trim(),
        summary: riskRegister.summary.trim(),
        rows: (riskRegister.rows ?? []).map((row) => ({
          category: row.category.trim(),
          description: row.description.trim(),
          priority: row.priority.trim(),
          probability: row.probability.trim(),
          owner: row.owner.trim(),
          status: row.status.trim(),
          dueDate: row.dueDate.trim(),
          mitigation: row.mitigation.trim(),
        })),
      }

      const res = await fetch('/api/risk-register', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          engagementId,
          section,
        }),
      })
      if (!res.ok) throw new Error(`Failed to save risk register (${res.status})`)
      setStatusMessage('Saved')
      setTimeout(() => setStatusMessage(''), 2500)
    } catch (err) {
      console.error(err)
      setError('Unable to save risk register. Try again.')
    } finally {
      setSaving(false)
    }
  }, [engagementId, riskRegister]);

  const persistActionSummary = useCallback(async () => {
    if (!engagementId) return
    setSaving(true)
    setError(null)
    setStatusMessage('')
    try {
      const section = {
        title: actionSummary.title.trim(),
        summary: actionSummary.summary.trim(),
        rows: (actionSummary.rows ?? []).map((row) => ({
          action: row.action.trim(),
          owner: row.owner.trim(),
          status: row.status.trim(),
          dueDate: row.dueDate.trim(),
          notes: row.notes.trim(),
        })),
      }

      const res = await fetch('/api/action-summary', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          engagementId,
          section,
        }),
      })
      if (!res.ok) throw new Error(`Failed to save action summary (${res.status})`)
      setStatusMessage('Saved')
      setTimeout(() => setStatusMessage(''), 2500)
    } catch (err) {
      console.error(err)
      setError('Unable to save action summary. Try again.')
    } finally {
      setSaving(false)
    }
  }, [engagementId, actionSummary]);

  const persistStandardInformation = useCallback(async () => {
    if (!engagementId) return
    setSaving(true)
    setError(null)
    setStatusMessage('')
    try {
      const section = {
        title: standardInformation.title.trim(),
        summary: standardInformation.summary.trim(),
        contacts: (standardInformation.contacts ?? []).map((contact) => ({
          tier: contact.tier.trim(),
          name: contact.name.trim(),
          role: contact.role.trim(),
          email: contact.email.trim(),
          phone: contact.phone.trim(),
          notes: contact.notes.trim(),
        })),
        additionalNotes: (standardInformation.additionalNotes ?? [])
          .map((note) => note.trim())
          .filter((note) => note.length > 0),
      }

      const res = await fetch('/api/standard-information', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          engagementId,
          section,
        }),
      })
      if (!res.ok) throw new Error(`Failed to save standard information (${res.status})`)
      setStatusMessage('Saved')
      setTimeout(() => setStatusMessage(''), 2500)
    } catch (err) {
      console.error(err)
      setError('Unable to save standard information. Try again.')
    } finally {
      setSaving(false)
    }
  }, [engagementId, standardInformation]);

  const persistAdvisories = useCallback(async () => {
    if (!engagementId) return
    setSaving(true)
    setError(null)
    setStatusMessage('')
    try {
      const sections = advisories.map((section) => ({
        title: section.title.trim(),
        subtitle: section.subtitle.trim(),
        summary: section.summary.trim(),
        notes: (section.notes ?? []).map((note) => note.trim()).filter((note) => note.length > 0),
      }))

      const res = await fetch('/api/advisories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          engagementId,
          sections,
        }),
      })
      if (!res.ok) throw new Error(`Failed to save advisories (${res.status})`)
      setStatusMessage('Saved')
      setTimeout(() => setStatusMessage(''), 2500)
    } catch (err) {
      console.error(err)
      setError('Unable to save advisories. Try again.')
    } finally {
      setSaving(false)
    }
  }, [engagementId, advisories]);

  const persistFcoTse = useCallback(async () => {
    if (!engagementId) return
    setSaving(true)
    setError(null)
    setStatusMessage('')
    try {
      const rows = fcoTseRows
        .map((row) => ({
          srCreated: row.srCreated.trim(),
          fcoId: row.fcoId.trim(),
          description: row.description.trim(),
          srNumber: row.srNumber.trim(),
          severity: row.severity.trim(),
          serialNumber: row.serialNumber.trim(),
          status: row.status.trim(),
          productName: row.productName.trim(),
          problemSummary: row.problemSummary.trim(),
        }))
        .filter((row) =>
          Object.values(row).some((value) => typeof value === 'string' && value.trim().length > 0),
        )

      const res = await fetch('/api/fco-tse', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          engagementId,
          rows,
        }),
      })
      if (!res.ok) throw new Error(`Failed to save FCO & TSE detail (${res.status})`)
      setStatusMessage('Saved')
      setTimeout(() => setStatusMessage(''), 2500)
    } catch (err) {
      console.error(err)
      setError('Unable to save FCO & TSE. Try again.')
    } finally {
      setSaving(false)
    }
  }, [engagementId, fcoTseRows]);

const persistMajorIncidents = useCallback(async () => {
    if (!engagementId) return
    setSaving(true)
    setError(null)
    setStatusMessage('')
    try {
      const res = await fetch('/api/incidents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          engagementId,
          incidents: majorIncidents.map((item) => ({
            id: item.id,
            system: item.system.trim(),
            sn: item.sn.trim(),
            codeLevel: item.codeLevel.trim(),
            summary: item.summary.trim(),
            createdAt: item.createdAt || null,
            resolvedAt: item.resolvedAt || null,
            closedAt: item.closedAt || null,
            status: item.status.trim(),
            impact: item.impact.trim(),
            resolution: item.resolution.trim(),
            recommendation: item.recommendation.trim(),
          })),
        }),
      })
      if (!res.ok) throw new Error(`Failed to save incidents (${res.status})`)
      const payload = await res.json()
      setMajorIncidents(Array.isArray(payload) ? payload.map(normalizeIncidentDraft) : [])
      setStatusMessage('Saved')
      setTimeout(() => setStatusMessage(''), 2500)
    } catch (err) {
      console.error(err)
      setError('Unable to save major incidents. Try again.')
    } finally {
      setSaving(false)
    }
  }, [engagementId, majorIncidents]);

  const handleStepSave = useCallback(async () => {
    if (step === MAJOR_INCIDENT_STEP) {
      await persistMajorIncidents()
    } else if (step === FCO_TSE_STEP) {
      await persistFcoTse()
    } else if (step === ADVISORIES_STEP) {
      await persistAdvisories()
    } else if (step === STANDARD_INFORMATION_STEP) {
      await persistStandardInformation()
    } else if (step === ACTION_SUMMARY_STEP) {
      await persistActionSummary()
    } else if (step === RISK_REGISTER_STEP) {
      await persistRiskRegister()
    } else if (step === CONTRACTS_REVIEW_STEP) {
      await persistContractsReview()
    } else if (step === CAPACITY_REVIEW_STEP) {
      await persistCapacityReview()
    } else if (step === CONNECTIVITY_STEP) {
      await persistConnectivity()
    } else if (step === CODE_CURRENCY_STEP) {
      await persistCodeCurrency()
    } else {
      await persistSummary()
    }
  }, [
    step,
    MAJOR_INCIDENT_STEP,
    FCO_TSE_STEP,
    ADVISORIES_STEP,
    STANDARD_INFORMATION_STEP,
    ACTION_SUMMARY_STEP,
    RISK_REGISTER_STEP,
    CONTRACTS_REVIEW_STEP,
    CAPACITY_REVIEW_STEP,
    CONNECTIVITY_STEP,
    CODE_CURRENCY_STEP,
    persistMajorIncidents,
    persistFcoTse,
    persistAdvisories,
    persistStandardInformation,
    persistActionSummary,
    persistRiskRegister,
    persistContractsReview,
    persistCapacityReview,
    persistConnectivity,
    persistCodeCurrency,
    persistSummary,
  ]);

  if (organizationsLoading) {
    return <div className="rounded-lg bg-white p-4 shadow">Loading customers...</div>
  }

  if (!organizations.length) {
    return (
      <div className="rounded-lg bg-white p-4 shadow">
        <h1 className="mb-2 text-lg font-semibold">New Session - Guided Capture</h1>
        <p className="text-sm text-slate-700">
          No customers found. Add organizations before capturing sessions.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">New Session - Guided Capture</h1>

      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <label className="text-slate-600">Customer:</label>
          <select
            className="rounded border px-2 py-1"
            value={selectedOrgId}
            onChange={(event) => setSelectedOrgId(event.target.value)}
          >
            {organizations.map((org: any) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-slate-600">Interval:</label>
          <select
            className="rounded border px-2 py-1"
            value={reportType}
            onChange={(event) => setReportType(event.target.value)}
          >
            {REPORT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-slate-600">Period:</label>

          {/* Start (day-precision) */}
          <input
            type="date"
            min={MIN_DATE}
            max={MAX_DATE}
            className="rounded border px-2 py-1"
            value={periodRange.start}
            onChange={(event) => {
              const normalized = normalizeDateInput(event.target.value)
              if (!normalized) {
                setPeriodRange({ start: '', end: '' })
                setEngagementId('')
                return
              }

              const nextEnd =
                !periodRange.end || compareDateStrings(periodRange.end, normalized) < 0
                  ? defaultEndForType(reportType, normalized)
                  : periodRange.end

              setPeriodRange({ start: normalized, end: nextEnd })
              void ensureEngagement(normalized, nextEnd)
            }}
            disabled={!selectedOrgId}
          />

          <span className="text-slate-500">to</span>

          {/* End (day-precision) */}
          <input
            type="date"
            min={MIN_DATE}
            max={MAX_DATE}
            className="rounded border px-2 py-1"
            value={periodRange.end}
            onChange={(event) => {
              const normalized = normalizeDateInput(event.target.value)
              if (!normalized) {
                const startValue = periodRange.start || ''
                setPeriodRange({ start: startValue, end: startValue })
                return
              }

              const startValue = periodRange.start || normalized
              const adjustedEnd =
                compareDateStrings(normalized, startValue) >= 0 ? normalized : startValue

              setPeriodRange({ start: startValue, end: adjustedEnd })
              void ensureEngagement(startValue, adjustedEnd)
            }}
            disabled={!selectedOrgId}
          />
        </div>
        {engagementsLoading && <span className="text-xs text-slate-500">Loading engagements...</span>}
      </div>

      <WizardStepper step={step} />

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {!engagementsLoading && !error && !engagementId && !periodRange.start && (
        <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Select a start period to create a new engagement for this interval.
        </div>
      )}

      {step === 0 && (
        <Section title="Step 1 - Top 5 Products" evidenceKey="01_Top5" engagementId={engagementId}>
          <p className="mb-3 text-sm text-slate-600">
            Ask the customer to open MS360 -&gt; SRs by Product (last 12 months). Enter the table below and upload
            screenshots on the right.
          </p>
          <div className="space-y-4">
            {topProductsBusy && (
              <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                {summaryLoading ? 'Loading top products...' : 'Importing top products CSV...'}
              </div>
            )}
            <div className="flex items-center justify-end gap-2">
              <input
                ref={topProductsFileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleTopProductsCsvImport}
                className="hidden"
              />
              <button
                type="button"
                className="inline-flex items-center rounded border border-[#143a66] px-3 py-1 text-xs font-semibold text-[#143a66] transition hover:bg-[#143a66]/10 disabled:opacity-50"
                onClick={() => topProductsFileInputRef.current?.click()}
                disabled={disabledTopProductsInputs}
              >
                Import CSV
              </button>
            </div>
            <TopFiveForm value={topProducts} onChange={setTopProducts} disabled={disabledTopProductsInputs} />
          </div>
        </Section>
      )}

      {step === 1 && (
        <Section title="Step 2 - Service Request Volume Trend" evidenceKey="02_VolumeTrend" engagementId={engagementId}>
          <p className="mb-3 text-sm text-slate-600">
            Ask for monthly SR counts for the period. Enter Jan-Dec values; upload chart screenshot(s).
          </p>
          <TrendForm value={trendPoints} onChange={setTrendPoints} />
        </Section>
      )}

      {step === 2 && (
        <Section title="Step 3 - Service Request Severity" evidenceKey="03_Severity" engagementId={engagementId}>
          <p className="mb-3 text-sm text-slate-600">
            Donut split by S1 (red), S2 (amber), S3 (green), S5 (blue). Ensure total = 100%.
          </p>
          <SeverityForm value={severitySplit} onChange={setSeveritySplit} />
        </Section>
      )}

      {step === 3 && (
        <Section title="Step 4 - Service Request Channels" evidenceKey="04_Channels" engagementId={engagementId}>
          <p className="mb-3 text-sm text-slate-600">
            Stacked bar with Dial-Home, Web, Phone, Connect Home, Chat, Email. Ensure total = 100%.
          </p>
          <ChannelsForm value={channelSplit} onChange={setChannelSplit} />
        </Section>
      )}

      {step === 4 && (
        <Section title="Step 5 - Key Notes" evidenceKey="05_KeyNotes" engagementId={engagementId}>
          <p className="mb-3 text-sm text-slate-600">
            Summarize the critical observations for this reporting period. Each line becomes a bullet on the dashboard.
          </p>
          <KeyNotesForm value={keyNotes} onChange={setKeyNotes} />
        </Section>
      )}

{step === SPARE_PART_STEP && (
  <Section
    title={`Step ${SPARE_PART_STEP + 1} - Spare Parts Replacement`}
    evidenceKey="06_SpareParts"
    engagementId={engagementId}
  >
    <p className="mb-3 text-sm text-slate-600">
      Capture parts replaced during the period. Leave a field blank if it does not apply.
    </p>
    <SparePartsForm value={spareParts} onChange={setSpareParts} />
  </Section>
)}

{step === CODE_CURRENCY_STEP && (
  <Section
    title={`Step ${CODE_CURRENCY_STEP + 1} - Code Currency`}
    evidenceKey="07_CodeCurrency"
    engagementId={engagementId}
    stackEvidence
  >
    <p className="mb-3 text-sm text-slate-600">
      Catalogue the current firmware baseline for each managed platform. Flag the support posture and
      document the minimum, recommended, and latest code paths.
    </p>
    {codeCurrencyLoading && (
      <div className="mb-3 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
        Loading code currency...
      </div>
    )}
    <CodeCurrencyForm
      value={codeCurrencyRows}
      onChange={setCodeCurrencyRows}
      disabled={!engagementId || saving || codeCurrencyLoading}
      importOptions={{
        customerName: selectedOrg?.name,
      }}
    />
  </Section>
)}

{step === CONNECTIVITY_STEP && (
  <Section
    title={`Step ${CONNECTIVITY_STEP + 1} - Connectivity`}
    evidenceKey="08_Connectivity"
    engagementId={engagementId}
    stackEvidence
  >
    <p className="mb-3 text-sm text-slate-600">
      Capture connectivity status for eligible assets. Identify which devices are actively reporting telemetry and
      highlight those that require restoration.
    </p>
    <div className="space-y-6">
      {connectivityBusy && (
        <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          {connectivityLoading ? 'Loading connectivity...' : 'Importing connectivity CSV...'}
        </div>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid flex-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          <label className="text-xs font-semibold uppercase tracking-wide text-[#5B6B7C]">
            Total Assets
            <input
              type="number"
              min={0}
              className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
              value={connectivitySummary.totalAssets}
              onChange={(event) =>
                setConnectivitySummary((prev) => ({ ...prev, totalAssets: Number(event.target.value) || 0 }))
              }
              disabled={disabledConnectivityInputs}
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-wide text-[#5B6B7C]">
            Connected Assets
            <input
              type="number"
              min={0}
              className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
              value={connectivitySummary.connectedCount}
              onChange={(event) =>
                setConnectivitySummary((prev) => ({ ...prev, connectedCount: Number(event.target.value) || 0 }))
              }
              disabled={disabledConnectivityInputs}
            />
          </label>
          <div className="rounded border border-slate-200 bg-[#f5f8ff] px-3 py-2 text-xs text-[#4a5d7a]">
            <div className="font-semibold text-[#123c73]">Derived Not Connected</div>
            <div className="text-base font-semibold text-[#c62828]">
              {Math.max(
                connectivitySummary.totalAssets - connectivitySummary.connectedCount,
                connectivityNotConnectedRows.length,
              )}
            </div>
            <div>Calculated from totals or row count.</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={connectivityFileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleConnectivityCsvImport}
            className="hidden"
          />
          <button
            type="button"
            className="inline-flex items-center rounded border border-[#03626d] px-3 py-1 text-xs font-semibold text-[#03626d] transition hover:bg-[#03626d]/10 disabled:opacity-50"
            onClick={() => connectivityFileInputRef.current?.click()}
            disabled={disabledConnectivityInputs}
          >
            Import CSV
          </button>
        </div>
      </div>
      <ConnectivityCaptureForm
        connected={connectivityConnectedRows}
        notConnected={connectivityNotConnectedRows}
        onChange={({ connected, notConnected }) => {
          setConnectivityConnectedRows(connected)
          setConnectivityNotConnectedRows(notConnected)
        }}
        disabled={disabledConnectivityInputs}
        notesSlot={
          <ConnectivityNotesEditor
            value={connectivityNotes}
            onChange={setConnectivityNotes}
            disabled={disabledConnectivityInputs}
          />
        }
      />
    </div>
  </Section>
)}

{step === CAPACITY_REVIEW_STEP && (
  <Section
    title={`Step ${CAPACITY_REVIEW_STEP + 1} - Capacity Review`}
    evidenceKey="09_CapacityReview"
    engagementId={engagementId}
  >
    <p className="mb-3 text-sm text-slate-600">
      Document the capacity dashboard callouts. Capture sidebar messaging, the system health table, and any notes that align
      with the uploaded screenshot.
    </p>
    {capacityLoading && (
      <div className="mb-3 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
        Loading capacity review...
      </div>
    )}
    <CapacityReviewForm value={capacityReview} onChange={setCapacityReview} disabled={!engagementId || saving || capacityLoading} />
  </Section>
)}

{step === CONTRACTS_REVIEW_STEP && (
  <Section
    title={`Step ${CONTRACTS_REVIEW_STEP + 1} - Contracts Review`}
    evidenceKey="10_ContractsReview"
    engagementId={engagementId}
  >
    <p className="mb-3 text-sm text-slate-600">
      Capture support contract coverage and renewal status. Summarize the chart highlights and add talking points that align with the uploaded screenshot.
    </p>
    <div className="space-y-4">
      {contractsBusy && (
        <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          {contractsLoading ? 'Loading contracts review...' : 'Importing contracts review CSV...'}
        </div>
      )}
      <div className="flex items-center justify-end gap-2">
        <input
          ref={contractsFileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleContractsCsvImport}
          className="hidden"
        />
        <button
          type="button"
          className="inline-flex items-center rounded border border-[#5B6B7C] px-3 py-1 text-xs font-semibold text-[#394b5c] transition hover:bg-[#5B6B7C]/10 disabled:opacity-50"
          onClick={() => contractsFileInputRef.current?.click()}
          disabled={disabledContractsInputs}
        >
          Import CSV
        </button>
      </div>
      <ContractsReviewForm
        value={contractsReview}
        onChange={setContractsReview}
        disabled={disabledContractsInputs}
      />
    </div>
  </Section>
)}

{step === RISK_REGISTER_STEP && (
  <Section
    title={`Step ${RISK_REGISTER_STEP + 1} - Risk Register`}
    evidenceKey="11_RiskRegister"
    engagementId={engagementId}
  >
    <p className="mb-3 text-sm text-slate-600">
      Maintain the risk register with category, priority, owner, and mitigation actions. Keep descriptions concise and update status as reviews progress.
    </p>
    {riskRegisterLoading && (
      <div className="mb-3 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">Loading risk register...</div>
    )}
    <RiskRegisterForm
      value={riskRegister}
      onChange={setRiskRegister}
      disabled={!engagementId || saving || riskRegisterLoading}
    />
  </Section>
)}

{step === ACTION_SUMMARY_STEP && (
  <Section
    title={`Step ${ACTION_SUMMARY_STEP + 1} - Action Summary`}
    evidenceKey="12_ActionSummary"
    engagementId={engagementId}
  >
    <p className="mb-3 text-sm text-slate-600">
      Track the action items agreed with the customer. Include owners, due dates, and supporting notes for each follow-up.
    </p>
    {actionSummaryLoading && (
      <div className="mb-3 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">Loading action summary...</div>
    )}
    <ActionSummaryForm
      value={actionSummary}
      onChange={setActionSummary}
      disabled={!engagementId || saving || actionSummaryLoading}
    />
  </Section>
)}

{step === STANDARD_INFORMATION_STEP && (
  <Section
    title={`Step ${STANDARD_INFORMATION_STEP + 1} - Standard Information`}
    evidenceKey="13_StandardInformation"
    engagementId={engagementId}
  >
    <p className="mb-3 text-sm text-slate-600">
      Maintain the escalation matrix and support contacts. Capture the sequence, roles, and key details for urgent engagements.
    </p>
    {standardInformationLoading && (
      <div className="mb-3 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
        Loading standard information...
      </div>
    )}
    <StandardInformationForm
      value={standardInformation}
      onChange={setStandardInformation}
      disabled={!engagementId || saving || standardInformationLoading}
    />
  </Section>
)}

{step === ADVISORIES_STEP && (
  <Section
    title={`Step ${ADVISORIES_STEP + 1} - Advisories`}
    evidenceKey="14_Advisories"
    engagementId={engagementId}
  >
    <p className="mb-3 text-sm text-slate-600">
      Summarize the key security, technical, and AIOps advisories. Capture the headline, supporting subtitle, and
      bullet notes that correspond to the uploaded screenshots.
    </p>
    {advisoriesLoading && (
      <div className="mb-3 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
        Loading advisories...
      </div>
    )}
    <AdvisoriesForm value={advisories} onChange={setAdvisories} disabled={!engagementId || saving || advisoriesLoading} />
  </Section>
)}

{step === FCO_TSE_STEP && (
  <Section
    title={`Step ${FCO_TSE_STEP + 1} - FCO & TSE`}
    evidenceKey="15_FcoTse"
    engagementId={engagementId}
  >
    <p className="mb-3 text-sm text-slate-600">
      Capture Field Change Orders and Technical Support Escalations raised during this period. Note the
      originating SR, impacted product, and a concise problem summary.
    </p>
    {fcoTseLoading && (
      <div className="mb-3 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
        Loading FCO &amp; TSE detail...
      </div>
    )}
    <FcoTseForm value={fcoTseRows} onChange={setFcoTseRows} disabled={!engagementId || saving || fcoTseLoading} />
  </Section>
)}

{step === MAJOR_INCIDENT_STEP && (
  <Section
    title={`Step ${MAJOR_INCIDENT_STEP + 1} - Major Incidents`}
    evidenceKey="16_MajorIncidents"
    engagementId={engagementId}
  >
    <p className="mb-3 text-sm text-slate-600">
      Record Sev 1/Sev 2 incidents raised during this reporting period. Include a concise summary, impact,
      and the agreed resolution or recommendation.
    </p>
    {incidentsLoading && (
      <div className="mb-3 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
        Loading incidents...
      </div>
    )}
    <MajorIncidentsForm value={majorIncidents} onChange={setMajorIncidents} disabled={!engagementId || saving || incidentsLoading} />
  </Section>
)}

      <div className="flex items-center gap-3">
        <button
          className="rounded bg-slate-200 px-3 py-1.5"
          disabled={step === 0 || saving}
          onClick={() => setStep((current) => Math.max(0, current - 1))}
        >
          Back
        </button>
        <button
          className="rounded bg-blue-600 px-3 py-1.5 font-medium text-white disabled:opacity-50"
          disabled={!canSave}
          onClick={async () => {
            await handleStepSave()
            setStep((current) => Math.min(MAX_STEP, current + 1))
          }}
        >
          {saving ? 'Saving...' : 'Save & Continue'}
        </button>
        {statusMessage && <span className="text-xs text-green-700">{statusMessage}</span>}
      {currentStepLoading && <span className="text-xs text-slate-500">Loading data...</span>}
    </div>

      {currentEngagement && (
        <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          Status: <span className={isPublished ? 'text-green-700' : 'text-amber-700'}>{currentEngagement.status}</span>
          <button
            className="ml-3 inline-flex items-center rounded bg-slate-700 px-2 py-1 text-xs font-medium text-white disabled:opacity-50"
            disabled={publishing}
            onClick={async () => {
              if (!engagementId) return
              const nextStatus = isPublished ? 'Draft' : 'Published'
              setPublishing(true)
              setError(null)
              try {
                const res = await fetch('/api/engagements', {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ id: engagementId, status: nextStatus }),
                })
                if (!res.ok) throw new Error(`Failed to update status (${res.status})`)
                const updated = await res.json()
                upsertEngagementInState(updated)
                setStatusMessage(`Status updated to ${nextStatus}`)
                setTimeout(() => setStatusMessage(''), 2500)
              } catch (err) {
                console.error(err)
                setError('Unable to update engagement status. Try again.')
              } finally {
                setPublishing(false)
              }
            }}
          >
            {publishing ? 'Updating...' : isPublished ? 'Mark Draft' : 'Publish'}
          </button>
        </div>
      )}
    </div>
  )
}

function Section({
  title,
  evidenceKey,
  engagementId,
  children,
  stackEvidence = false,
}: {
  title: string
  evidenceKey: string
  engagementId: string
  children: React.ReactNode
  stackEvidence?: boolean
}) {
  const disabled = !engagementId
  if (stackEvidence) {
    return (
      <div className="space-y-4">
        <div className="space-y-3 rounded-lg bg-white p-4 shadow">
          <h2 className="font-semibold">{title}</h2>
          {children}
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <h3 className="mb-2 font-semibold">Evidence</h3>
          {disabled ? (
            <div className="text-xs text-slate-500">Select an engagement to enable uploads.</div>
          ) : (
            <FileDropZone engagementId={engagementId} sectionKey={evidenceKey} environment="HQ" />
          )}
        </div>
      </div>
    )
  }
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="space-y-3 rounded-lg bg-white p-4 shadow md:col-span-2">
        <h2 className="font-semibold">{title}</h2>
        {children}
      </div>
      <div className="rounded-lg bg-white p-4 shadow">
        <h3 className="mb-2 font-semibold">Evidence</h3>
        {disabled ? (
          <div className="text-xs text-slate-500">Select an engagement to enable uploads.</div>
        ) : (
          <FileDropZone engagementId={engagementId} sectionKey={evidenceKey} environment="HQ" />
        )}
      </div>
    </div>
  )
}

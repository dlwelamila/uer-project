'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'

type TabKey = 'home' | 'leads' | 'opportunities' | 'customers' | 'analytics'

type SalesLeadRecord = {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string
  manager: string | null
  status: string
  estimatedValue: number | null
  probability: number | null
  source: string | null
  sector: string | null
  region: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  initials: string
}

type SalesLeadApiRecord = Omit<SalesLeadRecord, 'initials'> & { initials?: string }

type SalesTargetRecord = {
  id: string
  period: 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
  amount: number
  periodStart: string
  periodEnd: string
  createdAt: string
  updatedAt: string
}

type LeadFilters = {
  status: string
  manager: string
  minValue: string
  maxValue: string
  sector: string
  region: string
  company: string
}

type LeadFormState = {
  name: string
  company: string
  email: string
  phone: string
  manager: string
  source: string
  value: string
  sector: string
  region: string
  notes: string
}

type ConvertFormState = {
  name: string
  stage: string
  probability: string
  solution: string
  closeDate: string
  competitors: string
  kdm: string
  value: string
}

type TargetFormState = {
  period: 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
  amount: string
  periodStart: string
  periodEnd: string
}

type ToastTone = 'success' | 'error' | 'info'

type ToastState = {
  message: string
  tone: ToastTone
}

type ActivityItem = {
  id: string
  title: string
  detail: string
  time: string
}

type CustomerTableRow = {
  company: string
  location: string | null
  count: number
}

type PerformanceSnapshot = {
  targetContext: string
  targetRange: string | null
  targetSummary: string
  targetPercent: number
  conversionRate: number
  salesCycleLabel: string
  salesCyclePercent: number
}

type AnalyticsOverview = {
  totals: {
    leads: number
    opps: number
    customerLeads: number
    customerOpps: number
  }
  perManager: Array<{
    manager: string
    leads: number
    lostLeads: number
    opps: number
    activeOpps: number
    won: number
    lost: number
    rate: number
  }>
  topCustomers: Array<{
    company: string
    total: number
    leads: number
    opportunities: number
    dominantRegion: string
  }>
  outcomes: {
    won: number
    lost: number
    active: number
    total: number
  }
}

type CustomerTables = {
  leadRows: CustomerTableRow[]
  opportunityRows: CustomerTableRow[]
}

const defaultFilters: LeadFilters = {
  status: '',
  manager: '',
  minValue: '',
  maxValue: '',
  sector: '',
  region: '',
  company: '',
}

const opportunityStatuses = new Set<string>([
  'Qualified',
  'Proposal',
  'Quotation',
  'Evaluation',
  'Closed Won',
  'Closed Lost',
])

const lostStatusKeywords = ['lost', 'inactive', 'disqual', 'nurture', 'no go'] as const

function isLostStatus(status: string | null | undefined): boolean {
  if (!status) return false
  const normalized = status.toLowerCase()
  return lostStatusKeywords.some((keyword) => normalized.includes(keyword))
}

const pipelineStages = [
  { id: '01', label: 'Capture', state: 'completed' },
  { id: '02', label: 'Qualify', state: 'completed' },
  { id: '03', label: 'Solution', state: 'active' },
  { id: '04', label: 'Proposal', state: 'upcoming' },
  { id: '05', label: 'Negotiation', state: 'upcoming' },
  { id: '06', label: 'Close', state: 'upcoming' },
] as const

const periodLabels: Record<SalesTargetRecord['period'], string> = {
  MONTHLY: 'Monthly target',
  QUARTERLY: 'Quarterly target',
  YEARLY: 'Annual target',
}

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
})

function formatCurrency(value: number | null | undefined): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—'
  return currencyFormatter.format(value)
}

function formatText(value: string | null | undefined, fallback = '—'): string {
  const cleaned = value?.trim()
  return cleaned && cleaned.length > 0 ? cleaned : fallback
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return dateTimeFormatter.format(date)
}

function formatDateRange(start: string | null | undefined, end: string | null | undefined): string {
  if (!start && !end) return 'Unscheduled'
  if (!start) return `Until ${formatDateTime(end)}`
  if (!end) return `From ${formatDateTime(start)}`
  const startDate = new Date(start)
  const endDate = new Date(end)
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return `${formatDateTime(start)} → ${formatDateTime(end)}`
  }
  return `${dateFormatter.format(startDate)} → ${dateFormatter.format(endDate)}`
}

function formatDateInput(date: Date): string {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addPeriodRange(period: TargetFormState['period']): { periodStart: string; periodEnd: string } {
  const now = new Date()
  const start = new Date(now)
  const end = new Date(now)

  switch (period) {
    case 'MONTHLY': {
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      end.setMonth(start.getMonth() + 1, 0)
      end.setHours(23, 59, 59, 999)
      break
    }
    case 'QUARTERLY': {
      const quarter = Math.floor(start.getMonth() / 3)
      start.setMonth(quarter * 3, 1)
      start.setHours(0, 0, 0, 0)
      end.setMonth(quarter * 3 + 3, 0)
      end.setHours(23, 59, 59, 999)
      break
    }
    case 'YEARLY': {
      start.setMonth(0, 1)
      start.setHours(0, 0, 0, 0)
      end.setMonth(12, 0)
      end.setHours(23, 59, 59, 999)
      break
    }
  }

  return {
    periodStart: formatDateInput(start),
    periodEnd: formatDateInput(end),
  }
}

function deriveInitials(record: SalesLeadApiRecord): SalesLeadRecord {
  const names = record.name.split(' ')
  const initials = names.length >= 2 
    ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
    : record.name.slice(0, 2).toUpperCase()
  
  return {
    ...record,
    initials: record.initials || initials,
  }
}

function defaultLeadForm(): LeadFormState {
  return {
    name: '',
    company: '',
    email: '',
    phone: '',
    manager: '',
    source: '',
    value: '',
    sector: '',
    region: '',
    notes: '',
  }
}

function defaultConvertForm(lead?: SalesLeadRecord | null): ConvertFormState {
  const inferredStage = lead?.status && lead.status.length > 0 ? lead.status : 'Qualified'
  const probability =
    lead?.probability != null && !Number.isNaN(lead.probability) ? String(lead.probability) : '50'
  const estimatedValue =
    lead?.estimatedValue != null && !Number.isNaN(lead.estimatedValue) ? String(lead.estimatedValue) : ''
  const fallbackCloseDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  const candidateCloseDate = lead?.updatedAt ? new Date(lead.updatedAt) : fallbackCloseDate
  const closeDateSource = Number.isNaN(candidateCloseDate.getTime()) ? fallbackCloseDate : candidateCloseDate
  const closeDate = formatDateInput(closeDateSource)

  return {
    name: lead?.name || '',
    stage: inferredStage,
    probability,
    solution: '',
    closeDate,
    competitors: '',
    kdm: '',
    value: estimatedValue,
  }
}

function defaultTargetForm(period?: SalesTargetRecord['period']): TargetFormState {
  const basePeriod = period || 'MONTHLY'
  const range = addPeriodRange(basePeriod)
  
  return {
    period: basePeriod,
    amount: '',
    periodStart: range.periodStart,
    periodEnd: range.periodEnd,
  }
}

function targetFormFromRecord(target: SalesTargetRecord): TargetFormState {
  return {
    period: target.period,
    amount: target.amount.toString(),
    periodStart: target.periodStart.slice(0, 10),
    periodEnd: target.periodEnd.slice(0, 10),
  }
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'New Lead':
      return 'bg-blue-100 text-blue-800'
    case 'Lead':
      return 'bg-sky-100 text-sky-800'
    case 'Qualified':
      return 'bg-emerald-100 text-emerald-800'
    case 'Proposal':
      return 'bg-amber-100 text-amber-800'
    case 'Quotation':
      return 'bg-violet-100 text-violet-800'
    case 'Evaluation':
      return 'bg-purple-100 text-purple-800'
    case 'Closed Won':
      return 'bg-green-100 text-green-800'
    case 'Closed Lost':
      return 'bg-rose-100 text-rose-800'
    default:
      return 'bg-slate-100 text-slate-800'
  }
}

function probabilityBadgeClass(probability: number | null): string {
  if (!probability) return 'bg-slate-100 text-slate-800'
  
  if (probability >= 80) return 'bg-emerald-100 text-emerald-800'
  if (probability >= 60) return 'bg-green-100 text-green-800'
  if (probability >= 40) return 'bg-amber-100 text-amber-800'
  if (probability >= 20) return 'bg-orange-100 text-orange-800'
  return 'bg-rose-100 text-rose-800'
}

export default function SalesPipeline() {
  const [activeTab, setActiveTab] = useState<TabKey>('home')
  const [leads, setLeads] = useState<SalesLeadRecord[]>([])
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [filters, setFilters] = useState<LeadFilters>(defaultFilters)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isMutating, setIsMutating] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [leadForm, setLeadForm] = useState<LeadFormState>(defaultLeadForm())
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false)
  const [convertLeadId, setConvertLeadId] = useState<string | null>(null)
  const [convertForm, setConvertForm] = useState<ConvertFormState>(defaultConvertForm())
  const [isOpportunityEdit, setIsOpportunityEdit] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [targets, setTargets] = useState<SalesTargetRecord[]>([])
  const [targetsLoading, setTargetsLoading] = useState(false)
  const [targetsError, setTargetsError] = useState<string | null>(null)
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false)
  const [editingTargetId, setEditingTargetId] = useState<string | null>(null)
  const [targetForm, setTargetForm] = useState<TargetFormState>(defaultTargetForm())
  const [isTargetMutating, setIsTargetMutating] = useState(false)

  // Mock data for demonstration
  const activityFeed: ActivityItem[] = [
    {
      id: '1',
      title: 'New lead captured',
      detail: 'John Smith from Acme Corp added to pipeline',
      time: '2 hours ago',
    },
    {
      id: '2',
      title: 'Opportunity converted',
      detail: 'Global Tech Inc moved to proposal stage',
      time: '1 day ago',
    },
  ]

  const leadRecords = useMemo(
    () => leads.filter((lead) => !opportunityStatuses.has(lead.status)),
    [leads],
  )

  const opportunityRecords = useMemo(
    () => leads.filter((lead) => opportunityStatuses.has(lead.status)),
    [leads],
  )

  const activeLeadRecords = useMemo(
    () => leadRecords.filter((lead) => !isLostStatus(lead.status)),
    [leadRecords],
  )

  const activeOpportunityRecords = useMemo(
    () => opportunityRecords.filter((lead) => !isLostStatus(lead.status) && lead.status !== 'Closed Lost'),
    [opportunityRecords],
  )

  const stats = useMemo(() => {
    const pipelineValue = leads.reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0)
    const activeOpps = activeOpportunityRecords.length
    const wonOpps = opportunityRecords.filter((lead) => lead.status === 'Closed Won').length
    const winRate = opportunityRecords.length > 0 ? Math.round((wonOpps / opportunityRecords.length) * 100) : 0

    return {
      totalLeads: activeLeadRecords.length,
      activeOpps,
      winRate,
      pipelineValue,
    }
  }, [activeLeadRecords.length, activeOpportunityRecords.length, opportunityRecords, leads])

  const analytics: AnalyticsOverview = useMemo(() => {
    const managerData = new Map<
      string,
      {
        leadsActive: number
        leadsLost: number
        oppsActive: number
        oppsWon: number
        oppsLost: number
      }
    >()
    const outcomeTally = { won: 0, lost: 0, active: 0 }

    leads.forEach((lead) => {
      const manager = lead.manager || 'Unassigned'
      if (!managerData.has(manager)) {
        managerData.set(manager, {
          leadsActive: 0,
          leadsLost: 0,
          oppsActive: 0,
          oppsWon: 0,
          oppsLost: 0,
        })
      }
      const bucket = managerData.get(manager)!

      if (opportunityStatuses.has(lead.status)) {
        if (lead.status === 'Closed Won') {
          bucket.oppsWon += 1
          outcomeTally.won += 1
        } else if (isLostStatus(lead.status)) {
          bucket.oppsLost += 1
          outcomeTally.lost += 1
        } else {
          bucket.oppsActive += 1
          outcomeTally.active += 1
        }
      } else if (isLostStatus(lead.status)) {
        bucket.leadsLost += 1
      } else {
        bucket.leadsActive += 1
      }
    })

    const perManager = Array.from(managerData.entries()).map(([manager, data]) => {
      const totalOpps = data.oppsWon + data.oppsLost + data.oppsActive
      return {
        manager,
        leads: data.leadsActive,
        lostLeads: data.leadsLost,
        opps: totalOpps,
        activeOpps: data.oppsActive,
        won: data.oppsWon,
        lost: data.oppsLost,
        rate: totalOpps > 0 ? Math.round((data.oppsWon / totalOpps) * 100) : 0,
      }
    })

    const companyData = new Map<
      string,
      { leads: number; opportunities: number; total: number; regions: Map<string, number> }
    >()
    leads.forEach((lead) => {
      if (!companyData.has(lead.company)) {
        companyData.set(lead.company, {
          leads: 0,
          opportunities: 0,
          total: 0,
          regions: new Map<string, number>(),
        })
      }
      const data = companyData.get(lead.company)!
      if (opportunityStatuses.has(lead.status)) {
        data.opportunities += 1
      } else {
        data.leads += 1
      }
      data.total += 1
      if (lead.region) {
        data.regions.set(lead.region, (data.regions.get(lead.region) || 0) + 1)
      }
    })

    const topCustomers = Array.from(companyData.entries())
      .map(([company, data]) => {
        let dominantRegion = 'Unknown'
        let maxCount = 0
        data.regions.forEach((count, region) => {
          if (count > maxCount) {
            maxCount = count
            dominantRegion = region
          }
        })

        return {
          company,
          total: data.total,
          leads: data.leads,
          opportunities: data.opportunities,
          dominantRegion,
        }
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)

    const outcomes = {
      won: outcomeTally.won,
      lost: outcomeTally.lost,
      active: outcomeTally.active,
    }

    return {
      totals: {
        leads: activeLeadRecords.length,
        opps: activeOpportunityRecords.length,
        customerLeads: new Set(activeLeadRecords.map((lead) => lead.company)).size,
        customerOpps: new Set(activeOpportunityRecords.map((lead) => lead.company)).size,
      },
      perManager,
      topCustomers,
      outcomes: {
        ...outcomes,
        total: outcomes.won + outcomes.lost + outcomes.active,
      },
    }
  }, [activeLeadRecords, activeOpportunityRecords, leads])

  const pieSegments = useMemo(
    () => [
      { key: 'won', label: 'Won', value: analytics.outcomes.won, stroke: '#34d399', dotClass: 'bg-emerald-400' },
      { key: 'active', label: 'In flight', value: analytics.outcomes.active, stroke: '#38bdf8', dotClass: 'bg-sky-400' },
      { key: 'lost', label: 'Lost', value: analytics.outcomes.lost, stroke: '#fb7185', dotClass: 'bg-rose-400' },
    ],
    [analytics.outcomes],
  )
  const pieTotal = pieSegments.reduce((sum, segment) => sum + segment.value, 0)
  const pieWonPercent = pieTotal > 0 ? Math.round((analytics.outcomes.won / pieTotal) * 100) : 0

  const customerTables: CustomerTables = useMemo(() => {
    const leadCompanies = new Map()
    const opportunityCompanies = new Map()

    leads.forEach(lead => {
      if (opportunityStatuses.has(lead.status)) {
        const current = opportunityCompanies.get(lead.company) || { count: 0, location: lead.region }
        opportunityCompanies.set(lead.company, {
          count: current.count + 1,
          location: lead.region || current.location,
        })
      } else {
        const current = leadCompanies.get(lead.company) || { count: 0, location: lead.region }
        leadCompanies.set(lead.company, {
          count: current.count + 1,
          location: lead.region || current.location,
        })
      }
    })

    return {
      leadRows: Array.from(leadCompanies.entries()).map(([company, data]) => ({
        company,
        location: data.location,
        count: data.count,
      })),
      opportunityRows: Array.from(opportunityCompanies.entries()).map(([company, data]) => ({
        company,
        location: data.location,
        count: data.count,
      })),
    }
  }, [leads])

  const performance: PerformanceSnapshot = useMemo(() => {
    const currentTarget = targets[0] // Simplified - use first target
    const totalValue = leads.reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0)
    const targetPercent = currentTarget ? Math.min(100, Math.round((totalValue / currentTarget.amount) * 100)) : 0
    const totalCaptured = activeLeadRecords.length + activeOpportunityRecords.length
    const conversionRate = totalCaptured ? Math.round((activeOpportunityRecords.length / totalCaptured) * 100) : 0

    return {
      targetContext: currentTarget ? `Current ${currentTarget.period.toLowerCase()} target` : 'No target set',
      targetRange: currentTarget ? formatDateRange(currentTarget.periodStart, currentTarget.periodEnd) : null,
      targetSummary: currentTarget ? `${formatCurrency(totalValue)} / ${formatCurrency(currentTarget.amount)}` : 'No target',
      targetPercent,
      conversionRate,
      salesCycleLabel: '28 days avg',
      salesCyclePercent: 65,
    }
  }, [activeLeadRecords.length, activeOpportunityRecords.length, leads, targets])

  const managerOptions = useMemo(() => {
    const managers = new Set(leads.map(lead => lead.manager).filter(Boolean) as string[])
    return Array.from(managers).sort()
  }, [leads])

  const filteredLeads = useMemo(() => {
    const baseRecords = filters.status ? leadRecords : activeLeadRecords

    return baseRecords.filter((lead) => {
      if (filters.status && lead.status !== filters.status) return false
      if (filters.manager && lead.manager !== filters.manager) return false
      if (filters.company && !lead.company.toLowerCase().includes(filters.company.toLowerCase())) return false
      if (filters.sector && (lead.sector ?? '').toLowerCase() !== filters.sector.toLowerCase()) return false
      if (filters.region && !(lead.region ?? '').toLowerCase().includes(filters.region.toLowerCase())) return false

      if (filters.minValue) {
        const min = Number(filters.minValue)
        if (!Number.isNaN(min) && (lead.estimatedValue || 0) < min) return false
      }

      if (filters.maxValue) {
        const max = Number(filters.maxValue)
        if (!Number.isNaN(max) && (lead.estimatedValue || 0) > max) return false
      }

      return true
    })
  }, [activeLeadRecords, filters, leadRecords])

  const filteredOpportunityLeads = useMemo(() => {
    const baseRecords = filters.status ? opportunityRecords : activeOpportunityRecords

    return baseRecords.filter((lead) => {
      if (filters.status && lead.status !== filters.status) return false
      if (filters.manager && lead.manager !== filters.manager) return false
      if (filters.company && !lead.company.toLowerCase().includes(filters.company.toLowerCase())) return false
      if (filters.sector && (lead.sector ?? '').toLowerCase() !== filters.sector.toLowerCase()) return false
      if (filters.region && !(lead.region ?? '').toLowerCase().includes(filters.region.toLowerCase())) return false

      if (filters.minValue) {
        const min = Number(filters.minValue)
        if (!Number.isNaN(min) && (lead.estimatedValue || 0) < min) return false
      }

      if (filters.maxValue) {
        const max = Number(filters.maxValue)
        if (!Number.isNaN(max) && (lead.estimatedValue || 0) > max) return false
      }

      return true
    })
  }, [activeOpportunityRecords, filters, opportunityRecords])

  const sortedTargets = useMemo(() => {
    return [...targets].sort((a, b) => new Date(b.periodStart).getTime() - new Date(a.periodStart).getTime())
  }, [targets])

  const selectedLead = useMemo(() => {
    return leads.find(lead => lead.id === selectedLeadId) || null
  }, [leads, selectedLeadId])

  const toastMessage = useCallback((message: string, tone: ToastTone) => {
    setToast({ message, tone })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const lastLeadsFetchRef = useRef(0)

  const fetchLeads = useCallback(async (options?: { force?: boolean }) => {
    const force = options?.force ?? false
    const now = Date.now()
    if (!force && now - lastLeadsFetchRef.current < 15000) {
      return
    }
    setIsLoading(true)
    setLoadError(null)
    try {
      const response = await fetch('/api/sales/leads')
      if (!response.ok) {
        throw new Error('Failed to fetch leads')
      }
      const data: SalesLeadApiRecord[] = await response.json()
      setLeads(data.map(deriveInitials))
      lastLeadsFetchRef.current = now
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Failed to load leads')
      lastLeadsFetchRef.current = 0
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchTargets = useCallback(async () => {
    setTargetsLoading(true)
    setTargetsError(null)
    try {
      const response = await fetch('/api/sales/targets')
      if (!response.ok) {
        throw new Error('Failed to fetch targets')
      }
      const data: SalesTargetRecord[] = await response.json()
      setTargets(data)
    } catch (error) {
      setTargetsError(error instanceof Error ? error.message : 'Failed to load targets')
    } finally {
      setTargetsLoading(false)
    }
  }, [])

  useEffect(() => {
  fetchLeads({ force: true })
    fetchTargets()
  }, [fetchLeads, fetchTargets])

  const handleTabChange = useCallback(
    (tab: TabKey) => {
      setActiveTab(tab)
      if (tab === 'leads' || tab === 'opportunities') {
        setFilters({ ...defaultFilters })
        setSelectedLeadId(null)
        fetchLeads()
      }
    },
    [fetchLeads],
  )

  const handleLeadRowClick = useCallback((leadId: string) => {
    setSelectedLeadId(leadId === selectedLeadId ? null : leadId)
  }, [selectedLeadId])

  const handleViewCustomer = useCallback((company: string, destinationTab?: 'opportunities') => {
    setFilters(prev => ({ ...prev, company }))
    setActiveTab(destinationTab === 'opportunities' ? 'opportunities' : 'leads')
    
    const match = leads.find((lead) => {
      if (destinationTab === 'opportunities') {
        return lead.company === company && opportunityStatuses.has(lead.status)
      }
      return lead.company === company && !opportunityStatuses.has(lead.status)
    }) ?? leads.find((lead) => lead.company === company)
    setSelectedLeadId(match ? match.id : null)
  }, [leads])

  const handleLeadFormSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (!leadForm.name.trim() || !leadForm.company.trim()) {
        toastMessage('Lead name and company are required', 'error')
        return
      }
      setIsMutating(true)
      try {
        const response = await fetch('/api/sales/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: leadForm.name.trim(),
            company: leadForm.company.trim(),
            email: leadForm.email.trim() || null,
            phone: leadForm.phone.trim() || null,
            manager: leadForm.manager.trim() || null,
            source: leadForm.source.trim() || null,
            estimatedValue: leadForm.value ? Number(leadForm.value) : null,
            probability: 20,
            sector: leadForm.sector.trim() || null,
            region: leadForm.region.trim() || null,
            notes: leadForm.notes.trim() || null,
          }),
        })
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}))
          throw new Error(payload.error || 'Failed to save lead')
        }
        const record: SalesLeadRecord = await response.json()
        setLeads((current) => [deriveInitials(record), ...current])
        setLeadForm(defaultLeadForm())
        setIsAddModalOpen(false)
        setSelectedLeadId(record.id)
        toastMessage('Lead saved', 'success')
      } catch (error) {
        toastMessage(error instanceof Error ? error.message : 'Failed to save lead', 'error')
      } finally {
        setIsMutating(false)
      }
    },
    [leadForm, toastMessage],
  )

  const closeConvertModal = useCallback(() => {
    setIsConvertModalOpen(false)
    setIsOpportunityEdit(false)
  }, [])

  const handleConvertSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (!convertLeadId) return
      if (!convertForm.name.trim() || !convertForm.stage) {
        toastMessage('Opportunity name and stage are required', 'error')
        return
      }
      const trimmedProbability = convertForm.probability.trim()
      const probabilityValue = trimmedProbability.length > 0 ? Number(trimmedProbability) : null
      if (trimmedProbability.length > 0 && Number.isNaN(probabilityValue)) {
        toastMessage('Probability must be a number', 'error')
        return
      }
      const trimmedValue = convertForm.value.trim()
      const estimatedValue = trimmedValue.length > 0 ? Number(trimmedValue) : null
      if (trimmedValue.length > 0 && Number.isNaN(estimatedValue)) {
        toastMessage('Estimated value must be a number', 'error')
        return
      }
      setIsMutating(true)
      try {
        const response = await fetch(`/api/sales/leads/${convertLeadId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: convertForm.name.trim(),
            status: convertForm.stage,
            probability: probabilityValue,
            estimatedValue,
          }),
        })
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}))
          throw new Error(payload.error || 'Failed to convert lead')
        }
        const updated: SalesLeadRecord = await response.json()
        setLeads((current) =>
          current.map((lead) => (lead.id === updated.id ? deriveInitials(updated) : lead)),
        )
        setSelectedLeadId(updated.id)
        closeConvertModal()
        toastMessage(isOpportunityEdit ? 'Opportunity updated' : 'Lead converted to opportunity', 'success')
      } catch (error) {
        toastMessage(error instanceof Error ? error.message : 'Failed to convert lead', 'error')
      } finally {
        setIsMutating(false)
      }
    },
    [closeConvertModal, convertForm, convertLeadId, isOpportunityEdit, toastMessage],
  )

  const openConvertModal = useCallback(
    (leadId: string) => {
      const match = leads.find((lead) => lead.id === leadId)
      if (!match) return
      setConvertLeadId(leadId)
      setConvertForm(defaultConvertForm(match))
      setIsOpportunityEdit(opportunityStatuses.has(match.status))
      setIsConvertModalOpen(true)
    },
    [leads],
  )

  const handleDeleteLead = useCallback(
    async (leadId: string) => {
      const match = leads.find((lead) => lead.id === leadId)
      if (!match) return
      if (!window.confirm(`Delete lead ${match.name}?`)) return
      setIsMutating(true)
      try {
        const response = await fetch(`/api/sales/leads/${leadId}`, {
          method: 'DELETE',
        })
        if (!response.ok && response.status !== 204) {
          const payload = await response.json().catch(() => ({}))
          throw new Error(payload.error || 'Failed to delete lead')
        }
        setLeads((current) => current.filter((lead) => lead.id !== leadId))
        if (selectedLeadId === leadId) {
          setSelectedLeadId(null)
        }
        toastMessage('Lead deleted', 'success')
      } catch (error) {
        toastMessage(error instanceof Error ? error.message : 'Failed to delete lead', 'error')
      } finally {
        setIsMutating(false)
      }
    },
    [leads, selectedLeadId, toastMessage],
  )

  const handleExportCsv = useCallback(() => {
    const dataset = activeTab === 'opportunities' ? filteredOpportunityLeads : filteredLeads
    if (!dataset.length) {
      toastMessage('No records to export', 'error')
      return
    }
    const headers = ['Lead Name', 'Email', 'Company', 'Sales Manager', 'Status', 'Value', 'Probability']
    const rows = dataset.map((lead) => [
      lead.name,
      lead.email ?? '',
      lead.company,
      lead.manager ?? '',
      lead.status,
      String(lead.estimatedValue ?? 0),
      `${lead.probability ?? 0}%`,
    ])
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'sales-leads.csv'
    anchor.click()
    URL.revokeObjectURL(url)
    toastMessage('Exported CSV', 'success')
  }, [activeTab, filteredLeads, filteredOpportunityLeads, toastMessage])

  const closeTargetModal = useCallback(() => {
    setIsTargetModalOpen(false)
    setEditingTargetId(null)
    setTargetForm(defaultTargetForm())
    setIsTargetMutating(false)
  }, [])

  const openCreateTargetModal = useCallback((period?: SalesTargetRecord['period']) => {
    setEditingTargetId(null)
    setTargetForm(defaultTargetForm(period))
    setIsTargetModalOpen(true)
  }, [])

  const openEditTargetModal = useCallback((target: SalesTargetRecord) => {
    setEditingTargetId(target.id)
    setTargetForm(targetFormFromRecord(target))
    setIsTargetModalOpen(true)
  }, [])

  const handleTargetFieldChange = useCallback((field: keyof TargetFormState, value: string) => {
    setTargetForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleTargetPeriodChange = useCallback(
    (period: TargetFormState['period']) => {
      setTargetForm((prev) => {
        if (editingTargetId) {
          return { ...prev, period }
        }
        const defaults = defaultTargetForm(period)
        return {
          ...prev,
          period,
          periodStart: defaults.periodStart,
          periodEnd: defaults.periodEnd,
        }
      })
    },
    [editingTargetId],
  )

  const handleTargetSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const amountValue = Number(targetForm.amount)
      if (!targetForm.amount.trim() || Number.isNaN(amountValue) || amountValue <= 0) {
        toastMessage('Enter a positive target amount', 'error')
        return
      }
      if (!targetForm.periodStart || !targetForm.periodEnd) {
        toastMessage('Select a start and end date', 'error')
        return
      }
      setIsTargetMutating(true)
      try {
        const payload = {
          period: targetForm.period,
          amount: Math.round(amountValue),
          periodStart: targetForm.periodStart,
          periodEnd: targetForm.periodEnd,
        }
        const endpoint = editingTargetId
          ? `/api/sales/targets/${editingTargetId}`
          : '/api/sales/targets'
        const method = editingTargetId ? 'PATCH' : 'POST'
        const response = await fetch(endpoint, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!response.ok) {
          const result = await response.json().catch(() => ({}))
          throw new Error(result.error || 'Failed to save target')
        }
        await fetchTargets()
        toastMessage(editingTargetId ? 'Target updated' : 'Target created', 'success')
        closeTargetModal()
      } catch (error) {
        toastMessage(error instanceof Error ? error.message : 'Failed to save target', 'error')
      } finally {
        setIsTargetMutating(false)
      }
    },
    [closeTargetModal, editingTargetId, fetchTargets, targetForm, toastMessage],
  )

  const handleTargetDelete = useCallback(
    async (targetId: string) => {
      if (!window.confirm('Delete this sales target?')) return
      setIsTargetMutating(true)
      try {
        const response = await fetch(`/api/sales/targets/${targetId}`, { method: 'DELETE' })
        if (!response.ok && response.status !== 204) {
          const result = await response.json().catch(() => ({}))
          throw new Error(result.error || 'Failed to delete target')
        }
        await fetchTargets()
        if (editingTargetId === targetId) {
          closeTargetModal()
        }
        toastMessage('Target deleted', 'success')
      } catch (error) {
        toastMessage(error instanceof Error ? error.message : 'Failed to delete target', 'error')
      } finally {
        setIsTargetMutating(false)
      }
    },
    [closeTargetModal, editingTargetId, fetchTargets, toastMessage],
  )

  const handleEmailSelected = useCallback(() => {
    if (!selectedLeadId) {
      toastMessage('Select a lead first', 'error')
      return
    }
    const lead = leads.find((item) => item.id === selectedLeadId)
    if (!lead) return
    const subject = encodeURIComponent(`Regarding ${lead.company}`)
    const body = encodeURIComponent(
      `Hi ${lead.name.split(' ')[0]},\n\nThanks for your interest. Let's schedule a quick call this week.\n\nRegards,\nSales Team`,
    )
    const to = lead.email ?? ''
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`
  }, [leads, selectedLeadId, toastMessage])

  const isOpportunityView = activeTab === 'opportunities'
  const tableTitle = isOpportunityView ? 'Active Opportunities' : 'Active Leads'
  const showOpportunityTable = activeTab === 'home' || activeTab === 'leads' || activeTab === 'analytics'
  const tableDescription = isOpportunityView
    ? 'Tap on any opportunity to preview, adjust value, or update stage.'
    : showOpportunityTable
        ? 'Tap on any active lead to preview, convert, or delete. Converted opportunities are listed below.'
        : 'Tap on any record to preview, convert, or delete.'
  const primaryRows = isOpportunityView ? filteredOpportunityLeads : filteredLeads
  const primaryName = isOpportunityView ? 'Opportunity' : 'Lead'
  const primaryEmptyCopy = isOpportunityView
    ? 'No opportunities match the current filters.'
    : 'No records match the current filters.'
  const showStats = activeTab === 'home'
  const showAnalyticsPanel = activeTab === 'analytics'
  const showCustomers = activeTab === 'customers'
  const targetModalTitle = editingTargetId ? 'Edit sales target' : 'Set sales target'
  const targetModalSubmitLabel = editingTargetId ? 'Update target' : 'Save target'
  const convertModalTitle = isOpportunityEdit ? 'Update opportunity' : 'Convert lead to opportunity'

  return (
    <main className="rounded-[36px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 pb-20 pt-12 text-slate-100 shadow-[0_30px_120px_-60px_rgba(6,16,38,0.85)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-slate-950/40 backdrop-blur">
          <div>
            <h1 className="text-3xl font-semibold text-white">Sales Pipeline</h1>
            <p className="mt-1 text-sm text-slate-200">
              Track pipeline velocity, surface conversions, and stay ahead of tenders in flight.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-white/40 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
              onClick={() => window.print()}
            >
              <span aria-hidden>🖨️</span>
              Export
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-sky-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-900/40 transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-200/80"
              onClick={() => {
                setLeadForm(defaultLeadForm())
                setIsAddModalOpen(true)
              }}
            >
              <span aria-hidden>＋</span>
              Add Lead
            </button>
          </div>
        </header>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl shadow-slate-950/30 backdrop-blur">
          <h2 className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-200">Sales pipeline stages</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {pipelineStages.map((stage) => {
              const isCompleted = stage.state === 'completed'
              const isActive = stage.state === 'active'
              return (
                <div key={stage.id} className="flex flex-col items-center gap-4 text-center">
                  <div
                    className={cn(
                      'flex h-16 w-16 items-center justify-center rounded-full text-lg font-semibold ring-1 ring-white/20 transition',
                      'bg-white/10 text-slate-200 shadow-lg shadow-slate-950/20 backdrop-blur',
                      isCompleted &&
                        'bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 text-white ring-emerald-300/40 shadow-emerald-900/30',
                      isActive &&
                        'bg-gradient-to-br from-sky-400 via-sky-500 to-cyan-500 text-white ring-sky-300/40 shadow-sky-900/30',
                      !isCompleted && !isActive && 'ring-white/10'
                    )}
                  >
                    {stage.id}
                  </div>
                  <span
                    className={cn(
                      'text-xs font-semibold uppercase tracking-wide text-slate-300',
                      isCompleted && 'text-emerald-200',
                      isActive && 'text-sky-200',
                      !isCompleted && !isActive && 'text-slate-400',
                    )}
                  >
                    {stage.label}
                  </span>
                </div>
              )
            })}
          </div>
        </section>

        <nav className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 shadow-lg shadow-slate-950/30 backdrop-blur">
          {(
            [
              { key: 'home', label: 'Home' },
              { key: 'leads', label: 'Leads' },
              { key: 'opportunities', label: 'Opportunities' },
              { key: 'customers', label: 'Customers' },
              { key: 'analytics', label: 'Analytics' },
            ] satisfies Array<{ key: TabKey; label: string }>
          ).map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                className={cn(
                  'rounded-xl px-4 py-2 text-sm font-semibold transition',
                  isActive
                    ? 'bg-gradient-to-r from-sky-500 via-sky-600 to-cyan-500 text-white shadow-lg shadow-sky-900/40 ring-1 ring-white/20'
                    : 'text-slate-200 hover:bg-white/10 hover:text-white',
                )}
                onClick={() => handleTabChange(tab.key)}
              >
                {tab.label}
              </button>
            )
          })}
        </nav>

        {showStats && (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[{
              label: 'Total Leads',
              value: stats.totalLeads,
              icon: '👥',
              accent: 'from-sky-500/40 via-sky-400/10 to-transparent',
            },
            {
              label: 'Active Opportunities',
              value: stats.activeOpps,
              icon: '✅',
              accent: 'from-emerald-500/40 via-emerald-400/10 to-transparent',
            },
            {
              label: 'Win Rate',
              value: `${stats.winRate}%`,
              icon: '📊',
              accent: 'from-violet-500/40 via-violet-400/10 to-transparent',
            },
            {
              label: 'Pipeline Value',
              value: formatCurrency(stats.pipelineValue),
              icon: '💰',
              accent: 'from-amber-500/40 via-amber-400/10 to-transparent',
            }].map((chip) => (
              <article
                key={chip.label}
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/90 p-6 text-slate-50 shadow-lg shadow-sky-900/20 backdrop-blur"
              >
                <div className="flex items-start justify-between">
                  <span className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-slate-300">
                    {chip.label}
                  </span>
                  <span
                    aria-hidden
                    className="rounded-full bg-white/10 p-2 text-lg"
                  >
                    {chip.icon}
                  </span>
                </div>
                <p className="mt-6 text-4xl font-semibold leading-none text-white">{chip.value}</p>
                <div
                  aria-hidden
                  className={`pointer-events-none absolute inset-x-6 bottom-3 h-px bg-gradient-to-r ${chip.accent}`}
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-sky-500/10 blur-2xl"
                />
              </article>
            ))}
          </section>
        )}

        {showAnalyticsPanel && (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl shadow-slate-950/30 backdrop-blur">
            <h2 className="text-lg font-semibold text-white">Analytics overview</h2>
            <div className="mt-8 grid gap-4 xl:grid-cols-3">
              <article className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 shadow-lg shadow-slate-950/30 backdrop-blur">
                <div className="flex items-start justify-between">
                  <h3 className="text-base font-semibold text-white">Win / loss mix</h3>
                  <span className="text-xs text-slate-400">{pieTotal} deals tracked</span>
                </div>
                {pieTotal === 0 ? (
                  <div className="mt-10 flex flex-col items-center justify-center gap-3 text-center text-sm text-slate-400">
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-slate-500">
                      No closed opportunities yet
                    </span>
                    <p>As deals close, we’ll chart the win / loss mix automatically.</p>
                  </div>
                ) : (
                  <>
                    <div className="relative mx-auto mt-6 h-48 w-48">
                      <svg viewBox="0 0 120 120" className="h-full w-full" role="img" aria-label="Win loss pie chart">
                        <circle
                          cx="60"
                          cy="60"
                          r="48"
                          fill="transparent"
                          stroke="#0f172a"
                          strokeOpacity="0.35"
                          strokeWidth="16"
                        />
                        {(() => {
                          const circumference = 2 * Math.PI * 48
                          let accumulated = 0
                          return pieSegments
                            .filter((segment) => segment.value > 0)
                            .map((segment) => {
                              const fraction = segment.value / pieTotal
                              const dashArray = `${fraction * circumference} ${circumference}`
                              const dashOffset = circumference * (1 - accumulated)
                              accumulated += fraction
                              return (
                                <circle
                                  key={segment.key}
                                  cx="60"
                                  cy="60"
                                  r="48"
                                  fill="transparent"
                                  stroke={segment.stroke}
                                  strokeWidth="16"
                                  strokeDasharray={dashArray}
                                  strokeDashoffset={dashOffset}
                                  strokeLinecap="round"
                                  transform="rotate(-90 60 60)"
                                />
                              )
                            })
                        })()}
                      </svg>
                      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                        <p className="text-3xl font-semibold text-white">{pieWonPercent}%</p>
                        <p className="text-xs uppercase tracking-wide text-slate-300">Won share</p>
                      </div>
                    </div>
                    <dl className="mt-6 space-y-3 text-sm">
                      {pieSegments.map((segment) => {
                        const percentage = pieTotal > 0 ? Math.round((segment.value / pieTotal) * 100) : 0
                        return (
                          <div key={segment.key} className="flex items-center gap-3 text-slate-300">
                            <span className={`h-2.5 w-2.5 rounded-full ${segment.dotClass}`} />
                            <span className="text-slate-200">{segment.label}</span>
                            <span className="ml-auto font-semibold text-white">{segment.value}</span>
                            <span className="text-xs text-slate-400">{percentage}%</span>
                          </div>
                        )
                      })}
                    </dl>
                  </>
                )}
              </article>

              <article className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 shadow-lg shadow-slate-950/30 backdrop-blur">
                <h3 className="text-base font-semibold text-white">Manager win / loss breakdown</h3>
                {analytics.perManager.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-400">No manager assignments recorded yet.</p>
                ) : (
                  <div className="mt-4 space-y-5">
                    {analytics.perManager.map((item) => {
                      const totalOpps = item.won + item.lost + item.activeOpps
                      const totalLeads = item.leads + item.lostLeads
                      const oppWonFraction = totalOpps > 0 ? item.won / totalOpps : 0
                      const oppLostFraction = totalOpps > 0 ? item.lost / totalOpps : 0
                      const oppActiveFraction = totalOpps > 0 ? item.activeOpps / totalOpps : 0
                      const leadActiveFraction = totalLeads > 0 ? item.leads / totalLeads : 0
                      const leadLostFraction = totalLeads > 0 ? item.lostLeads / totalLeads : 0
                      const wonPercent = Math.round(oppWonFraction * 100)

                      return (
                        <div key={item.manager} className="rounded-xl border border-white/5 bg-white/5 p-4">
                          <div className="flex items-center justify-between text-sm font-medium">
                            <span className="text-slate-100">{item.manager}</span>
                            <span className="text-slate-300">{totalOpps > 0 ? `${wonPercent}% won` : 'No deals yet'}</span>
                          </div>
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-[0.75rem] text-slate-400">
                              <span>Opportunities</span>
                              <span className="text-slate-200">{totalOpps}</span>
                            </div>
                            <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-white/10">
                              <span
                                className="block h-full bg-emerald-400"
                                style={{ width: `${oppWonFraction * 100}%` }}
                              />
                              <span
                                className="block h-full bg-rose-400"
                                style={{ width: `${oppLostFraction * 100}%` }}
                              />
                              <span
                                className="block h-full bg-slate-500/60"
                                style={{ width: `${oppActiveFraction * 100}%` }}
                              />
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2 text-[0.7rem] font-medium">
                              <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-emerald-200">
                                Won {item.won}
                              </span>
                              <span className="rounded-full bg-rose-400/15 px-3 py-1 text-rose-200">
                                Lost {item.lost}
                              </span>
                              <span className="rounded-full bg-slate-400/15 px-3 py-1 text-slate-200">
                                Active {item.activeOpps}
                              </span>
                            </div>
                          </div>
                          <div className="mt-4">
                            <div className="flex items-center justify-between text-[0.75rem] text-slate-400">
                              <span>Leads</span>
                              <span className="text-slate-200">{totalLeads}</span>
                            </div>
                            <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-white/10">
                              <span
                                className="block h-full bg-sky-400"
                                style={{ width: `${leadActiveFraction * 100}%` }}
                              />
                              <span
                                className="block h-full bg-rose-500/70"
                                style={{ width: `${leadLostFraction * 100}%` }}
                              />
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2 text-[0.7rem] font-medium">
                              <span className="rounded-full bg-sky-400/15 px-3 py-1 text-sky-200">
                                Active {item.leads}
                              </span>
                              <span className="rounded-full bg-rose-500/15 px-3 py-1 text-rose-200">
                                Lost {item.lostLeads}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </article>

              <article className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 shadow-lg shadow-slate-950/30 backdrop-blur">
                <h3 className="text-base font-semibold text-white">Top customers</h3>
                <div className="mt-4 space-y-4">
                  {analytics.topCustomers.map((customer, index) => (
                    <div key={customer.company}>
                      <div className="flex items-center justify-between text-sm font-medium text-slate-300">
                        <span className="text-slate-100">{customer.company}</span>
                        <span>{customer.total} total</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-white/10">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400"
                          style={{
                            width: `${Math.min(
                              100,
                              analytics.topCustomers[0]?.total
                                ? Math.round((customer.total / analytics.topCustomers[0].total) * 100)
                                : 0,
                            )}%`,
                          }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-slate-400">
                        Leads: {customer.leads} · Opps: {customer.opportunities} · {customer.dominantRegion}
                      </p>
                      {index === 0 && (
                        <p className="text-xs text-slate-400">Momentum leader across the pipeline.</p>
                      )}
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </section>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          {showCustomers ? (
            <section className="space-y-8 rounded-3xl border border-white/10 bg-gradient-to-br from-white/95 via-white/90 to-slate-100/70 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Customers</h2>
                <p className="mt-1 text-sm text-slate-600">Rollup of lead and opportunity engagement by account.</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-900">Customer Leads</h3>
                  <span className="text-xs uppercase tracking-wide text-slate-500">
                    {customerTables.leadRows.length} organisations
                  </span>
                </div>
                <div className="overflow-hidden rounded-2xl border border-slate-200/70 shadow-lg shadow-slate-950/10">
                  {customerTables.leadRows.length === 0 ? (
                    <div className="bg-white/90 p-6 text-sm text-slate-500">No lead activity captured for customers yet.</div>
                  ) : (
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                      <thead className="bg-slate-900/90 text-left text-xs font-semibold uppercase tracking-wide text-slate-100">
                        <tr>
                          <th className="px-4 py-3">Customer</th>
                          <th className="px-4 py-3">Location</th>
                          <th className="px-4 py-3 text-right">Leads count</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white text-slate-700">
                        {customerTables.leadRows.map((row) => (
                          <tr key={`customer-lead-${row.company}`} className="transition hover:bg-slate-50/80">
                            <td className="px-4 py-3 font-semibold text-slate-900">{row.company}</td>
                            <td className="px-4 py-3 text-slate-600">{formatText(row.location)}</td>
                            <td className="px-4 py-3 text-right font-semibold text-slate-900">{row.count}</td>
                            <td className="px-4 py-3 text-right">
                              <button
                                type="button"
                                className="inline-flex items-center rounded-full bg-gradient-to-r from-sky-500 via-sky-600 to-cyan-500 px-3 py-1 text-xs font-semibold text-white shadow-sm shadow-sky-500/40 transition hover:brightness-110"
                                onClick={() => handleViewCustomer(row.company)}
                              >
                                View details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-900">Customer Opportunities</h3>
                  <span className="text-xs uppercase tracking-wide text-slate-400">
                    {customerTables.opportunityRows.length} organisations
                  </span>
                </div>
                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  {customerTables.opportunityRows.length === 0 ? (
                    <div className="p-6 text-sm text-slate-500">Opportunities will appear here once leads convert.</div>
                  ) : (
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                      <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="px-4 py-3">Customer</th>
                          <th className="px-4 py-3">Location</th>
                          <th className="px-4 py-3 text-right">Opportunities count</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {customerTables.opportunityRows.map((row) => (
                          <tr key={`customer-opportunity-${row.company}`} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-semibold text-slate-900">{row.company}</td>
                            <td className="px-4 py-3 text-slate-600">{formatText(row.location)}</td>
                            <td className="px-4 py-3 text-right font-semibold text-slate-900">{row.count}</td>
                            <td className="px-4 py-3 text-right">
                              <button
                                type="button"
                                className="inline-flex items-center rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-emerald-600"
                                onClick={() => handleViewCustomer(row.company, 'opportunities')}
                              >
                                View details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </section>
          ) : (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{tableTitle}</h2>
                  <p className="text-sm text-slate-500">{tableDescription}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:border-slate-300 hover:text-slate-900"
                    onClick={handleExportCsv}
                    disabled={!primaryRows.length}
                  >
                    Export CSV
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:border-slate-300 hover:text-slate-900"
                    onClick={handleEmailSelected}
                    disabled={!selectedLeadId}
                  >
                    Email selected
                  </button>
                  <div className="relative">
                    <button
                      type="button"
                      className={cn(
                        'rounded-lg px-3 py-2 text-sm font-medium transition',
                        isFilterOpen
                          ? 'bg-slate-900 text-white shadow-sm shadow-slate-400/40'
                          : 'border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900',
                      )}
                      onClick={() => setIsFilterOpen((state) => !state)}
                    >
                      Filters
                    </button>
                    {isFilterOpen && (
                      <div className="absolute right-0 z-20 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-xl">
                        <h3 className="text-sm font-semibold text-slate-900">Refine view</h3>
                        <div className="mt-3 space-y-3 text-sm text-slate-600">
                          <label className="flex flex-col gap-1">
                            Status
                            <select
                              value={filters.status}
                              onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
                              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                            >
                              <option value="">All</option>
                              <option value="New Lead">New Lead</option>
                              <option value="Lead">Lead</option>
                              <option value="Qualified">Qualified</option>
                              <option value="Proposal">Proposal</option>
                              <option value="Quotation">Quotation</option>
                              <option value="Evaluation">Evaluation</option>
                              <option value="Closed Won">Closed Won</option>
                              <option value="Closed Lost">Closed Lost</option>
                            </select>
                          </label>
                          <label className="flex flex-col gap-1">
                            Manager
                            <select
                              value={filters.manager}
                              onChange={(event) => setFilters((prev) => ({ ...prev, manager: event.target.value }))}
                              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                            >
                              <option value="">All</option>
                              {managerOptions.map((manager) => (
                                <option key={manager} value={manager}>
                                  {manager}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="flex flex-col gap-1">
                            Customer
                            <input
                              value={filters.company}
                              onChange={(event) => setFilters((prev) => ({ ...prev, company: event.target.value }))}
                              placeholder="All"
                              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                            />
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <label className="flex flex-col gap-1">
                              Min value
                              <input
                                value={filters.minValue}
                                onChange={(event) =>
                                  setFilters((prev) => ({ ...prev, minValue: event.target.value }))
                                }
                                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                              />
                            </label>
                            <label className="flex flex-col gap-1">
                              Max value
                              <input
                                value={filters.maxValue}
                                onChange={(event) =>
                                  setFilters((prev) => ({ ...prev, maxValue: event.target.value }))
                                }
                                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                              />
                            </label>
                          </div>
                          <label className="flex flex-col gap-1">
                            Sector
                            <select
                              value={filters.sector}
                              onChange={(event) => setFilters((prev) => ({ ...prev, sector: event.target.value }))}
                              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                            >
                              <option value="">Any</option>
                              <option value="Private">Private</option>
                              <option value="Public">Public</option>
                            </select>
                          </label>
                          <label className="flex flex-col gap-1">
                            Region
                            <input
                              value={filters.region}
                              onChange={(event) => setFilters((prev) => ({ ...prev, region: event.target.value }))}
                              placeholder="Any"
                              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                            />
                          </label>
                        </div>
                        <div className="mt-4 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:border-slate-300 hover:text-slate-900"
                            onClick={() => {
                              setFilters({
                                status: '',
                                manager: '',
                                minValue: '',
                                maxValue: '',
                                sector: '',
                                region: '',
                                company: '',
                              })
                              toastMessage('Filters cleared', 'info')
                            }}
                          >
                            Clear
                          </button>
                          <button
                            type="button"
                            className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-700"
                            onClick={() => setIsFilterOpen(false)}
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white">
                {isLoading ? (
                  <div className="flex h-60 items-center justify-center text-sm font-medium text-slate-500">
                    Loading leads...
                  </div>
                ) : loadError ? (
                  <div className="space-y-3 p-6 text-sm text-rose-600">
                    <p className="font-semibold">{loadError}</p>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 hover:border-rose-300 hover:text-rose-700"
                      onClick={() => fetchLeads({ force: true })}
                    >
                      Retry
                    </button>
                  </div>
                ) : !primaryRows.length ? (
                  <div className="flex h-60 flex-col items-center justify-center gap-2 p-6 text-sm text-slate-500">
                    <span>{primaryEmptyCopy}</span>
                    <button
                      type="button"
                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:border-slate-300 hover:text-slate-900"
                      onClick={() =>
                        setFilters({
                          status: '',
                          manager: '',
                          minValue: '',
                          maxValue: '',
                          sector: '',
                          region: '',
                          company: '',
                        })
                      }
                    >
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <div className="max-h-[480px] overflow-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                      <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="px-4 py-3">{primaryName}</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Value</th>
                          <th className="px-4 py-3">Probability</th>
                          <th className="px-4 py-3">Manager</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {primaryRows.map((lead) => {
                          const isSelected = selectedLeadId === lead.id
                          const isOpportunityRow = opportunityStatuses.has(lead.status)
                          const convertLabel = isOpportunityRow ? 'Update' : 'Convert'
                          return (
                            <tr
                              key={lead.id}
                              className={cn(
                                'cursor-pointer transition hover:bg-slate-50',
                                isSelected && 'bg-sky-50/70',
                              )}
                              onClick={() => handleLeadRowClick(lead.id)}
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700">
                                    {lead.initials}
                                  </span>
                                  <div>
                                    <p className="font-semibold text-slate-900">{lead.name}</p>
                                    <p className="text-xs text-slate-500">{lead.company}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={cn(
                                    'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
                                    statusBadgeClass(lead.status),
                                  )}
                                >
                                  {lead.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-semibold text-slate-900">
                                {formatCurrency(lead.estimatedValue)}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={cn(
                                    'inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold',
                                    probabilityBadgeClass(lead.probability),
                                  )}
                                >
                                  {lead.probability ? `${lead.probability}%` : '—'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-600">{lead.manager ?? 'Unassigned'}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:border-slate-300 hover:text-slate-900"
                                    onClick={(event) => {
                                      event.stopPropagation()
                                      openConvertModal(lead.id)
                                    }}
                                  >
                                    {convertLabel}
                                  </button>
                                  <button
                                    type="button"
                                    className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:border-slate-300 hover:text-slate-900"
                                    onClick={(event) => {
                                      event.stopPropagation()
                                      handleLeadRowClick(lead.id)
                                    }}
                                  >
                                    View
                                  </button>
                                  <button
                                    type="button"
                                    className="rounded-lg border border-rose-200 px-2 py-1 text-xs font-medium text-rose-600 hover:border-rose-300 hover:text-rose-700"
                                    onClick={(event) => {
                                      event.stopPropagation()
                                      handleDeleteLead(lead.id)
                                    }}
                                    disabled={isMutating}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              {showOpportunityTable && !isLoading && !loadError && (
                <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-white">
                  <div className="flex items-center justify-between gap-4 px-6 py-4">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">Active Opportunities</h3>
                      <p className="text-sm text-slate-500">
                        Converted leads stay visible here while they continue through the pipeline.
                      </p>
                    </div>
                    <span className="text-xs uppercase tracking-wide text-slate-400">
                      {filteredOpportunityLeads.length} records
                    </span>
                  </div>
                  <div className="border-t border-slate-200">
                    {filteredOpportunityLeads.length === 0 ? (
                      <div className="p-6 text-sm text-slate-500">
                        No active opportunities match the current filters.
                      </div>
                    ) : (
                      <div className="max-h-[360px] overflow-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            <tr>
                              <th className="px-4 py-3">Opportunity</th>
                              <th className="px-4 py-3">Status</th>
                              <th className="px-4 py-3">Value</th>
                              <th className="px-4 py-3">Probability</th>
                              <th className="px-4 py-3">Manager</th>
                              <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filteredOpportunityLeads.map((lead) => {
                              const isSelected = selectedLeadId === lead.id
                              return (
                                <tr
                                  key={lead.id}
                                  className={cn(
                                    'cursor-pointer transition hover:bg-slate-50',
                                    isSelected && 'bg-sky-50/70',
                                  )}
                                  onClick={() => handleLeadRowClick(lead.id)}
                                >
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
                                        {lead.initials}
                                      </span>
                                      <div>
                                        <p className="font-semibold text-slate-900">{lead.name}</p>
                                        <p className="text-xs text-slate-500">{lead.company}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span
                                      className={cn(
                                        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
                                        statusBadgeClass(lead.status),
                                      )}
                                    >
                                      {lead.status}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 font-semibold text-slate-900">
                                    {formatCurrency(lead.estimatedValue)}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span
                                      className={cn(
                                        'inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold',
                                        probabilityBadgeClass(lead.probability),
                                      )}
                                    >
                                      {lead.probability ? `${lead.probability}%` : '—'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-slate-600">{lead.manager ?? 'Unassigned'}</td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        type="button"
                                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:border-slate-300 hover:text-slate-900"
                                        onClick={(event) => {
                                          event.stopPropagation()
                                          openConvertModal(lead.id)
                                        }}
                                      >
                                        Update
                                      </button>
                                      <button
                                        type="button"
                                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:border-slate-300 hover:text-slate-900"
                                        onClick={(event) => {
                                          event.stopPropagation()
                                          handleLeadRowClick(lead.id)
                                        }}
                                      >
                                        View
                                      </button>
                                      <button
                                        type="button"
                                        className="rounded-lg border border-rose-200 px-2 py-1 text-xs font-medium text-rose-600 hover:border-rose-300 hover:text-rose-700"
                                        onClick={(event) => {
                                          event.stopPropagation()
                                          handleDeleteLead(lead.id)
                                        }}
                                        disabled={isMutating}
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="mt-6 rounded-3xl border border-slate-200 bg-white">
                {selectedLead ? (
                  <div className="flex flex-col gap-6 p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-slate-900">{selectedLead.name}</h3>
                        <p className="text-sm text-slate-500">{selectedLead.company}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="rounded-full border border-slate-200 px-3 py-1 font-semibold uppercase tracking-wide">
                          Created {formatDateTime(selectedLead.createdAt)}
                        </span>
                        <span className="rounded-full border border-slate-200 px-3 py-1 font-semibold uppercase tracking-wide">
                          Updated {formatDateTime(selectedLead.updatedAt)}
                        </span>
                      </div>
                    </div>
                    <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</dt>
                        <dd className="mt-1 text-sm text-slate-900">{formatText(selectedLead.email)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</dt>
                        <dd className="mt-1 text-sm text-slate-900">{formatText(selectedLead.phone)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sales manager</dt>
                        <dd className="mt-1 text-sm text-slate-900">{formatText(selectedLead.manager)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Lead source</dt>
                        <dd className="mt-1 text-sm text-slate-900">{formatText(selectedLead.source)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Estimated value</dt>
                        <dd className="mt-1 text-sm font-semibold text-slate-900">{formatCurrency(selectedLead.estimatedValue)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Probability</dt>
                        <dd className="mt-1 text-sm text-slate-900">
                          {selectedLead.probability !== null && selectedLead.probability !== undefined
                            ? `${selectedLead.probability}%`
                            : '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</dt>
                        <dd className="mt-1 text-sm text-slate-900">{formatText(selectedLead.status)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sector</dt>
                        <dd className="mt-1 text-sm text-slate-900">{formatText(selectedLead.sector)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Region</dt>
                        <dd className="mt-1 text-sm text-slate-900">{formatText(selectedLead.region)}</dd>
                      </div>
                    </dl>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">Notes</h4>
                      <p className="mt-2 whitespace-pre-wrap rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        {formatText(selectedLead.notes, 'No notes captured yet.')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-sm text-slate-500">
                    Select a {primaryName.toLowerCase()} to review every field captured in the intake form.
                  </div>
                )}
              </div>
            </section>
          )}

          <aside className="flex min-w-0 flex-col gap-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">Quick actions</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <button
                  type="button"
                  className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-5 text-center font-medium text-slate-600 transition hover:border-sky-200 hover:text-sky-700"
                  onClick={() => {
                    setLeadForm(defaultLeadForm())
                    setIsAddModalOpen(true)
                  }}
                >
                  <span aria-hidden className="text-xl text-slate-500">➕</span>
                  New lead
                </button>
                <button
                  type="button"
                  className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-5 text-center font-medium text-slate-600 transition hover:border-emerald-200 hover:text-emerald-700"
                  onClick={() => {
                    if (!selectedLeadId) {
                      toastMessage('Select a lead to convert', 'error')
                      return
                    }
                    openConvertModal(selectedLeadId)
                  }}
                  disabled={isMutating}
                >
                  <span aria-hidden className="text-xl text-slate-500">🔁</span>
                  Convert lead
                </button>
                <button
                  type="button"
                  className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-5 text-center font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
                  onClick={() => window.print()}
                >
                  <span aria-hidden className="text-xl text-slate-500">📄</span>
                  Generate report
                </button>
                <button
                  type="button"
                  className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-5 text-center font-medium text-slate-600 transition hover:border-sky-200 hover:text-sky-700"
                  onClick={handleEmailSelected}
                >
                  <span aria-hidden className="text-xl text-slate-500">✉️</span>
                  Send email
                </button>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">Recent activity</h2>
              <ul className="mt-4 space-y-4 text-sm text-slate-600">
                {activityFeed.length === 0 ? (
                  <li className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-xs text-slate-500">
                    Recent interactions will appear here once your team starts logging activity.
                  </li>
                ) : (
                  activityFeed.map((item) => (
                    <li key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <p className="font-semibold text-slate-800">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{item.time}</p>
                    </li>
                  ))
                )}
              </ul>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Team performance</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {targetsLoading ? 'Loading targets...' : performance.targetContext}
                    {performance.targetRange ? ` · ${performance.targetRange}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-sky-200 hover:text-sky-700"
                  onClick={() => openCreateTargetModal()}
                  disabled={isTargetMutating}
                >
                  <span aria-hidden>＋</span>
                  Set target
                </button>
              </div>
              <div className="mt-5 space-y-5 text-sm">
                <div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Target progress</span>
                    <span className="font-semibold text-slate-800">{performance.targetSummary}</span>
                  </div>
                  {performance.targetRange ? (
                    <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">{performance.targetRange}</p>
                  ) : null}
                  <div className="mt-2 h-2 rounded-full bg-slate-200">
                    <div className="h-2 rounded-full bg-sky-500" style={{ width: `${performance.targetPercent}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Lead conversion</span>
                    <span className="font-semibold text-slate-800">{performance.conversionRate}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-200">
                    <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${performance.conversionRate}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Sales cycle</span>
                    <span className="font-semibold text-slate-800">{performance.salesCycleLabel}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-200">
                    <div className="h-2 rounded-full bg-amber-500" style={{ width: `${performance.salesCyclePercent}%` }} />
                  </div>
                </div>
              </div>
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="font-semibold uppercase tracking-wide text-slate-500">Targets</span>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-sky-200 hover:text-sky-700"
                    onClick={() => openCreateTargetModal()}
                    disabled={isTargetMutating}
                  >
                    <span aria-hidden>＋</span>
                    New
                  </button>
                </div>
                {targetsLoading ? (
                  <p className="mt-3 text-slate-500">Loading targets...</p>
                ) : targetsError ? (
                  <p className="mt-3 text-rose-500">{targetsError}</p>
                ) : sortedTargets.length === 0 ? (
                  <p className="mt-3 text-slate-500">No targets configured yet. Capture a monthly, quarterly, or yearly goal to anchor the dashboard.</p>
                ) : (
                  <ul className="mt-3 space-y-3">
                    {sortedTargets.slice(0, 4).map((target) => (
                      <li key={target.id} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 shadow-sm">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{periodLabels[target.period]}</p>
                          <p className="text-[11px] uppercase tracking-wide text-slate-500">
                            {formatDateRange(target.periodStart, target.periodEnd)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-semibold text-slate-900">{formatCurrency(target.amount)}</span>
                          <button
                            type="button"
                            className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                            onClick={() => openEditTargetModal(target)}
                            disabled={isTargetMutating}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="rounded-md border border-rose-200 px-2 py-1 text-[11px] font-semibold text-rose-600 transition hover:border-rose-300 hover:text-rose-700"
                            onClick={() => handleTargetDelete(target.id)}
                            disabled={isTargetMutating}
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                    {sortedTargets.length > 4 ? (
                      <li className="text-[11px] uppercase tracking-wide text-slate-400">
                        Showing {Math.min(sortedTargets.length, 4)} of {sortedTargets.length} targets
                      </li>
                    ) : null}
                  </ul>
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/40 px-4 py-8">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <header className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Add new lead</h2>
              <button
                type="button"
                className="text-xl text-slate-400 transition hover:text-slate-600"
                aria-label="Close"
                onClick={() => setIsAddModalOpen(false)}
                disabled={isMutating}
              >
                ×
              </button>
            </header>
            <form className="mt-5 space-y-4" onSubmit={handleLeadFormSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
                  Lead name *
                  <input
                    required
                    value={leadForm.name}
                    onChange={(event) => setLeadForm((prev) => ({ ...prev, name: event.target.value }))}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                    disabled={isMutating}
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
                  Company *
                  <input
                    required
                    value={leadForm.company}
                    onChange={(event) => setLeadForm((prev) => ({ ...prev, company: event.target.value }))}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                    disabled={isMutating}
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
                  Email
                  <input
                    type="email"
                    value={leadForm.email}
                    onChange={(event) => setLeadForm((prev) => ({ ...prev, email: event.target.value }))}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                    disabled={isMutating}
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
                  Phone
                  <input
                    value={leadForm.phone}
                    onChange={(event) => setLeadForm((prev) => ({ ...prev, phone: event.target.value }))}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                    disabled={isMutating}
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
                  Sales manager
                  <select
                    value={leadForm.manager}
                    onChange={(event) => setLeadForm((prev) => ({ ...prev, manager: event.target.value }))}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                    disabled={isMutating}
                  >
                    <option value="">Select manager</option>
                    {managerOptions.map((manager) => (
                      <option key={manager} value={manager}>
                        {manager}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
                  Lead source
                  <select
                    value={leadForm.source}
                    onChange={(event) => setLeadForm((prev) => ({ ...prev, source: event.target.value }))}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                    disabled={isMutating}
                  >
                    <option value="">Select source</option>
                    <option value="Referral">Referral</option>
                    <option value="LinkedIn / Social">LinkedIn / Social</option>
                    <option value="Website / Contact Form">Website / Contact Form</option>
                    <option value="Events: TZ ICT, e-Gov Expo, TCRA">Events: TZ ICT, e-Gov Expo, TCRA</option>
                    <option value="OEM Partner Lead (Microsoft/Cisco/Huawei/Fortinet)">
                      OEM Partner Lead (Microsoft/Cisco/Huawei/Fortinet)
                    </option>
                    <option value="TANePS / PPRA Tender">TANePS / PPRA Tender</option>
                    <option value="Reseller/Distributor">Reseller/Distributor</option>
                    <option value="Cold Outreach (Phone/Email)">Cold Outreach (Phone/Email)</option>
                    <option value="Site Visit (Dodoma/Dar/Regions)">Site Visit (Dodoma/Dar/Regions)</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
                  Estimated value
                  <input
                    value={leadForm.value}
                    onChange={(event) => setLeadForm((prev) => ({ ...prev, value: event.target.value }))}
                    type="number"
                    min={0}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                    disabled={isMutating}
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
                  Sector
                  <select
                    value={leadForm.sector}
                    onChange={(event) => setLeadForm((prev) => ({ ...prev, sector: event.target.value }))}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                    disabled={isMutating}
                  >
                    <option value="">Select sector</option>
                    <option value="Private">Private</option>
                    <option value="Public">Public</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
                  Region
                  <input
                    value={leadForm.region}
                    onChange={(event) => setLeadForm((prev) => ({ ...prev, region: event.target.value }))}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                    disabled={isMutating}
                  />
                </label>
              </div>
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
                Notes
                <textarea
                  value={leadForm.notes}
                  onChange={(event) => setLeadForm((prev) => ({ ...prev, notes: event.target.value }))}
                  className="min-h-[100px] rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                  disabled={isMutating}
                />
              </label>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-300 hover:text-slate-900"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isMutating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
                  disabled={isMutating}
                >
                  Save lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isConvertModalOpen && convertLeadId && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4 py-8">
          <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <header className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">{convertModalTitle}</h2>
              <button
                type="button"
                className="text-xl text-slate-400 transition hover:text-slate-600"
                aria-label="Close"
                onClick={closeConvertModal}
                disabled={isMutating}
              >
                ×
              </button>
            </header>
            <form
              className="mt-5 flex-1 space-y-4 overflow-y-auto pr-2"
              style={{ scrollbarGutter: 'stable' }}
              onSubmit={handleConvertSubmit}
            >
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
                Opportunity name *
                <input
                  required
                  value={convertForm.name}
                  onChange={(event) => setConvertForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  disabled={isMutating}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
                Proposed solution
                <textarea
                  value={convertForm.solution}
                  onChange={(event) => setConvertForm((prev) => ({ ...prev, solution: event.target.value }))}
                  className="min-h-[100px] rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  disabled={isMutating}
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
                  Opportunity stage *
                  <select
                    required
                    value={convertForm.stage}
                    onChange={(event) => setConvertForm((prev) => ({ ...prev, stage: event.target.value }))}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    disabled={isMutating}
                  >
                    <option value="">Select stage</option>
                    <option value="Lead">Lead</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Quotation">Quotation</option>
                    <option value="Evaluation">Evaluation</option>
                    <option value="Closed Won">Closed Won</option>
                    <option value="Closed Lost">Closed Lost</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
                  Winning probability (%)
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={convertForm.probability}
                    onChange={(event) => setConvertForm((prev) => ({ ...prev, probability: event.target.value }))}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    disabled={isMutating}
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
                  Estimated value (USD)
                  <input
                    type="number"
                    min={0}
                    value={convertForm.value}
                    onChange={(event) => setConvertForm((prev) => ({ ...prev, value: event.target.value }))}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    disabled={isMutating}
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
                  Expected close date
                  <input
                    type="date"
                    value={convertForm.closeDate}
                    onChange={(event) => setConvertForm((prev) => ({ ...prev, closeDate: event.target.value }))}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    disabled={isMutating}
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
                  Competitors
                  <input
                    value={convertForm.competitors}
                    onChange={(event) => setConvertForm((prev) => ({ ...prev, competitors: event.target.value }))}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    disabled={isMutating}
                  />
                </label>
              </div>
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
                Key decision makers
                <textarea
                  value={convertForm.kdm}
                  onChange={(event) => setConvertForm((prev) => ({ ...prev, kdm: event.target.value }))}
                  className="min-h-[100px] rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  disabled={isMutating}
                />
              </label>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-300 hover:text-slate-900"
                  onClick={closeConvertModal}
                  disabled={isMutating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
                  disabled={isMutating}
                >
                  {isOpportunityEdit ? 'Save changes' : 'Convert to opportunity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isTargetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-8">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <header className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">{targetModalTitle}</h2>
              <button
                type="button"
                className="text-xl text-slate-400 transition hover:text-slate-600"
                aria-label="Close"
                onClick={closeTargetModal}
                disabled={isTargetMutating}
              >
                ×
              </button>
            </header>
            <form className="mt-5 space-y-4" onSubmit={handleTargetSubmit}>
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
                Target period *
                <select
                  value={targetForm.period}
                  onChange={(event) =>
                    handleTargetPeriodChange(event.target.value as TargetFormState['period'])
                  }
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                  disabled={isTargetMutating}
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="YEARLY">Yearly</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
                Target amount (USD) *
                <input
                  type="number"
                  min={0}
                  value={targetForm.amount}
                  onChange={(event) => handleTargetFieldChange('amount', event.target.value)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                  disabled={isTargetMutating}
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
                  Period start *
                  <input
                    type="date"
                    value={targetForm.periodStart}
                    onChange={(event) => handleTargetFieldChange('periodStart', event.target.value)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                    disabled={isTargetMutating}
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
                  Period end *
                  <input
                    type="date"
                    value={targetForm.periodEnd}
                    onChange={(event) => handleTargetFieldChange('periodEnd', event.target.value)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                    disabled={isTargetMutating}
                  />
                </label>
              </div>
              <p className="text-xs text-slate-500">
                Ensure target periods do not overlap. Existing targets for the same timeframe will be rejected.
              </p>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-300 hover:text-slate-900"
                  onClick={closeTargetModal}
                  disabled={isTargetMutating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
                  disabled={isTargetMutating}
                >
                  {targetModalSubmitLabel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div
          role="status"
          className={cn(
            'fixed bottom-5 right-5 z-50 rounded-2xl px-4 py-3 text-sm font-medium text-white shadow-lg transition',
            toast.tone === 'success' && 'bg-emerald-600',
            toast.tone === 'error' && 'bg-rose-600',
            toast.tone === 'info' && 'bg-sky-600',
          )}
        >
          {toast.message}
        </div>
      )}
    </main>
  )
}
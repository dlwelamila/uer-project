"use client"

import { useMemo, useState } from 'react'

type TabKey = 'certifications' | 'oem' | 'training'

type CertificationRecord = {
  id: string
  employee: string
  role: string
  certification: string
  vendor: string
  domain: string
  year: number
  expires: string
  status: 'Active' | 'Expires Soon' | 'Expired'
  statusDetail: string
}

type OemComplianceRecord = {
  id: string
  employee: string
  certification: string
  oem: string
  specialization: string
  required: number
  earned: number
  overallRequirement: number
  overallEarned: number
  complianceStatus: 'On Track' | 'Pending' | 'At Risk'
}

type TrainingRecord = {
  id: string
  employee: string
  vendor: string
  module: string
  domain: string
  progressPercent: number
  timeline: string
  status: 'In Progress' | 'Completed' | 'Not Started'
}

type ModalState = {
  open: boolean
  type: TabKey | null
}

const INITIAL_CERTIFICATIONS: CertificationRecord[] = [
  {
    id: 'cert-derick-vxrail',
    employee: 'Derick Lwelamila',
    role: 'Systems Engineer',
    certification: 'VxRail Deploy',
    vendor: 'Dell Technologies',
    domain: 'HCI',
    year: 2025,
    expires: '2026-04-01',
    status: 'Active',
    statusDetail: 'Active - renew Apr 2026',
  },
  {
    id: 'cert-derick-powerstore',
    employee: 'Derick Lwelamila',
    role: 'Systems Engineer',
    certification: 'PowerStore Implementation Engineer',
    vendor: 'Dell Technologies',
    domain: 'Storage',
    year: 2025,
    expires: '2025-11-20',
    status: 'Expires Soon',
    statusDetail: 'Expires Nov 2025',
  },
  {
    id: 'cert-sarah-azure',
    employee: 'Sarah Johnson',
    role: 'Cloud Architect',
    certification: 'Azure Solutions Architect Expert',
    vendor: 'Microsoft',
    domain: 'Cloud',
    year: 2024,
    expires: '2026-02-15',
    status: 'Active',
    statusDetail: 'Renew Feb 2026',
  },
  {
    id: 'cert-johnson-ccnp',
    employee: 'Johnson M.',
    role: 'Network Lead',
    certification: 'CCNP Enterprise',
    vendor: 'Cisco',
    domain: 'Networking',
    year: 2023,
    expires: '2025-07-01',
    status: 'Expires Soon',
    statusDetail: 'Renew July 2025',
  },
  {
    id: 'cert-adele-vmware',
    employee: 'Adele Morris',
    role: 'Virtualization Specialist',
    certification: 'VMware VCP-DCV',
    vendor: 'VMware',
    domain: 'Virtualization',
    year: 2024,
    expires: '2025-09-30',
    status: 'Active',
    statusDetail: 'Healthy coverage',
  },
  {
    id: 'cert-sam-aws',
    employee: 'Sam Patel',
    role: 'Solutions Consultant',
    certification: 'AWS Solutions Architect Professional',
    vendor: 'AWS',
    domain: 'Cloud',
    year: 2023,
    expires: '2025-12-10',
    status: 'Active',
    statusDetail: 'Renew Dec 2025',
  },
]

const INITIAL_OEM_COMPLIANCE: OemComplianceRecord[] = [
  {
    id: 'oem-derick-powerstore',
    employee: 'Derick Lwelamila',
    certification: 'PowerStore Implementation Engineer',
    oem: 'Dell Technologies',
    specialization: 'Storage Deployment',
    required: 6,
    earned: 5,
    overallRequirement: 10,
    overallEarned: 8,
    complianceStatus: 'Pending',
  },
  {
    id: 'oem-sarah-azure',
    employee: 'Sarah Johnson',
    certification: 'Azure Solutions Architect Expert',
    oem: 'Microsoft',
    specialization: 'Cloud Architecture',
    required: 4,
    earned: 4,
    overallRequirement: 6,
    overallEarned: 6,
    complianceStatus: 'On Track',
  },
  {
    id: 'oem-johnson-ccnp',
    employee: 'Johnson M.',
    certification: 'CCNP Enterprise',
    oem: 'Cisco',
    specialization: 'Enterprise Networking',
    required: 5,
    earned: 3,
    overallRequirement: 8,
    overallEarned: 6,
    complianceStatus: 'At Risk',
  },
]
const CERTIFICATION_TIMELINE = [
  { year: 2023, vendor: 'Dell Technologies', count: 3 },
  { year: 2023, vendor: 'Cisco', count: 2 },
  { year: 2023, vendor: 'VMware', count: 1 },
  { year: 2024, vendor: 'Dell Technologies', count: 4 },
  { year: 2024, vendor: 'Cisco', count: 3 },
  { year: 2024, vendor: 'VMware', count: 2 },
  { year: 2025, vendor: 'Dell Technologies', count: 5 },
  { year: 2025, vendor: 'Cisco', count: 4 },
  { year: 2025, vendor: 'VMware', count: 3 },
]

const OEM_COLOR_MAP: Record<string, string> = {
  'Dell Technologies': '#0284c7',
  Cisco: '#059669',
  VMware: '#6366f1',
}

const VENDOR_PIE_COLOR_MAP: Record<string, string> = {
  'Dell Technologies': '#38bdf8',
  Cisco: '#34d399',
  VMware: '#818cf8',
}

const CERT_SPREAD_CHART_SIZE = 180
const CERT_SPREAD_CHART_RADIUS = 70
const CERT_SPREAD_STROKE_WIDTH = 18
const CERT_SPREAD_CIRCUMFERENCE = 2 * Math.PI * CERT_SPREAD_CHART_RADIUS

const VENDOR_LINE_COLOR_MAP: Record<string, string> = {
  'Dell Technologies': '#0284c7',
  Cisco: '#10b981',
  VMware: '#6366f1',
}

function vendorLineColor(vendor: string) {
  return VENDOR_LINE_COLOR_MAP[vendor] ?? '#64748b'
}

function shortVendorLabel(vendor: string) {
  if (vendor === 'Dell Technologies') return 'Dell'
  return vendor
}

function vendorPieColor(vendor: string) {
  return VENDOR_PIE_COLOR_MAP[vendor] ?? '#94a3b8'
}

type VendorChipTheme = {
  card: string
  label: string
  count: string
  sub: string
}

const VENDOR_CHIP_THEME: Record<string, VendorChipTheme> = {
  'Dell Technologies': {
    card: 'from-sky-50 via-white to-white border-sky-200',
    label: 'text-sky-700',
    count: 'text-slate-900',
    sub: 'text-sky-500',
  },
  Cisco: {
    card: 'from-emerald-50 via-white to-white border-emerald-200',
    label: 'text-emerald-700',
    count: 'text-slate-900',
    sub: 'text-emerald-500',
  },
  VMware: {
    card: 'from-indigo-50 via-white to-white border-indigo-200',
    label: 'text-indigo-700',
    count: 'text-slate-900',
    sub: 'text-indigo-500',
  },
}

function vendorChipTheme(vendor: string): VendorChipTheme {
  return (
    VENDOR_CHIP_THEME[vendor] ?? {
      card: 'from-slate-50 via-white to-white border-slate-200',
      label: 'text-slate-600',
      count: 'text-slate-900',
      sub: 'text-slate-400',
    }
  )
}

function complianceBadgeClass(status: OemComplianceRecord['complianceStatus']) {
  if (status === 'On Track') return 'bg-emerald-50 text-emerald-600'
  if (status === 'Pending') return 'bg-amber-50 text-amber-700'
  return 'bg-rose-50 text-rose-600'
}

const INITIAL_TRAINING: TrainingRecord[] = [
  {
    id: 'train-derick',
    employee: 'Derick',
    vendor: 'Dell Technologies',
    module: 'PowerScale Concepts',
    domain: 'Storage',
    progressPercent: 65,
    timeline: '2 weeks',
    status: 'In Progress',
  },
  {
    id: 'train-johnson',
    employee: 'Johnson M.',
    vendor: 'VMware',
    module: 'vSphere Installation',
    domain: 'Virtualization',
    progressPercent: 30,
    timeline: '4 weeks',
    status: 'In Progress',
  },
  {
    id: 'train-sarah',
    employee: 'Sarah Johnson',
    vendor: 'Microsoft',
    module: 'Azure Fundamentals',
    domain: 'Cloud',
    progressPercent: 100,
    timeline: 'Completed',
    status: 'Completed',
  },
]

function formatMonthLabel(value: string) {
  if (!value) return '—'
  const date = new Date(value)
  return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date)
}

function daysUntil(value: string) {
  const target = new Date(value)
  const now = new Date()
  const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return Number.isFinite(diff) ? diff : null
}

function statusBadgeClass(status: string) {
  if (status === 'Active' || status === 'Completed') return 'bg-emerald-50 text-emerald-600'
  if (status === 'Expires Soon' || status === 'In Progress') return 'bg-amber-50 text-amber-700'
  if (status === 'Expired') return 'bg-rose-50 text-rose-600'
  return 'bg-slate-100 text-slate-600'
}

function progressFillClass(percent: number) {
  if (percent >= 80) return 'bg-emerald-500'
  if (percent >= 60) return 'bg-sky-500'
  if (percent >= 40) return 'bg-amber-500'
  return 'bg-rose-500'
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function CompetencyDashboardClient() {
  const [activeTab, setActiveTab] = useState<TabKey>('certifications')
  const [modal, setModal] = useState<ModalState>({ open: false, type: null })
  const [certifications, setCertifications] = useState<CertificationRecord[]>(INITIAL_CERTIFICATIONS)
  const [oemCompliance, setOemCompliance] = useState<OemComplianceRecord[]>(INITIAL_OEM_COMPLIANCE)
  const [training, setTraining] = useState<TrainingRecord[]>(INITIAL_TRAINING)

  const [certificationForm, setCertificationForm] = useState({
    employee: '',
    role: '',
    certification: '',
    vendor: 'Dell Technologies',
    domain: '',
    year: `${new Date().getFullYear()}`,
    expires: '',
    status: 'Active' as CertificationRecord['status'],
    statusDetail: '',
  })

  const [oemForm, setOemForm] = useState({
    employee: '',
    certification: '',
    oem: 'Dell Technologies',
    specialization: '',
    required: '',
    earned: '',
    overallRequirement: '',
    overallEarned: '',
    complianceStatus: 'Pending' as OemComplianceRecord['complianceStatus'],
  })

  const [trainingForm, setTrainingForm] = useState({
    employee: '',
    vendor: 'Dell Technologies',
    module: '',
    domain: '',
    progressPercent: '',
    timeline: '',
    status: 'In Progress' as TrainingRecord['status'],
  })

  const headerStats = useMemo(() => {
    const employeeMap = new Map<string, { role: string; count: number }>()
    for (const record of certifications) {
      const entry = employeeMap.get(record.employee)
      if (entry) {
        entry.count += 1
      } else {
        employeeMap.set(record.employee, { role: record.role, count: 1 })
      }
    }
    for (const item of training) {
      if (!employeeMap.has(item.employee)) {
        employeeMap.set(item.employee, { role: '', count: 0 })
      }
    }
    const totalCertifications = certifications.length
    const completedTraining = training.filter((item) => item.status === 'Completed').length
    const completionRate = training.length ? Math.round((completedTraining / training.length) * 100) : 0

    return {
      employeeCount: employeeMap.size,
      totalCertifications,
      completionRate,
    }
  }, [certifications, training])

  const employeeSummary = useMemo(() => {
    const summary = new Map<
      string,
      { role: string; vendorTotals: Map<string, number>; total: number }
    >()

    for (const record of certifications) {
      if (!summary.has(record.employee)) {
        summary.set(record.employee, {
          role: record.role,
          vendorTotals: new Map<string, number>(),
          total: 0,
        })
      }
      const entry = summary.get(record.employee)!
      entry.total += 1
      entry.vendorTotals.set(record.vendor, (entry.vendorTotals.get(record.vendor) ?? 0) + 1)
    }

    return Array.from(summary.entries()).map(([employee, data]) => ({
      employee,
      role: data.role,
      total: data.total,
      vendorTotals: Array.from(data.vendorTotals.entries())
        .map(([vendor, count]) => ({ vendor, count }))
        .sort((a, b) => b.count - a.count),
    }))
  }, [certifications])

  const highlightedEmployee = useMemo(() => {
    if (employeeSummary.length === 0) return null
    return (
      employeeSummary.find((item) => item.employee === 'Derick Lwelamila') ?? employeeSummary[0]
    )
  }, [employeeSummary])

  const certificationBreakdown = useMemo(() => {
    if (employeeSummary.length === 0) return []
    const breakdown = employeeSummary.map((item) => ({
      employee: item.employee,
      role: item.role,
      total: item.total,
      certifications: certifications
        .filter((cert) => cert.employee === item.employee)
        .sort((a, b) =>
          a.vendor.localeCompare(b.vendor) || a.certification.localeCompare(b.certification),
        ),
    }))

    if (!highlightedEmployee) {
      return breakdown.sort((a, b) => b.total - a.total || a.employee.localeCompare(b.employee))
    }

    return breakdown.sort((a, b) => {
      if (a.employee === highlightedEmployee.employee) return -1
      if (b.employee === highlightedEmployee.employee) return 1
      return b.total - a.total || a.employee.localeCompare(b.employee)
    })
  }, [certifications, employeeSummary, highlightedEmployee])

  const vendorPercentages = useMemo(() => {
    if (certifications.length === 0) return []
    const totals = new Map<string, number>()
    for (const item of certifications) {
      totals.set(item.vendor, (totals.get(item.vendor) ?? 0) + 1)
    }
    return Array.from(totals.entries())
      .map(([vendor, count]) => ({
        vendor,
        percent: Math.round((count / certifications.length) * 100),
        count,
      }))
      .sort((a, b) => b.percent - a.percent)
  }, [certifications])

  const vendorEmployeeSpread = useMemo(() => {
    if (certifications.length === 0) return []
    const vendorEmployees = new Map<string, Set<string>>()
    const vendorCertTotals = new Map<string, number>()

    for (const record of certifications) {
      if (!vendorEmployees.has(record.vendor)) {
        vendorEmployees.set(record.vendor, new Set<string>())
      }
      vendorEmployees.get(record.vendor)!.add(record.employee)
      vendorCertTotals.set(record.vendor, (vendorCertTotals.get(record.vendor) ?? 0) + 1)
    }

    return Array.from(vendorEmployees.entries())
      .map(([vendor, employees]) => ({
        vendor,
        employeeCount: employees.size,
        certificationCount: vendorCertTotals.get(vendor) ?? 0,
      }))
      .sort((a, b) => b.employeeCount - a.employeeCount || a.vendor.localeCompare(b.vendor))
  }, [certifications])

  const totalVendorEmployeeCount = useMemo(() => {
    return vendorEmployeeSpread.reduce((sum, item) => sum + item.employeeCount, 0)
  }, [vendorEmployeeSpread])

  const uniqueCertifiedEmployees = useMemo(() => {
    return new Set(certifications.map((item) => item.employee)).size
  }, [certifications])

  const vendorEmployeeSegments = useMemo(() => {
    if (vendorEmployeeSpread.length === 0) return []
    let cumulative = 0
    return vendorEmployeeSpread.map((item) => {
      const share = totalVendorEmployeeCount ? item.employeeCount / totalVendorEmployeeCount : 0
      const segment = {
        ...item,
        share,
        offset: cumulative,
      }
      cumulative += share
      return segment
    })
  }, [totalVendorEmployeeCount, vendorEmployeeSpread])

  const upcomingRenewals = useMemo(() => {
    return certifications
      .filter((item) => item.status !== 'Expired')
      .map((item) => ({
        ...item,
        daysRemaining: daysUntil(item.expires),
      }))
      .filter((item) => item.daysRemaining !== null && (item.daysRemaining as number) >= 0)
      .sort((a, b) => (a.daysRemaining ?? 0) - (b.daysRemaining ?? 0))
      .slice(0, 3)
  }, [certifications])

  const competencySignals = useMemo(() => {
    const employeeTotals = new Map<string, number>()
    for (const record of certifications) {
      employeeTotals.set(record.employee, (employeeTotals.get(record.employee) ?? 0) + 1)
    }
    const employeeCount = employeeTotals.size || 1
    const avgLoad = Math.round(((certifications.length || 0) / employeeCount) * 10) / 10
    const highEffortPlans = oemCompliance.filter((item) => item.complianceStatus !== 'On Track').length
    const topVendor = vendorPercentages[0] ?? null
    return { avgLoad, highEffortPlans, topVendor }
  }, [certifications, vendorPercentages, oemCompliance])

  const vendorTrend = useMemo(() => {
    const years = Array.from(new Set(CERTIFICATION_TIMELINE.map((item) => item.year))).sort(
      (a, b) => a - b
    )
    const vendors = Array.from(new Set(CERTIFICATION_TIMELINE.map((item) => item.vendor)))
    const series = vendors.map((vendor) => {
      const history = years.map((year) => {
        const match = CERTIFICATION_TIMELINE.find(
          (item) => item.vendor === vendor && item.year === year
        )
        return { year, count: match?.count ?? 0 }
      })
      return { vendor, history }
    })
    const maxCount = series.length
      ? Math.max(...series.flatMap((item) => item.history.map((point) => point.count)))
      : 0
    return { years, series, maxCount }
  }, [])

  const chartWidth = 640
  const chartHeight = 240
  const chartPadding = { top: 20, right: 32, bottom: 36, left: 48 }
  const chartInnerWidth = chartWidth - chartPadding.left - chartPadding.right
  const chartInnerHeight = chartHeight - chartPadding.top - chartPadding.bottom
  const vendorChartMax = vendorTrend.maxCount || 1
  const vendorChartTicks = vendorTrend.series.length
    ? Array.from({ length: 5 }, (_, index) => Math.round((vendorTrend.maxCount / 4) * index))
    : [0]
  const xScale = (index: number) => {
    if (vendorTrend.years.length <= 1) {
      return chartPadding.left
    }
    return chartPadding.left + (index / (vendorTrend.years.length - 1)) * chartInnerWidth
  }
  const yScale = (count: number) =>
    chartPadding.top + chartInnerHeight - (count / vendorChartMax) * chartInnerHeight

  const oemDonutData = useMemo(() => {
    const totals = new Map<string, { required: number; earned: number }>()
    for (const record of oemCompliance) {
      const current = totals.get(record.oem) ?? { required: 0, earned: 0 }
      current.required = Math.max(current.required, record.overallRequirement)
      current.earned = Math.max(current.earned, record.overallEarned)
      totals.set(record.oem, current)
    }
    return Array.from(totals.entries())
      .map(([oem, stats]) => {
        const earnedPercent = stats.required ? Math.round((stats.earned / stats.required) * 100) : 0
        return {
          oem,
          required: stats.required,
          earned: stats.earned,
          earnedPercent,
          gap: Math.max(stats.required - stats.earned, 0),
        }
      })
      .sort((a, b) => b.earnedPercent - a.earnedPercent)
  }, [oemCompliance])

  function closeModal() {
    setModal({ open: false, type: null })
    setCertificationForm({
      employee: '',
      role: '',
      certification: '',
      vendor: 'Dell Technologies',
      domain: '',
      year: `${new Date().getFullYear()}`,
      expires: '',
      status: 'Active',
      statusDetail: '',
    })
    setOemForm({
      employee: '',
      certification: '',
      oem: 'Dell Technologies',
      specialization: '',
      required: '',
      earned: '',
      overallRequirement: '',
      overallEarned: '',
      complianceStatus: 'Pending',
    })
    setTrainingForm({
      employee: '',
      vendor: 'Dell Technologies',
      module: '',
      domain: '',
      progressPercent: '',
      timeline: '',
      status: 'In Progress',
    })
  }

  function handleSaveData(message: string) {
    window.alert(message)
  }

  function handleAddCertification(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!certificationForm.employee || !certificationForm.certification) return
    const record: CertificationRecord = {
      id: createId('cert'),
      employee: certificationForm.employee,
      role: certificationForm.role || 'Specialist',
      certification: certificationForm.certification,
      vendor: certificationForm.vendor,
      domain: certificationForm.domain || 'General',
      year: Number(certificationForm.year) || new Date().getFullYear(),
      expires: certificationForm.expires || new Date().toISOString(),
      status: certificationForm.status,
      statusDetail: certificationForm.statusDetail || certificationForm.status,
    }
    setCertifications((prev) => [...prev, record])
    closeModal()
  }

  function handleAddOemCompliance(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!oemForm.employee || !oemForm.certification) return
    const required = Math.max(0, Number(oemForm.required) || 0)
    const earned = Math.max(0, Math.min(required, Number(oemForm.earned) || 0))
    const overallRequirement = Math.max(required, Number(oemForm.overallRequirement) || required)
    const overallEarned = Math.max(earned, Math.min(overallRequirement, Number(oemForm.overallEarned) || earned))

    const record: OemComplianceRecord = {
      id: createId('oem'),
      employee: oemForm.employee,
      certification: oemForm.certification,
      oem: oemForm.oem,
      specialization: oemForm.specialization || 'General',
      required,
      earned,
      overallRequirement,
      overallEarned,
      complianceStatus: oemForm.complianceStatus,
    }
    setOemCompliance((prev) => [...prev, record])
    closeModal()
  }

  function handleAddTraining(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!trainingForm.employee || !trainingForm.module) return
    const record: TrainingRecord = {
      id: createId('training'),
      employee: trainingForm.employee,
      vendor: trainingForm.vendor,
      module: trainingForm.module,
      domain: trainingForm.domain || 'General',
      progressPercent: Math.min(100, Math.max(0, Number(trainingForm.progressPercent) || 0)),
      timeline: trainingForm.timeline || 'TBD',
      status: trainingForm.status,
    }
    setTraining((prev) => [...prev, record])
    closeModal()
  }

  function deleteCertification(id: string) {
    setCertifications((prev) => prev.filter((item) => item.id !== id))
  }

  function deleteOemRecord(id: string) {
    setOemCompliance((prev) => prev.filter((item) => item.id !== id))
  }

  function deleteTrainingRecord(id: string) {
    setTraining((prev) => prev.filter((item) => item.id !== id))
  }

  const topVendorCopy = competencySignals.topVendor
    ? `Top vendor coverage: ${competencySignals.topVendor.vendor} holds ${competencySignals.topVendor.percent}% (${competencySignals.topVendor.count} certifications).`
    : 'Capture certifications to build vendor coverage insights.'

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white px-6 py-7 shadow">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Competency coverage</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Employee certifications & enablement</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Monitor certification velocity, OEM accountability, and enablement activity in one workspace.
            </p>
          </div>
          <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm text-slate-600">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Employees</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{headerStats.employeeCount}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm text-slate-600">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Active certifications</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{headerStats.totalCertifications}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm text-slate-600">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Training completion</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{headerStats.completionRate}%</p>
            </div>
          </div>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Vendor certification trend</h2>
              <p className="text-sm text-slate-500">Annual certification counts per vendor.</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {vendorTrend.years.length} year{vendorTrend.years.length === 1 ? '' : 's'}
            </span>
          </div>
          {vendorTrend.series.length > 0 ? (
            <div className="mt-6 overflow-x-auto">
              <svg width={chartWidth} height={chartHeight} className="max-w-full">
                <rect x={0} y={0} width={chartWidth} height={chartHeight} fill="white" />
                {vendorChartTicks.map((tick) => {
                  const y = yScale(tick)
                  return (
                    <g key={`tick-${tick}`}>
                      <line
                        x1={chartPadding.left}
                        y1={y}
                        x2={chartWidth - chartPadding.right}
                        y2={y}
                        stroke="#e2e8f0"
                        strokeWidth={1}
                        strokeDasharray="4 4"
                      />
                      <text
                        x={chartPadding.left - 10}
                        y={y + 4}
                        textAnchor="end"
                        className="text-[10px] fill-slate-400"
                      >
                        {tick}
                      </text>
                    </g>
                  )
                })}
                <line
                  x1={chartPadding.left}
                  y1={chartHeight - chartPadding.bottom}
                  x2={chartWidth - chartPadding.right}
                  y2={chartHeight - chartPadding.bottom}
                  stroke="#94a3b8"
                  strokeWidth={1}
                />
                {vendorTrend.years.map((year, index) => {
                  const x = xScale(index)
                  return (
                    <text
                      key={`year-${year}`}
                      x={x}
                      y={chartHeight - chartPadding.bottom + 18}
                      textAnchor="middle"
                      className="text-[10px] fill-slate-400"
                    >
                      {year}
                    </text>
                  )
                })}
                {vendorTrend.series.map((series) => {
                  if (!series.history.length) return null
                  const pathData = series.history
                    .map((point, index) => {
                      const x = xScale(index)
                      const y = yScale(point.count)
                      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
                    })
                    .join(' ')
                  return (
                    <g key={series.vendor} fill="none" stroke={vendorLineColor(series.vendor)}>
                      <path d={pathData} strokeWidth={2.5} strokeLinecap="round" />
                      {series.history.map((point, index) => {
                        const x = xScale(index)
                        const y = yScale(point.count)
                        return (
                          <circle
                            key={`${series.vendor}-${point.year}`}
                            cx={x}
                            cy={y}
                            r={3.5}
                            fill="#fff"
                            stroke={vendorLineColor(series.vendor)}
                            strokeWidth={2}
                          />
                        )
                      })}
                    </g>
                  )
                })}
              </svg>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-sm text-slate-500">
              Add certification data to visualize trends over time.
            </div>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-600">
            {vendorTrend.series.map((series) => (
              <span
                key={`legend-${series.vendor}`}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: vendorLineColor(series.vendor) }}
                />
                <span className="font-medium text-slate-700">{series.vendor}</span>
              </span>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow">
          <div className="flex flex-col gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Team spotlight</h2>
              <p className="text-sm text-slate-500">Highest certification coverage at a glance.</p>
            </div>
            {highlightedEmployee ? (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-slate-900">{highlightedEmployee.employee}</p>
                    <p className="text-sm text-slate-500">{highlightedEmployee.role || 'Role not captured'}</p>
                  </div>
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                    {highlightedEmployee.total} cert{highlightedEmployee.total === 1 ? '' : 's'}
                  </span>
                </div>
                {highlightedEmployee.vendorTotals.length > 0 ? (
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                    {highlightedEmployee.vendorTotals.map((vendorStat) => {
                      const theme = vendorChipTheme(vendorStat.vendor)
                      return (
                        <span
                          key={`${highlightedEmployee.employee}-${vendorStat.vendor}`}
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 shadow-sm bg-gradient-to-br ${theme.card}`}
                        >
                          <span className={`text-xs font-semibold ${theme.label}`}>{shortVendorLabel(vendorStat.vendor)}</span>
                          <span className={`text-xs font-medium ${theme.count}`}>{vendorStat.count}</span>
                        </span>
                      )
                    })}
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Capture certifications to spotlight specialists.</p>
            )}
            {employeeSummary.length > 0 ? (
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Top certification holders
                </p>
                <ul className="mt-2 space-y-2 text-sm text-slate-600">
                  {employeeSummary.slice(0, 4).map((item) => (
                    <li
                      key={`top-${item.employee}`}
                      className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-3 py-2 shadow-sm"
                    >
                      <span className="font-medium text-slate-700">{item.employee}</span>
                      <span className="text-xs font-semibold text-slate-500">{item.total} cert{item.total === 1 ? '' : 's'}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </article>
      </section>

      <nav className="flex flex-wrap items-center gap-3" aria-label="Competency sections">
        {(['certifications', 'oem', 'training'] as TabKey[]).map((tab) => {
          const label =
            tab === 'certifications'
              ? 'Certifications'
              : tab === 'oem'
                ? 'OEM compliance'
                : 'Enablement training'
          return (
            <button
              key={tab}
              type="button"
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab
                  ? 'border-slate-900 bg-slate-900 text-white shadow'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {label}
            </button>
          )
        })}
      </nav>

      {activeTab === 'certifications' ? (
        <section className="space-y-6">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Employee certifications</h2>
                <p className="text-sm text-slate-500">Live roster of credentials with expiration windows.</p>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700"
                onClick={() => setModal({ open: true, type: 'certifications' })}
              >
                <span aria-hidden>＋</span>
                Add certification
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] xl:gap-6">
              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-sm">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Vendor coverage</p>
                    <h3 className="text-base font-semibold text-slate-900">Certified employee spread</h3>
                    <p className="text-sm text-slate-500">Employees with active certifications per vendor.</p>
                  </div>
                  {vendorEmployeeSegments.length > 0 ? (
                    <div className="relative mx-auto flex h-[180px] w-[180px] items-center justify-center">
                      <svg
                        width={CERT_SPREAD_CHART_SIZE}
                        height={CERT_SPREAD_CHART_SIZE}
                        viewBox={`0 0 ${CERT_SPREAD_CHART_SIZE} ${CERT_SPREAD_CHART_SIZE}`}
                      >
                        <g transform={`rotate(-90 ${CERT_SPREAD_CHART_SIZE / 2} ${CERT_SPREAD_CHART_SIZE / 2})`}>
                          <circle
                            cx={CERT_SPREAD_CHART_SIZE / 2}
                            cy={CERT_SPREAD_CHART_SIZE / 2}
                            r={CERT_SPREAD_CHART_RADIUS}
                            stroke="#e2e8f0"
                            strokeWidth={CERT_SPREAD_STROKE_WIDTH}
                            fill="transparent"
                          />
                          {vendorEmployeeSegments.map((segment) => (
                            <circle
                              key={segment.vendor}
                              cx={CERT_SPREAD_CHART_SIZE / 2}
                              cy={CERT_SPREAD_CHART_SIZE / 2}
                              r={CERT_SPREAD_CHART_RADIUS}
                              stroke={vendorPieColor(segment.vendor)}
                              strokeWidth={CERT_SPREAD_STROKE_WIDTH}
                              strokeLinecap="round"
                              fill="transparent"
                              strokeDasharray={`${segment.share * CERT_SPREAD_CIRCUMFERENCE} ${CERT_SPREAD_CIRCUMFERENCE}`}
                              strokeDashoffset={-segment.offset * CERT_SPREAD_CIRCUMFERENCE}
                            />
                          ))}
                        </g>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-3xl font-semibold text-slate-900">{uniqueCertifiedEmployees}</span>
                        <span className="text-xs uppercase tracking-widest text-slate-500">Employees</span>
                        <span className="text-[11px] text-slate-400">with certifications</span>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4 text-sm text-slate-500">
                      No certification coverage yet.
                    </div>
                  )}
                </div>
                {vendorEmployeeSegments.length > 0 ? (
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                    {vendorEmployeeSegments.map((segment) => (
                      <span
                        key={`${segment.vendor}-spread`}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50/80 px-3 py-1 shadow-sm"
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: vendorPieColor(segment.vendor) }}
                        />
                        <span className="font-medium text-slate-700">{shortVendorLabel(segment.vendor)}</span>
                        <span className="text-xs text-slate-500">{segment.employeeCount} emp</span>
                        <span className="text-[11px] font-medium text-slate-400">{segment.certificationCount} cert</span>
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Certification breakdown</p>
                    <h3 className="text-base font-semibold text-slate-900">All employees</h3>
                    <p className="text-sm text-slate-500">Vendor, domain, and renewal context for every credential.</p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {certificationBreakdown.length} employee{certificationBreakdown.length === 1 ? '' : 's'}
                  </span>
                </div>
                {certificationBreakdown.length > 0 ? (
                  <div className="mt-5 space-y-4">
                    {certificationBreakdown.map((group) => (
                      <div key={group.employee} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{group.employee}</p>
                            <p className="text-xs text-slate-500">{group.role || 'Role not specified'}</p>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Total certs</p>
                            <p className="text-lg font-semibold text-slate-900">{group.total}</p>
                          </div>
                        </div>
                        {group.certifications.length > 0 ? (
                          <div className="mt-3 grid gap-3 lg:grid-cols-2">
                            {group.certifications.map((item) => (
                              <div key={item.id} className="rounded-xl border border-white/60 bg-white px-4 py-3 shadow-sm">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-semibold text-slate-900">{item.certification}</p>
                                    <p className="text-xs text-slate-500">{shortVendorLabel(item.vendor)} · {item.domain}</p>
                                  </div>
                                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(item.status)}`}>
                                    {item.status}
                                  </span>
                                </div>
                                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                                    {item.year}
                                  </span>
                                  <span>Detail: {item.statusDetail}</span>
                                  <span>Expires {formatMonthLabel(item.expires)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-3 text-xs text-slate-500">No certifications recorded.</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-5 text-sm text-slate-500">No certifications captured yet.</p>
                )}
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-3 text-left">Name</th>
                    <th className="px-6 py-3 text-left">Role</th>
                    <th className="px-6 py-3 text-left">Certification</th>
                    <th className="px-6 py-3 text-left">Vendor</th>
                    <th className="px-6 py-3 text-left">Domain</th>
                    <th className="px-6 py-3 text-left">Year</th>
                    <th className="px-6 py-3 text-left">Expires</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {certifications.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70">
                      <td className="px-6 py-4 font-medium text-slate-900">{item.employee}</td>
                      <td className="px-6 py-4">{item.role}</td>
                      <td className="px-6 py-4">{item.certification}</td>
                      <td className="px-6 py-4">{item.vendor}</td>
                      <td className="px-6 py-4">{item.domain}</td>
                      <td className="px-6 py-4">{item.year}</td>
                      <td className="px-6 py-4">{formatMonthLabel(item.expires)}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-200"
                          onClick={() => deleteCertification(item.id)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <div className="grid gap-6 md:grid-cols-2">
            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">Certification summary</h3>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {vendorPercentages.length} vendors
                </span>
              </div>
              <div className="mt-5 space-y-4">
                {vendorPercentages.map((item) => (
                  <div key={item.vendor} className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span>{item.vendor}</span>
                      <span>{item.percent}% / {item.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200">
                      <div className={`h-full rounded-full ${progressFillClass(item.percent)}`} style={{ width: `${item.percent}%` }} />
                    </div>
                  </div>
                ))}
                {vendorPercentages.length === 0 ? (
                  <p className="text-sm text-slate-500">Add certifications to build vendor coverage.</p>
                ) : null}
              </div>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">Upcoming renewals</h3>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  {upcomingRenewals.length}
                </span>
              </div>
              <div className="mt-5 space-y-4 text-sm text-slate-600">
                {upcomingRenewals.map((item) => (
                  <div key={item.id} className="space-y-2 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-amber-800">{item.employee}</p>
                      <span className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                        {item.daysRemaining} days
                      </span>
                    </div>
                    <p className="text-xs text-amber-700">Renew {item.certification} by {formatMonthLabel(item.expires)}</p>
                  </div>
                ))}
                {upcomingRenewals.length === 0 ? (
                  <p className="text-sm text-slate-500">No renewals in the next 90 days.</p>
                ) : null}
              </div>
            </article>
          </div>

          <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-950 to-[#03070f] px-6 py-7 text-sm text-slate-200 shadow">
            <h3 className="text-base font-semibold text-white">Coverage signals</h3>
            <ul className="mt-3 space-y-2 text-slate-300">
              <li>
                • Average earned load holds at {competencySignals.avgLoad} certifications per specialist.
              </li>
              <li>
                •
                {competencySignals.highEffortPlans === 0
                  ? ' No OEM compliance gaps currently flagged.'
                  : ` ${competencySignals.highEffortPlans} OEM compliance gap${competencySignals.highEffortPlans === 1 ? '' : 's'} pending remediation.`}
              </li>
              <li>• {topVendorCopy}</li>
            </ul>
          </article>
        </section>
      ) : null}

      {activeTab === 'oem' ? (
        <section className="space-y-6">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">OEM compliance coverage</h2>
                <p className="text-sm text-slate-500">Visualize required vs earned certifications for each OEM partner.</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {oemDonutData.length} OEM track{oemDonutData.length === 1 ? '' : 's'}
              </span>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {oemDonutData.map((item) => {
                const completion = item.required ? Math.round((item.earned / item.required) * 100) : 0
                const accent = OEM_COLOR_MAP[item.oem] ?? '#0f172a'
                const donutStyle = {
                  background: `conic-gradient(${accent} ${Math.min(completion, 100)}%, #e2e8f0 ${Math.min(completion, 100)}% 100%)`,
                }
                return (
                  <div key={item.oem} className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-6 text-center">
                    <div className="relative h-28 w-28 rounded-full" style={donutStyle}>
                      <div className="absolute inset-4 rounded-full bg-white" />
                      <span className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-slate-900">
                        {completion}%
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-900">{item.oem}</p>
                      <p className="text-xs uppercase tracking-wide text-slate-500">Required {item.required}</p>
                      <p className="text-xs uppercase tracking-wide text-slate-500">Earned {item.earned}</p>
                      <p className="text-xs text-slate-500">Gap {item.gap}</p>
                    </div>
                  </div>
                )
              })}
              {oemDonutData.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-6 text-center text-sm text-slate-500">
                  Add OEM compliance records to populate this overview.
                </div>
              ) : null}
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Certification Matrix (Vendor/OEM certification progress)</h2>
                <p className="text-sm text-slate-500">Example matrix highlighting individual progress against OEM mandates.</p>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700"
                onClick={() => setModal({ open: true, type: 'oem' })}
              >
                <span aria-hidden>＋</span>
                Add OEM compliance
              </button>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-3 text-left">Name</th>
                    <th className="px-6 py-3 text-left">Certification</th>
                    <th className="px-6 py-3 text-left">OEM</th>
                    <th className="px-6 py-3 text-left">Specialization</th>
                    <th className="px-6 py-3 text-left">Required</th>
                    <th className="px-6 py-3 text-left">Earned</th>
                    <th className="px-6 py-3 text-left">Overall requirement</th>
                    <th className="px-6 py-3 text-left">Overall earned</th>
                    <th className="px-6 py-3 text-left">Compliance status</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {oemCompliance.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70">
                      <td className="px-6 py-4 font-medium text-slate-900">{item.employee}</td>
                      <td className="px-6 py-4">{item.certification}</td>
                      <td className="px-6 py-4">{item.oem}</td>
                      <td className="px-6 py-4">{item.specialization}</td>
                      <td className="px-6 py-4">{item.required}</td>
                      <td className="px-6 py-4">{item.earned}</td>
                      <td className="px-6 py-4">{item.overallRequirement}</td>
                      <td className="px-6 py-4">{item.overallEarned}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${complianceBadgeClass(item.complianceStatus)}`}>
                          {item.complianceStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-200"
                          onClick={() => deleteOemRecord(item.id)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      ) : null}

      {activeTab === 'training' ? (
        <section className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Employee training progress</h2>
                  <p className="text-sm text-slate-500">Track course velocity and domain coverage.</p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700"
                  onClick={() => setModal({ open: true, type: 'training' })}
                >
                  <span aria-hidden>＋</span>
                  Add training
                </button>
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-6 py-3 text-left">Name</th>
                      <th className="px-6 py-3 text-left">Vendor</th>
                      <th className="px-6 py-3 text-left">Module</th>
                      <th className="px-6 py-3 text-left">Domain</th>
                      <th className="px-6 py-3 text-left">Progress</th>
                      <th className="px-6 py-3 text-left">Timeline</th>
                      <th className="px-6 py-3 text-left">Status</th>
                      <th className="px-6 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {training.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70">
                        <td className="px-6 py-4 font-medium text-slate-900">{item.employee}</td>
                        <td className="px-6 py-4">{item.vendor}</td>
                        <td className="px-6 py-4">{item.module}</td>
                        <td className="px-6 py-4">{item.domain}</td>
                        <td className="px-6 py-4">{item.progressPercent}%</td>
                        <td className="px-6 py-4">{item.timeline}</td>
                        <td className="px-6 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-200"
                            onClick={() => deleteTrainingRecord(item.id)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <aside className="space-y-6">
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow">
                <h3 className="text-base font-semibold text-slate-900">Training progress overview</h3>
                <div className="mt-5 space-y-4">
                  {training.map((item) => (
                    <div key={item.id} className="space-y-2">
                      <div className="flex items-center justify-between text-sm text-slate-600">
                        <span>{item.employee} — {item.module}</span>
                        <span>{item.progressPercent}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200">
                        <div className={`h-full rounded-full ${progressFillClass(item.progressPercent)}`} style={{ width: `${item.progressPercent}%` }} />
                      </div>
                    </div>
                  ))}
                  {training.length === 0 ? (
                    <p className="text-sm text-slate-500">No training plans captured yet.</p>
                  ) : null}
                </div>
              </article>

              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow">
                <h3 className="text-base font-semibold text-slate-900">Training completion rate</h3>
                <div className="mt-5 space-y-4 text-sm text-slate-600">
                  <div>
                    <div className="flex items-center justify-between">
                      <span>This month</span>
                      <span>45%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-teal-500" style={{ width: '45%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span>Last month</span>
                      <span>60%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-purple-500" style={{ width: '60%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span>Quarterly average</span>
                      <span>52%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-sky-500" style={{ width: '52%' }} />
                    </div>
                  </div>
                </div>
              </article>
            </aside>
          </div>

          <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-950 to-[#03070f] px-6 py-7 text-sm text-slate-200 shadow">
            <h3 className="text-base font-semibold text-white">Enablement actions</h3>
            <ul className="mt-3 space-y-2 text-slate-300">
              <li>• Schedule partner labs for tracks below 40% completion.</li>
              <li>• Align renewal coaching with upcoming certification expirations.</li>
              <li>• Publish monthly competency digest for executive stakeholders.</li>
            </ul>
          </article>
        </section>
      ) : null}

      <footer className="flex flex-col items-center gap-4 rounded-3xl border border-slate-200 bg-white px-6 py-6 text-sm text-slate-600 shadow sm:flex-row sm:justify-between">
  <p className="font-medium text-slate-700">Competency status dashboard - FY25</p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow hover:bg-slate-700"
            onClick={() => handleSaveData('Data saved. Hook this action into your API when ready.')}
          >
            Save snapshot
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 hover:border-slate-400 hover:text-slate-900"
            onClick={() => handleSaveData('Data reloaded. Replace with server fetch when wiring backend.')}
          >
            Reload data
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-sky-700 hover:bg-sky-100"
            onClick={() => handleSaveData('Export coming soon. Attach PDF or CSV export when ready.')}
          >
            Export report
          </button>
        </div>
      </footer>

      {modal.open ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Add record</p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">
                  {modal.type === 'certifications' && 'Add certification'}
                  {modal.type === 'oem' && 'Add OEM compliance'}
                  {modal.type === 'training' && 'Add training'}
                </h3>
              </div>
              <button
                type="button"
                className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-500 hover:border-slate-300 hover:text-slate-900"
                onClick={closeModal}
              >
                Close
              </button>
            </div>

            {modal.type === 'certifications' ? (
              <form className="mt-6 space-y-4" onSubmit={handleAddCertification}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="cert-employee">
                      Employee
                    </label>
                    <input
                      id="cert-employee"
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm"
                      value={certificationForm.employee}
                      onChange={(event) => setCertificationForm((prev) => ({ ...prev, employee: event.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="cert-role">
                      Role
                    </label>
                    <input
                      id="cert-role"
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm"
                      value={certificationForm.role}
                      onChange={(event) => setCertificationForm((prev) => ({ ...prev, role: event.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="cert-name">
                      Certification
                    </label>
                    <input
                      id="cert-name"
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm"
                      value={certificationForm.certification}
                      onChange={(event) => setCertificationForm((prev) => ({ ...prev, certification: event.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="cert-domain">
                      Tech domain
                    </label>
                    <input
                      id="cert-domain"
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm"
                      value={certificationForm.domain}
                      onChange={(event) => setCertificationForm((prev) => ({ ...prev, domain: event.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="cert-vendor">
                      Vendor
                    </label>
                    <select
                      id="cert-vendor"
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm"
                      value={certificationForm.vendor}
                      onChange={(event) => setCertificationForm((prev) => ({ ...prev, vendor: event.target.value }))}
                    >
                      {['Dell Technologies', 'Cisco', 'VMware', 'Microsoft', 'AWS', 'Other'].map((vendor) => (
                        <option key={vendor} value={vendor}>
                          {vendor}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="cert-year">
                      Year earned
                    </label>
                    <input
                      id="cert-year"
                      type="number"
                      min={2000}
                      max={2100}
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm"
                      value={certificationForm.year}
                      onChange={(event) => setCertificationForm((prev) => ({ ...prev, year: event.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="cert-expires">
                      Expires
                    </label>
                    <input
                      id="cert-expires"
                      type="date"
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm"
                      value={certificationForm.expires}
                      onChange={(event) => setCertificationForm((prev) => ({ ...prev, expires: event.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="cert-status">
                      Status
                    </label>
                    <select
                      id="cert-status"
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm"
                      value={certificationForm.status}
                      onChange={(event) => setCertificationForm((prev) => ({ ...prev, status: event.target.value as CertificationRecord['status'] }))}
                    >
                      {['Active', 'Expires Soon', 'Expired'].map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700" htmlFor="cert-status-detail">
                    Status detail
                  </label>
                  <input
                    id="cert-status-detail"
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm"
                    value={certificationForm.statusDetail}
                    onChange={(event) => setCertificationForm((prev) => ({ ...prev, statusDetail: event.target.value }))}
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-sky-700"
                  >
                    Save certification
                  </button>
                </div>
              </form>
            ) : null}

            {modal.type === 'oem' ? (
              <form className="mt-6 space-y-4" onSubmit={handleAddOemCompliance}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="oem-employee">Employee</label>
                    <input
                      id="oem-employee"
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm"
                      value={oemForm.employee}
                      onChange={(event) => setOemForm((prev) => ({ ...prev, employee: event.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="oem-cert">Certification</label>
                    <input
                      id="oem-cert"
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm"
                      value={oemForm.certification}
                      onChange={(event) => setOemForm((prev) => ({ ...prev, certification: event.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="oem-name">OEM</label>
                    <select
                      id="oem-name"
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm"
                      value={oemForm.oem}
                      onChange={(event) => setOemForm((prev) => ({ ...prev, oem: event.target.value }))}
                    >
                      {['Dell Technologies', 'Cisco', 'VMware', 'Microsoft', 'AWS', 'Other'].map((vendor) => (
                        <option key={vendor} value={vendor}>
                          {vendor}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="oem-specialization">Specialization</label>
                    <input
                      id="oem-specialization"
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm"
                      value={oemForm.specialization}
                      onChange={(event) => setOemForm((prev) => ({ ...prev, specialization: event.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="oem-required">Required</label>
                    <input
                      id="oem-required"
                      type="number"
                      min={0}
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm"
                      value={oemForm.required}
                      onChange={(event) => setOemForm((prev) => ({ ...prev, required: event.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="oem-earned">Earned</label>
                    <input
                      id="oem-earned"
                      type="number"
                      min={0}
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm"
                      value={oemForm.earned}
                      onChange={(event) => setOemForm((prev) => ({ ...prev, earned: event.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="oem-overall-required">Overall requirement</label>
                    <input
                      id="oem-overall-required"
                      type="number"
                      min={0}
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm"
                      value={oemForm.overallRequirement}
                      onChange={(event) => setOemForm((prev) => ({ ...prev, overallRequirement: event.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="oem-overall-earned">Overall earned</label>
                    <input
                      id="oem-overall-earned"
                      type="number"
                      min={0}
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm"
                      value={oemForm.overallEarned}
                      onChange={(event) => setOemForm((prev) => ({ ...prev, overallEarned: event.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700" htmlFor="oem-status">Compliance status</label>
                  <select
                    id="oem-status"
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm"
                    value={oemForm.complianceStatus}
                    onChange={(event) => setOemForm((prev) => ({ ...prev, complianceStatus: event.target.value as OemComplianceRecord['complianceStatus'] }))}
                  >
                    {['On Track', 'Pending', 'At Risk'].map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-sky-700"
                  >
                    Save OEM compliance
                  </button>
                </div>
              </form>
            ) : null}

            {modal.type === 'training' ? (
              <form className="mt-6 space-y-4" onSubmit={handleAddTraining}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="training-employee">Employee</label>
                    <input
                      id="training-employee"
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm"
                      value={trainingForm.employee}
                      onChange={(event) => setTrainingForm((prev) => ({ ...prev, employee: event.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="training-vendor">Vendor</label>
                    <select
                      id="training-vendor"
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm"
                      value={trainingForm.vendor}
                      onChange={(event) => setTrainingForm((prev) => ({ ...prev, vendor: event.target.value }))}
                    >
                      {['Dell Technologies', 'VMware', 'Microsoft', 'Cisco', 'AWS', 'Other'].map((vendor) => (
                        <option key={vendor} value={vendor}>
                          {vendor}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="training-module">Training module</label>
                    <input
                      id="training-module"
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm"
                      value={trainingForm.module}
                      onChange={(event) => setTrainingForm((prev) => ({ ...prev, module: event.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="training-domain">Tech domain</label>
                    <input
                      id="training-domain"
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm"
                      value={trainingForm.domain}
                      onChange={(event) => setTrainingForm((prev) => ({ ...prev, domain: event.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="training-progress">Progress (%)</label>
                    <input
                      id="training-progress"
                      type="number"
                      min={0}
                      max={100}
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm"
                      value={trainingForm.progressPercent}
                      onChange={(event) => setTrainingForm((prev) => ({ ...prev, progressPercent: event.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="training-timeline">Timeline</label>
                    <input
                      id="training-timeline"
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm"
                      value={trainingForm.timeline}
                      onChange={(event) => setTrainingForm((prev) => ({ ...prev, timeline: event.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="training-status">Status</label>
                    <select
                      id="training-status"
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm"
                      value={trainingForm.status}
                      onChange={(event) => setTrainingForm((prev) => ({ ...prev, status: event.target.value as TrainingRecord['status'] }))}
                    >
                      {['In Progress', 'Completed', 'Not Started'].map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-sky-700"
                  >
                    Save training plan
                  </button>
                </div>
              </form>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

"use client"

import { ChangeEvent, useEffect, useMemo, useState } from 'react'

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
  notExpiring: boolean
  attachmentUrl?: string
  attachmentName?: string
  attachmentType?: 'pdf' | 'image'
}

type OemAssignment = {
  id: string
  trackId: string
  engineerId: string
  engineer: string
  engineerRole: string
  certificationName: string
  status: 'Earned' | 'Ongoing' | 'Pending'
  startedAt: string | null
  completedAt: string | null
  dueAt: string | null
  certificationId: string | null
  attachmentUrl?: string
  attachmentName?: string | null
  attachmentType?: 'pdf' | 'image'
}

type OemTrack = {
  id: string
  oem: string
  specialization: string
  requiredCerts: number
  earnedCerts: number
  overallRequirement: number
  overallEarned: number
  complianceStatus: 'On Track' | 'Pending' | 'At Risk'
  targetDate: string | null
  roadmapNotes: string | null
  assignments: OemAssignment[]
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

type TrainingFormState = {
  employee: string
  vendor: string
  module: string
  domain: string
  progressPercent: string
  timeline: string
  status: TrainingRecord['status']
}

type ModalKey = 'certifications' | 'oemTrack' | 'oemAssignment' | 'training' | 'enablementProgram'

type ModalState = {
  open: boolean
  type: ModalKey | null
  meta?: {
    trackId?: string
    assignmentId?: string
    trainingId?: string
    enablementProgramId?: string
  }
}

type EngineerIdentity = {
  name: string
  role: string
}

type CertificationFormState = {
  employee: string
  role: string
  certification: string
  vendor: string
  domain: string
  year: string
  expires: string
  status: CertificationRecord['status']
  statusDetail: string
  notExpiring: boolean
  attachment: File | null
}

type AttachmentPreviewState = {
  url: string
  name?: string
  type?: CertificationRecord['attachmentType']
}

type OemTrackFormState = {
  oem: string
  specialization: string
  requiredCerts: string
  overallRequirement: string
  targetDate: string
  complianceStatus: OemTrack['complianceStatus']
  roadmapNotes: string
}

type OemAssignmentFormState = {
  trackId: string
  engineer: string
  engineerRole: string
  certificationName: string
  status: OemAssignment['status']
  startedAt: string
  completedAt: string
  dueAt: string
  certificationId: string
}

type TrainingPayload = {
  id?: string
  employee?: string
  vendor?: string
  module?: string
  domain?: string | null
  progressPercent?: number | string | null
  timeline?: string | null
  status?: string
}

type EnablementRoleLabel = 'Sales' | 'Systems Engineer'

type EnablementProgramRecord = {
  id: string
  vendor: string
  specialization: string
  role: EnablementRoleLabel
  keywords: string[]
  activeYear: number
  notes: string | null
}

type EnablementProgramFormState = {
  vendor: string
  specialization: string
  role: EnablementRoleLabel
  keywords: string
  activeYear: string
  notes: string
}

type EnablementProgramPayload = {
  id?: string
  vendor?: string
  specialization?: string
  role?: string | null
  keywords?: string[] | string | null
  activeYear?: number | string | null
  notes?: string | null
}

const CERT_ATTACHMENT_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpg',
  'image/jpeg',
  'image/gif',
  'image/webp',
])

const DEFAULT_VENDOR_OPTIONS = [
  'Dell Technologies',
  'Cisco',
  'HP',
  'VMware',
  'Broadcom',
  'Fortinet',
  'Oracle',
  'Huawei',
  'Arista',
  'Microsoft',
  'Google',
  'Azure',
  'AWS',
  'Pure Storage',
  'Palo Alto Networks',
  'Acer',
  'Splunk',
  'Tenable',
  'SolarWinds',
  'Others',
]

const DEFAULT_OEM_OPTIONS = [
  'Dell Technologies',
  'Cisco',
  'HP',
  'VMware',
  'Broadcom',
  'Fortinet',
  'Oracle',
  'Huawei',
  'Arista',
  'Microsoft',
  'Google',
  'Azure',
  'AWS',
  'Pure Storage',
  'Palo Alto Networks',
  'Acer',
  'Splunk',
  'Tenable',
  'SolarWinds',
  'Others',
]

const TRAINING_COVERAGE_COLORS = {
  completed: '#047857',
  inProgress: '#0284c7',
  notStarted: '#f59e0b',
} as const

const ENABLEMENT_ROLE_COLORS: Record<EnablementRoleLabel, string> = {
  Sales: '#0ea5e9',
  'Systems Engineer': '#6366f1',
}

const ENABLEMENT_ROLE_OPTIONS: EnablementRoleLabel[] = ['Sales', 'Systems Engineer']

const DEFAULT_SPECIALIZATION_SYNONYMS: Record<string, string[]> = {
  hci: ['hyperconverged', 'hyper converged', 'vxrail', 'vx rail', 'hybrid cloud'],
  storage: ['storage', 'san', 'nas', 'powerstore', 'powermax', 'unity', 'dorado'],
  server: ['server', 'compute', 'poweredge'],
  'data protection': ['data protection', 'backup', 'cyber recovery', 'dr', 'powerprotect'],
  networking: ['network', 'switch', 'lan', 'connectivity'],
  security: ['security', 'secops', 'firewall', 'sase'],
  cloud: ['cloud', 'hybrid cloud', 'multi-cloud', 'virtualization'],
}

type CertificationPayload = {
  id?: string
  employee?: string
  role?: string | null
  certification?: string
  vendor?: string
  domain?: string | null
  year?: number | string | null
  expires?: string | null
  status?: string
  statusDetail?: string | null
  notExpiring?: boolean | null
  attachmentUrl?: string | null
  attachmentName?: string | null
  attachmentType?: string | null
}

type OemAssignmentPayload = {
  id?: string
  trackId?: string
  engineerId?: string
  engineer?: string
  engineerRole?: string
  certificationName?: string
  status?: string
  startedAt?: string | null
  completedAt?: string | null
  dueAt?: string | null
  certificationId?: string | null
  attachmentUrl?: string | null
  attachmentName?: string | null
  attachmentType?: string | null
}

type OemTrackPayload = {
  id?: string
  oem?: string
  specialization?: string
  requiredCerts?: number | string | null
  earnedCerts?: number | string | null
  overallRequirement?: number | string | null
  overallEarned?: number | string | null
  complianceStatus?: string
  targetDate?: string | null
  roadmapNotes?: string | null
  assignments?: OemAssignmentPayload[]
}

function normalizeCertificationPayload(payload: CertificationPayload): CertificationRecord {
  const status = payload?.status
  const validStatus: CertificationRecord['status'] =
    status === 'Expires Soon' || status === 'Expired' ? status : 'Active'

  const expiresValue = typeof payload?.expires === 'string' ? payload.expires : ''

  return {
    id: String(payload?.id ?? ''),
    employee: String(payload?.employee ?? ''),
    role: String(payload?.role ?? ''),
    certification: String(payload?.certification ?? ''),
    vendor: String(payload?.vendor ?? ''),
    domain: payload?.domain ? String(payload.domain) : 'General',
    year: Number.isFinite(payload?.year) ? Number(payload.year) : new Date().getFullYear(),
    expires: expiresValue,
    status: validStatus,
    statusDetail: payload?.statusDetail ? String(payload.statusDetail) : validStatus,
    notExpiring: Boolean(payload?.notExpiring),
    attachmentUrl: payload?.attachmentUrl ? String(payload.attachmentUrl) : undefined,
    attachmentName: payload?.attachmentName ? String(payload.attachmentName) : undefined,
    attachmentType:
      payload?.attachmentType === 'pdf' || payload?.attachmentType === 'image'
        ? payload.attachmentType
        : undefined,
  }
}

function normalizeOemAssignmentPayload(payload: OemAssignmentPayload, fallbackTrackId: string): OemAssignment {
  const statusValue = payload.status
  const normalizedStatus: OemAssignment['status'] =
    statusValue === 'Earned' || statusValue === 'Ongoing' ? statusValue : 'Pending'

  return {
    id: String(payload.id ?? ''),
    trackId: String(payload.trackId ?? fallbackTrackId ?? ''),
    engineerId: String(payload.engineerId ?? ''),
    engineer: String(payload.engineer ?? ''),
    engineerRole: String(payload.engineerRole ?? ''),
    certificationName: String(payload.certificationName ?? ''),
    status: normalizedStatus,
    startedAt: payload.startedAt && payload.startedAt.length > 0 ? payload.startedAt : null,
    completedAt: payload.completedAt && payload.completedAt.length > 0 ? payload.completedAt : null,
    dueAt: payload.dueAt && payload.dueAt.length > 0 ? payload.dueAt : null,
    certificationId: payload.certificationId ? String(payload.certificationId) : null,
    attachmentUrl: payload.attachmentUrl ?? undefined,
    attachmentName: payload.attachmentName ?? undefined,
    attachmentType:
      payload.attachmentType === 'pdf' || payload.attachmentType === 'image'
        ? payload.attachmentType
        : undefined,
  }
}

function compareAssignments(a: OemAssignment, b: OemAssignment) {
  const engineerCompare = a.engineer.localeCompare(b.engineer)
  if (engineerCompare !== 0) return engineerCompare
  return a.certificationName.localeCompare(b.certificationName)
}

function normalizeOemTrackPayload(payload: OemTrackPayload): OemTrack {
  const complianceStatus = payload.complianceStatus
  const normalizedStatus: OemTrack['complianceStatus'] =
    complianceStatus === 'On Track' || complianceStatus === 'At Risk' ? complianceStatus : 'Pending'

  const required = Number(payload.requiredCerts ?? 0)
  const requiredCerts = Number.isFinite(required) ? Math.max(0, required) : 0
  const earnedValue = Number(payload.earnedCerts ?? 0)
  const earnedCerts = Number.isFinite(earnedValue) ? Math.max(0, earnedValue) : 0
  const overallRequirementValue = Number(payload.overallRequirement ?? requiredCerts)
  const overallRequirement = Number.isFinite(overallRequirementValue)
    ? Math.max(requiredCerts, overallRequirementValue)
    : requiredCerts
  const overallEarnedValue = Number(payload.overallEarned ?? earnedCerts)
  const overallEarned = Number.isFinite(overallEarnedValue)
    ? Math.min(overallRequirement, Math.max(0, overallEarnedValue))
    : Math.min(overallRequirement, earnedCerts)

  const assignmentsRaw = Array.isArray(payload.assignments) ? payload.assignments : []
  const assignments = assignmentsRaw
    .map((item) => normalizeOemAssignmentPayload(item, String(payload.id ?? '')))
    .sort(compareAssignments)

  return {
    id: String(payload.id ?? ''),
    oem: String(payload.oem ?? ''),
    specialization: String(payload.specialization ?? ''),
    requiredCerts,
    earnedCerts,
    overallRequirement,
    overallEarned,
    complianceStatus: normalizedStatus,
    targetDate: payload.targetDate && payload.targetDate.length > 0 ? payload.targetDate : null,
    roadmapNotes: payload.roadmapNotes ?? null,
    assignments,
  }
}

function sortOemTracks(records: OemTrack[]) {
  return [...records].sort((a, b) => {
    const vendorCompare = a.oem.localeCompare(b.oem)
    if (vendorCompare !== 0) return vendorCompare
    return a.specialization.localeCompare(b.specialization)
  })
}

function sortCertifications(records: CertificationRecord[]) {
  return [...records].sort((a, b) => {
    const nameCompare = a.employee.localeCompare(b.employee)
    if (nameCompare !== 0) return nameCompare
    return a.certification.localeCompare(b.certification)
  })
}

function sortTrainingRecords(records: TrainingRecord[]) {
  return [...records].sort((a, b) => {
    const nameCompare = a.employee.localeCompare(b.employee)
    if (nameCompare !== 0) return nameCompare
    return a.module.localeCompare(b.module)
  })
}

function mergeVendorOptions(current: string[], records: CertificationRecord[]) {
  const OTHERS = 'Others'
  const base = new Set(current.filter((item) => item !== OTHERS))
  for (const record of records) {
    if (record.vendor && record.vendor !== OTHERS) {
      base.add(record.vendor)
    }
  }
  const merged = Array.from(base).sort((a, b) => a.localeCompare(b))
  merged.push(OTHERS)
  return merged
}

function mergeOemOptions(current: string[], records: OemTrack[]) {
  const OTHERS = 'Others'
  const base = new Set(current.filter((item) => item !== OTHERS))
  for (const record of records) {
    if (record.oem && record.oem !== OTHERS) {
      base.add(record.oem)
    }
  }
  const merged = Array.from(base).sort((a, b) => a.localeCompare(b))
  merged.push(OTHERS)
  return merged
}

function mergeOemVendorsFromPrograms(current: string[], programs: EnablementProgramRecord[]) {
  const OTHERS = 'Others'
  const base = new Set(current.filter((item) => item !== OTHERS))
  for (const program of programs) {
    if (program.vendor && program.vendor !== OTHERS) {
      base.add(program.vendor)
    }
  }
  const merged = Array.from(base).sort((a, b) => a.localeCompare(b))
  merged.push(OTHERS)
  return merged
}

function normalizeTrainingPayload(payload: TrainingPayload): TrainingRecord {
  const statusValue = (payload?.status ?? '').toLowerCase()
  let status: TrainingRecord['status'] = 'In Progress'
  if (statusValue === 'completed') {
    status = 'Completed'
  } else if (statusValue === 'not started') {
    status = 'Not Started'
  }

  const progressValue = Number(payload?.progressPercent ?? 0)
  const progressPercent = Number.isFinite(progressValue)
    ? Math.min(100, Math.max(0, Math.round(progressValue)))
    : 0

  return {
    id: String(payload?.id ?? ''),
    employee: String(payload?.employee ?? ''),
    vendor: String(payload?.vendor ?? ''),
    module: String(payload?.module ?? ''),
    domain: payload?.domain ? String(payload.domain) : 'General',
    progressPercent,
    timeline: payload?.timeline ? String(payload.timeline) : 'TBD',
    status,
  }
}

function sortEnablementPrograms(records: EnablementProgramRecord[]) {
  return [...records].sort(
    (a, b) =>
      a.vendor.localeCompare(b.vendor) ||
      a.specialization.localeCompare(b.specialization) ||
      a.role.localeCompare(b.role)
  )
}

function normalizeEnablementProgramPayload(payload: EnablementProgramPayload): EnablementProgramRecord {
  const keywordsRaw = Array.isArray(payload?.keywords)
    ? payload?.keywords
    : typeof payload?.keywords === 'string'
      ? payload.keywords.split(',')
      : []

  const activeYearValue = Number(payload?.activeYear ?? new Date().getFullYear())
  const activeYear = Number.isFinite(activeYearValue)
    ? Math.max(2000, Math.min(9999, Math.round(activeYearValue)))
    : new Date().getFullYear()

  const roleValue = normalizeCompareValue(String(payload?.role ?? 'Systems Engineer'))
  const role: EnablementRoleLabel = roleValue === 'sales' ? 'Sales' : 'Systems Engineer'

  return {
    id: String(payload?.id ?? ''),
    vendor: String(payload?.vendor ?? ''),
    specialization: String(payload?.specialization ?? ''),
    role,
    keywords: keywordsRaw
      .map((item) => String(item ?? '').trim())
      .filter((item) => item.length > 0),
    activeYear,
    notes: payload?.notes ? String(payload.notes) : null,
  }
}

function normalizeCompareValue(value: string | null | undefined) {
  return String(value ?? '').trim().toLowerCase()
}

function inferTrainingRole(record: TrainingRecord): EnablementRoleLabel {
  const probe = normalizeCompareValue(`${record.module} ${record.domain}`)
  const SALES_KEYWORDS = ['sales', 'account', 'business', 'partner', 'commercial']
  const ENGINEER_KEYWORDS = ['engineer', 'technical', 'architect', 'implementation', 'systems', 'solution', 'deployment']

  if (SALES_KEYWORDS.some((keyword) => probe.includes(keyword))) {
    return 'Sales'
  }

  if (ENGINEER_KEYWORDS.some((keyword) => probe.includes(keyword))) {
    return 'Systems Engineer'
  }

  // Fallback: look for shorthand "SE" markers or assume engineer track
  if (/\bse\b/.test(probe)) {
    return 'Systems Engineer'
  }

  return 'Systems Engineer'
}

function extractYearFromText(value: string | null | undefined) {
  if (!value) return null
  const match = String(value).match(/(20\d{2})/)
  return match ? Number(match[1]) : null
}

function matchesEnablementProgram(record: TrainingRecord, program: EnablementProgramRecord) {
  const domain = normalizeCompareValue(record.domain)
  const moduleValue = normalizeCompareValue(record.module)
  const spec = normalizeCompareValue(program.specialization)

  if (!spec) return true
  if (domain.includes(spec) || moduleValue.includes(spec)) return true

  const normalizedKeywords = (program.keywords.length > 0
    ? program.keywords
    : DEFAULT_SPECIALIZATION_SYNONYMS[spec] ?? [])
    .map((keyword) => normalizeCompareValue(keyword))
    .filter((keyword) => keyword.length > 0)

  return normalizedKeywords.some((keyword) => domain.includes(keyword) || moduleValue.includes(keyword))
}

const OEM_TRACK_STATUS_OPTIONS: OemTrack['complianceStatus'][] = ['On Track', 'Pending', 'At Risk']
const OEM_ASSIGNMENT_STATUS_OPTIONS: OemAssignment['status'][] = ['Pending', 'Ongoing', 'Earned']

const OEM_COLOR_MAP: Record<string, string> = {
  'Dell Technologies': '#0284c7',
  Cisco: '#059669',
  VMware: '#6366f1',
}

const VENDOR_PIE_COLOR_MAP: Record<string, string> = {
  'Dell Technologies': '#38bdf8',
  Cisco: '#34d399',
  VMware: '#818cf8',
  AWS: '#c084fc',
  Fortinet: '#60c17b',
  Microsoft: '#60a5fa',
}

const VENDOR_COLOR_PALETTE = [
  '#facc15',
  '#f97316',
  '#fb7185',
  '#a855f7',
  '#22d3ee',
  '#38bdf8',
  '#4ade80',
  '#f472b6',
  '#14b8a6',
  '#e879f9',
]

const vendorColorRegistry = new Map<string, string>(Object.entries(VENDOR_PIE_COLOR_MAP))
const usedVendorColors = new Set<string>(vendorColorRegistry.values())

function generateHashedVendorColor(vendor: string, attempt: number) {
  let hash = 0
  for (let index = 0; index < vendor.length; index += 1) {
    hash = (hash * 31 + vendor.charCodeAt(index)) >>> 0
  }
  const hue = (hash + attempt * 47) % 360
  return `hsl(${hue}, 70%, 60%)`
}

function resolveVendorColor(vendor: string) {
  if (vendorColorRegistry.has(vendor)) {
    return vendorColorRegistry.get(vendor) as string
  }

  for (const swatch of VENDOR_COLOR_PALETTE) {
    if (!usedVendorColors.has(swatch)) {
      vendorColorRegistry.set(vendor, swatch)
      usedVendorColors.add(swatch)
      return swatch
    }
  }

  let attempt = 0
  let assigned = generateHashedVendorColor(vendor, attempt)
  while (usedVendorColors.has(assigned) && attempt < 12) {
    attempt += 1
    assigned = generateHashedVendorColor(vendor, attempt)
  }

  vendorColorRegistry.set(vendor, assigned)
  usedVendorColors.add(assigned)
  return assigned
}

const CERT_SPREAD_CHART_SIZE = 180
const CERT_SPREAD_CHART_RADIUS = 70
const CERT_SPREAD_STROKE_WIDTH = 18
const CERT_SPREAD_CIRCUMFERENCE = 2 * Math.PI * CERT_SPREAD_CHART_RADIUS
const UPCOMING_RENEWAL_WINDOW_DAYS = 90
const HERO_SCROLL_OFFSET = 96
const HERO_SCROLL_MAX_ATTEMPTS = 6

type HeroNavigateTarget = {
  tab?: TabKey
  elementId?: string
  attempts?: number
}

function vendorLineColor(vendor: string) {
  return resolveVendorColor(vendor)
}

function shortVendorLabel(vendor: string) {
  if (vendor === 'Dell Technologies') return 'Dell'
  return vendor
}

function vendorPieColor(vendor: string) {
  return resolveVendorColor(vendor)
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
  AWS: {
    card: 'from-violet-50 via-white to-white border-violet-200',
    label: 'text-violet-700',
    count: 'text-slate-900',
    sub: 'text-violet-500',
  },
  Fortinet: {
    card: 'from-lime-50 via-white to-white border-lime-200',
    label: 'text-lime-700',
    count: 'text-slate-900',
    sub: 'text-lime-500',
  },
  Microsoft: {
    card: 'from-blue-50 via-white to-white border-blue-200',
    label: 'text-blue-700',
    count: 'text-slate-900',
    sub: 'text-blue-500',
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

function resolveCertificationYear(record: CertificationRecord): number | null {
  if (Number.isFinite(record.year)) {
    return record.year as number
  }

  const parsedYear = Number.parseInt(String(record.year ?? '').trim(), 10)
  if (!Number.isNaN(parsedYear)) {
    return parsedYear
  }

  if (record.expires) {
    const expiresDate = new Date(record.expires)
    if (!Number.isNaN(expiresDate.valueOf())) {
      return expiresDate.getFullYear()
    }
  }

  return null
}

function complianceBadgeClass(status: OemTrack['complianceStatus']) {
  if (status === 'On Track') return 'bg-emerald-50 text-emerald-600'
  if (status === 'Pending') return 'bg-amber-50 text-amber-700'
  return 'bg-rose-50 text-rose-600'
}

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

function formatDateLabel(value: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.valueOf())) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function assignmentStatusBadgeClass(status: OemAssignment['status']) {
  if (status === 'Earned') return 'bg-emerald-50 text-emerald-600'
  if (status === 'Ongoing') return 'bg-sky-50 text-sky-600'
  return 'bg-amber-50 text-amber-700'
}

type TimelineTone = 'success' | 'info' | 'warning' | 'danger' | 'muted'

function timelineToneClass(tone: TimelineTone) {
  if (tone === 'success') return 'text-emerald-600'
  if (tone === 'info') return 'text-sky-600'
  if (tone === 'warning') return 'text-amber-600'
  if (tone === 'danger') return 'text-rose-600'
  return 'text-slate-500'
}

function describeAssignmentTimeline(assignment: OemAssignment): { label: string; tone: TimelineTone } {
  const DAY_MS = 1000 * 60 * 60 * 24

  if (assignment.status === 'Earned') {
    if (assignment.startedAt && assignment.completedAt) {
      const start = new Date(assignment.startedAt)
      const end = new Date(assignment.completedAt)
      if (!Number.isNaN(start.valueOf()) && !Number.isNaN(end.valueOf())) {
        const elapsed = Math.max(1, Math.round((end.getTime() - start.getTime()) / DAY_MS))
        return {
          label: `Completed in ${elapsed} day${elapsed === 1 ? '' : 's'}`,
          tone: 'success',
        }
      }
    }
    return { label: 'Completed', tone: 'success' }
  }

  if (!assignment.dueAt) {
    return { label: 'No due date', tone: 'muted' }
  }

  const due = new Date(assignment.dueAt)
  if (Number.isNaN(due.valueOf())) {
    return { label: 'Due date unavailable', tone: 'muted' }
  }

  const now = new Date()
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / DAY_MS)
  if (diffDays > 0) {
    return {
      label: `Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`,
      tone: diffDays <= 3 ? 'warning' : 'info',
    }
  }
  if (diffDays === 0) {
    return { label: 'Due today', tone: 'warning' }
  }
  const overdue = Math.abs(diffDays)
  return {
    label: `Overdue by ${overdue} day${overdue === 1 ? '' : 's'}`,
    tone: 'danger',
  }
}

type EngineerAssignmentGroup = {
  engineer: string
  engineerRole: string
  assignments: OemAssignment[]
  requiredCount: number
  earnedCount: number
}

function groupAssignmentsByEngineer(assignments: OemAssignment[]): EngineerAssignmentGroup[] {
  const map = new Map<string, { engineer: string; role: string; assignments: OemAssignment[] }>()
  for (const assignment of assignments) {
    const key = `${assignment.engineerId || assignment.engineer}`
    const existing = map.get(key)
    if (existing) {
      existing.assignments.push(assignment)
    } else {
      map.set(key, {
        engineer: assignment.engineer,
        role: assignment.engineerRole,
        assignments: [assignment],
      })
    }
  }

  return Array.from(map.values())
    .map((entry) => ({
      engineer: entry.engineer,
      engineerRole: entry.role,
      assignments: entry.assignments.sort(compareAssignments),
      requiredCount: entry.assignments.length,
      earnedCount: entry.assignments.filter((item) => item.status === 'Earned').length,
    }))
    .sort((a, b) => a.engineer.localeCompare(b.engineer))
}

function progressFillClass(percent: number) {
  if (percent >= 80) return 'bg-emerald-500'
  if (percent >= 60) return 'bg-sky-500'
  if (percent >= 40) return 'bg-amber-500'
  return 'bg-rose-500'
}

function defaultCertificationForm(
  presetEngineer: EngineerIdentity | null = null,
  vendorFallback: string = DEFAULT_VENDOR_OPTIONS[0]
): CertificationFormState {
  return {
    employee: presetEngineer?.name ?? '',
    role: presetEngineer?.role ?? '',
    certification: '',
    vendor: vendorFallback,
    domain: '',
    year: `${new Date().getFullYear()}`,
    expires: '',
    status: 'Active',
    statusDetail: '',
    notExpiring: false,
    attachment: null,
  }
}

function defaultTrainingForm(vendorFallback: string = DEFAULT_VENDOR_OPTIONS[0]): TrainingFormState {
  return {
    employee: '',
    vendor: vendorFallback,
    module: '',
    domain: '',
    progressPercent: '',
    timeline: '',
    status: 'In Progress',
  }
}

function defaultEnablementProgramForm(
  year: number,
  vendorFallback: string = DEFAULT_OEM_OPTIONS[0]
): EnablementProgramFormState {
  return {
    vendor: vendorFallback,
    specialization: '',
    role: 'Sales',
    keywords: '',
    activeYear: `${year}`,
    notes: '',
  }
}

function defaultOemTrackForm(oemFallback: string = DEFAULT_OEM_OPTIONS[0]): OemTrackFormState {
  return {
    oem: oemFallback,
    specialization: '',
    requiredCerts: '0',
    overallRequirement: '0',
    targetDate: '',
    complianceStatus: 'Pending',
    roadmapNotes: '',
  }
}

function defaultOemAssignmentForm(trackId: string, preset: Partial<OemAssignmentFormState> = {}): OemAssignmentFormState {
  return {
    trackId,
    engineer: preset.engineer ?? '',
    engineerRole: preset.engineerRole ?? '',
    certificationName: preset.certificationName ?? '',
    status: preset.status ?? 'Pending',
    startedAt: preset.startedAt ?? '',
    completedAt: preset.completedAt ?? '',
    dueAt: preset.dueAt ?? '',
    certificationId: preset.certificationId ?? '',
  }
}

export function CompetencyDashboardClient() {
  const [activeTab, setActiveTab] = useState<TabKey>('certifications')
  const [modal, setModal] = useState<ModalState>({ open: false, type: null })
  const [certifications, setCertifications] = useState<CertificationRecord[]>([])
  const [oemTracks, setOemTracks] = useState<OemTrack[]>([])
  const [training, setTraining] = useState<TrainingRecord[]>([])
  const [enablementPrograms, setEnablementPrograms] = useState<EnablementProgramRecord[]>([])
  const [activeEngineer, setActiveEngineer] = useState<EngineerIdentity | null>(null)
  const [vendorOptions, setVendorOptions] = useState(DEFAULT_VENDOR_OPTIONS)
  const [customVendorName, setCustomVendorName] = useState('')
  const [oemOptions, setOemOptions] = useState(DEFAULT_OEM_OPTIONS)
  const [customOemName, setCustomOemName] = useState('')
  const [hoveredVendor, setHoveredVendor] = useState<string | null>(null)
  const [highlightedTrendVendor, setHighlightedTrendVendor] = useState<string | null>(null)
  const [pendingHeroScroll, setPendingHeroScroll] = useState<HeroNavigateTarget | null>(null)

  const [certificationForm, setCertificationForm] = useState<CertificationFormState>(
    defaultCertificationForm(null, DEFAULT_VENDOR_OPTIONS[0])
  )
  const [expandedEngineers, setExpandedEngineers] = useState<string[]>([])
  const [attachmentInputKey, setAttachmentInputKey] = useState(0)
  const [certificationAttachmentError, setCertificationAttachmentError] = useState('')
  const [customVendorError, setCustomVendorError] = useState('')
  const [customOemError, setCustomOemError] = useState('')
  const [attachmentPreview, setAttachmentPreview] = useState<AttachmentPreviewState | null>(null)
  const [oemTrackForm, setOemTrackForm] = useState<OemTrackFormState>(
    defaultOemTrackForm(DEFAULT_OEM_OPTIONS[0])
  )
  const [oemAssignmentForm, setOemAssignmentForm] = useState<OemAssignmentFormState>(
    defaultOemAssignmentForm('')
  )
  const [oemFormError, setOemFormError] = useState('')
  const [oemAssignmentError, setOemAssignmentError] = useState('')
  const [trainingForm, setTrainingForm] = useState<TrainingFormState>(
    defaultTrainingForm(DEFAULT_VENDOR_OPTIONS[0])
  )
  const [trainingFormError, setTrainingFormError] = useState('')
  const [enablementForm, setEnablementForm] = useState<EnablementProgramFormState>(
    defaultEnablementProgramForm(new Date().getFullYear(), DEFAULT_OEM_OPTIONS[0])
  )
  const [enablementFormError, setEnablementFormError] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const stored = window.localStorage?.getItem('competency.activeEngineer')
      if (!stored) return
      const parsed = JSON.parse(stored) as Partial<EngineerIdentity>
      if (parsed && typeof parsed.name === 'string' && parsed.name.trim().length > 0) {
        setActiveEngineer({ name: parsed.name, role: parsed.role ?? '' })
      }
    } catch (error) {
      console.warn('Unable to resolve active engineer context', error)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadCertifications() {
      try {
        const response = await fetch('/api/competency/certifications', { cache: 'no-store' })
        if (!response.ok) {
          throw new Error('Failed to load certifications')
        }
        const payload = await response.json()
        if (cancelled) return
        const rows = Array.isArray(payload?.certifications) ? payload.certifications : []
        const normalized = rows.map((item: CertificationPayload) => normalizeCertificationPayload(item))
        setCertifications(sortCertifications(normalized))
        setVendorOptions((previous) => mergeVendorOptions(previous, normalized))
      } catch (error) {
        if (!cancelled) {
          console.warn('Unable to fetch competency certifications', error)
        }
      }
    }

    loadCertifications()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadOemTracks() {
      try {
        const response = await fetch('/api/competency/oem/tracks', { cache: 'no-store' })
        if (!response.ok) {
          throw new Error('Failed to load OEM compliance tracks')
        }
        const payload = await response.json()
        if (cancelled) return
        const rows = Array.isArray(payload?.tracks) ? payload.tracks : []
        const normalized = rows.map((item: OemTrackPayload) => normalizeOemTrackPayload(item))
        const sortedTracks = sortOemTracks(normalized)
        setOemTracks(sortedTracks)
        setOemOptions((previous) => mergeOemOptions(previous, sortedTracks))
      } catch (error) {
        if (!cancelled) {
          console.warn('Unable to fetch OEM compliance tracks', error)
        }
      }
    }

    loadOemTracks()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadTrainingPlans() {
      try {
        const response = await fetch('/api/competency/training', { cache: 'no-store' })
        if (!response.ok) {
          throw new Error('Failed to load training plans')
        }
        const payload = await response.json()
        if (cancelled) return
        const rows = Array.isArray(payload?.training) ? payload.training : []
        const normalized = rows.map((item: TrainingPayload) => normalizeTrainingPayload(item))
        setTraining(sortTrainingRecords(normalized))
      } catch (error) {
        if (!cancelled) {
          console.warn('Unable to fetch training plans', error)
        }
      }
    }

    loadTrainingPlans()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadEnablementPrograms() {
      try {
        const response = await fetch('/api/competency/enablement-programs', { cache: 'no-store' })
        if (!response.ok) {
          throw new Error('Failed to load enablement programs')
        }
        const payload = await response.json()
        if (cancelled) return
        const rows = Array.isArray(payload?.programs) ? payload.programs : []
        const normalized = rows.map((item: EnablementProgramPayload) => normalizeEnablementProgramPayload(item))
        const sortedPrograms = sortEnablementPrograms(normalized)
        setEnablementPrograms(sortedPrograms)
        setOemOptions((previous) => mergeOemVendorsFromPrograms(previous, sortedPrograms))
      } catch (error) {
        if (!cancelled) {
          console.warn('Unable to fetch enablement programs', error)
        }
      }
    }

    loadEnablementPrograms()

    return () => {
      cancelled = true
    }
  }, [])

  const headerStats = useMemo(() => {
    const totalCertifications = certifications.length
    const completedTraining = training.filter((item) => item.status === 'Completed').length
    const completionRate = training.length ? Math.round((completedTraining / training.length) * 100) : 0

    return {
      totalCertifications,
      completionRate,
    }
  }, [certifications, training])

  const trainingCompletionSummary = useMemo(() => {
    if (training.length === 0) {
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        notStarted: 0,
        averageProgress: 0,
      }
    }

    const completed = training.filter((item) => item.status === 'Completed').length
    const inProgress = training.filter((item) => item.status === 'In Progress').length
    const notStarted = training.filter((item) => item.status === 'Not Started').length
    const progressSum = training.reduce((sum, item) => sum + item.progressPercent, 0)
    const averageProgress = Math.round(progressSum / training.length)

    return {
      total: training.length,
      completed,
      inProgress,
      notStarted,
      averageProgress,
    }
  }, [training])

  const trainingTotal = trainingCompletionSummary.total
  const trainingCompleted = trainingCompletionSummary.completed
  const trainingInProgress = trainingCompletionSummary.inProgress
  const trainingNotStarted = trainingCompletionSummary.notStarted

  const currentReportingYear = useMemo(() => new Date().getFullYear(), [])

  const trainingCoverage = useMemo(() => {
    const segments = [
      {
        key: 'completed' as const,
        label: 'Completed',
        value: trainingCompleted,
        color: TRAINING_COVERAGE_COLORS.completed,
      },
      {
        key: 'inProgress' as const,
        label: 'In Progress',
        value: trainingInProgress,
        color: TRAINING_COVERAGE_COLORS.inProgress,
      },
      {
        key: 'notStarted' as const,
        label: 'Not Started',
        value: trainingNotStarted,
        color: TRAINING_COVERAGE_COLORS.notStarted,
      },
    ]

    let cursor = 0
    const gradientStops: string[] = []
    const segmentDetails = segments.map((segment) => {
      const sweep = trainingTotal ? (segment.value / trainingTotal) * 100 : 0
      const start = cursor
      const end = Math.min(100, cursor + sweep)
      if (sweep > 0) {
        gradientStops.push(`${segment.color} ${start}% ${end}%`)
      }
      cursor = end

      return {
        ...segment,
        percentage: trainingTotal ? Math.round((segment.value / trainingTotal) * 100) : 0,
      }
    })

    if (cursor < 100) {
      gradientStops.push(`#e2e8f0 ${cursor}% 100%`)
    }

    const completionRate = trainingTotal ? Math.round((trainingCompleted / trainingTotal) * 100) : 0

    return {
      total: trainingTotal,
      completionRate,
      segments: segmentDetails,
      gradient: `conic-gradient(${gradientStops.join(', ') || '#e2e8f0 0% 100%'})`,
    }
  }, [trainingCompleted, trainingInProgress, trainingNotStarted, trainingTotal])

  const enablementCoverage = useMemo(() => {
    if (enablementPrograms.length === 0) return []

    const grouped = enablementPrograms.reduce(
      (acc, program) => {
        const key = `${program.vendor}||${program.specialization}`
        if (!acc.has(key)) {
          acc.set(key, { vendor: program.vendor, specialization: program.specialization, programs: [] as EnablementProgramRecord[] })
        }
        acc.get(key)!.programs.push(program)
        return acc
      },
      new Map<string, { vendor: string; specialization: string; programs: EnablementProgramRecord[] }>()
    )

    const currentYear = currentReportingYear

    return Array.from(grouped.values())
      .map((group) => {
        const categories = group.programs
          .sort((a, b) => a.role.localeCompare(b.role))
          .map((program) => {
            const normalizedVendor = normalizeCompareValue(program.vendor)
            const programRecords = training.filter(
              (record) =>
                normalizeCompareValue(record.vendor) === normalizedVendor &&
                matchesEnablementProgram(record, program)
            )

            const roleRecords = programRecords.filter(
              (record) => inferTrainingRole(record) === program.role
            )

            const total = roleRecords.length
            const completed = roleRecords.filter((record) => record.status === 'Completed').length
            const averageProgress = total
              ? Math.round(roleRecords.reduce((sum, record) => sum + record.progressPercent, 0) / total)
              : 0
            const coverage = total ? Math.round((completed / total) * 100) : 0
            const outstanding = roleRecords
              .filter((record) => record.status !== 'Completed')
              .sort(
                (a, b) =>
                  a.progressPercent - b.progressPercent || a.employee.localeCompare(b.employee)
              )
              .slice(0, 2)
              .map((record) => ({
                id: record.id,
                employee: record.employee,
                module: record.module,
                progress: record.progressPercent,
              }))

            const staleYears = roleRecords
              .map((record) => extractYearFromText(record.timeline))
              .filter((year): year is number => typeof year === 'number' && Number.isFinite(year) && year < currentYear)

            const requiresRefreshByYear = program.activeYear < currentYear
            const programRefreshYear = requiresRefreshByYear ? program.activeYear : null
            const staleYear = staleYears.length ? Math.min(...staleYears) : null
            const refreshYear = programRefreshYear ?? staleYear

            return {
              programId: program.id,
              category: program.role,
              total,
              completed,
              coverage,
              averageProgress,
              outstanding,
              needsRefresh: requiresRefreshByYear || staleYears.length > 0,
              refreshYear,
              activeYear: program.activeYear,
              notes: program.notes,
              keywords: program.keywords,
            }
          })

        const totalRecords = categories.reduce((sum, item) => sum + item.total, 0)
        const completedRecords = categories.reduce((sum, item) => sum + item.completed, 0)
        const aggregateCoverage = totalRecords ? Math.round((completedRecords / totalRecords) * 100) : 0

        const refreshYears = categories
          .map((item) => item.refreshYear)
          .filter((year): year is number => typeof year === 'number' && Number.isFinite(year))
        const earliestRefreshYear = refreshYears.length ? Math.min(...refreshYears) : null

        return {
          vendor: group.vendor,
          specialization: group.specialization,
          total: totalRecords,
          coverage: aggregateCoverage,
          categories,
          needsRefresh: categories.some((item) => item.needsRefresh),
          refreshYear: earliestRefreshYear,
        }
      })
      .sort(
        (a, b) =>
          a.vendor.localeCompare(b.vendor) || a.specialization.localeCompare(b.specialization)
      )
  }, [currentReportingYear, enablementPrograms, training])

  const totalEnablementRecords = useMemo(
    () => enablementCoverage.reduce((sum, track) => sum + track.total, 0),
    [enablementCoverage]
  )

  const enablementProgramMap = useMemo(
    () => new Map(enablementPrograms.map((program) => [program.id, program])),
    [enablementPrograms]
  )

  const engineerSummary = useMemo(() => {
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
    if (engineerSummary.length === 0) return null
    return (
      engineerSummary.find((item) => item.employee === 'Derick Lwelamila') ?? engineerSummary[0]
    )
  }, [engineerSummary])

  const certificationBreakdown = useMemo(() => {
    if (engineerSummary.length === 0) return []
    const breakdown = engineerSummary.map((item) => ({
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
  }, [certifications, engineerSummary, highlightedEmployee])

  useEffect(() => {
    setExpandedEngineers((previous) =>
      previous.filter((engineer) =>
        certificationBreakdown.some((group) => group.employee === engineer)
      )
    )
  }, [certificationBreakdown])

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

  const upcomingRenewals = useMemo(() => {
    if (certifications.length === 0) return [] as Array<{
      id: string
      employee: string
      certification: string
      expires: string
      daysRemaining: number
    }>

    const queue = certifications
      .map((item) => {
        if (!item.expires || item.notExpiring) return null
        const daysRemaining = daysUntil(item.expires)
        if (daysRemaining === null) return null
        if (daysRemaining < 0 || daysRemaining > UPCOMING_RENEWAL_WINDOW_DAYS) return null
        return {
          id: item.id,
          employee: item.employee,
          certification: item.certification,
          expires: item.expires,
          daysRemaining,
        }
      })
      .filter(
        (entry): entry is {
          id: string
          employee: string
          certification: string
          expires: string
          daysRemaining: number
        } => entry !== null
      )

    return queue.sort((a, b) => a.daysRemaining - b.daysRemaining)
  }, [certifications])

  const vendorEngineerSpread = useMemo(() => {
    if (certifications.length === 0) return []
    const vendorEngineers = new Map<string, Set<string>>()
    const vendorCertTotals = new Map<string, number>()

    for (const record of certifications) {
      if (!vendorEngineers.has(record.vendor)) {
        vendorEngineers.set(record.vendor, new Set<string>())
      }
      vendorEngineers.get(record.vendor)!.add(record.employee)
      vendorCertTotals.set(record.vendor, (vendorCertTotals.get(record.vendor) ?? 0) + 1)
    }

    return Array.from(vendorEngineers.entries())
      .map(([vendor, engineers]) => ({
        vendor,
        engineerCount: engineers.size,
        certificationCount: vendorCertTotals.get(vendor) ?? 0,
      }))
      .sort((a, b) => b.engineerCount - a.engineerCount || a.vendor.localeCompare(b.vendor))
  }, [certifications])

  const totalVendorEngineerCount = useMemo(() => {
    return vendorEngineerSpread.reduce((sum, item) => sum + item.engineerCount, 0)
  }, [vendorEngineerSpread])

  const uniqueCertifiedEngineers = useMemo(() => {
    return new Set(certifications.map((item) => item.employee)).size
  }, [certifications])

  const competencySignals = useMemo(() => {
    const totalCertifications = certifications.length
    const avgLoad = uniqueCertifiedEngineers
      ? Number((totalCertifications / uniqueCertifiedEngineers).toFixed(1))
      : 0

    const highEffortPlans = oemTracks.reduce((count, track) => {
      const gap = Math.max(track.overallRequirement - track.overallEarned, 0)
      if (gap > 0 || track.complianceStatus === 'At Risk') {
        return count + 1
      }
      return count
    }, 0)

    const topVendor = vendorPercentages.length > 0
      ? {
          vendor: vendorPercentages[0].vendor,
          percent: vendorPercentages[0].percent,
          count: vendorPercentages[0].count,
        }
      : null

    return {
      avgLoad,
      highEffortPlans,
      topVendor,
    }
  }, [certifications, oemTracks, uniqueCertifiedEngineers, vendorPercentages])

  const vendorEngineerSegments = useMemo(() => {
    if (vendorEngineerSpread.length === 0) return []
    let cumulative = 0
    return vendorEngineerSpread.map((item) => {
      const share = totalVendorEngineerCount ? item.engineerCount / totalVendorEngineerCount : 0
      const segment = {
        ...item,
        share,
        offset: cumulative,
      }
      cumulative += share
      return segment
    })
  }, [totalVendorEngineerCount, vendorEngineerSpread])

  const hoveredVendorSegment = useMemo(() => {
    if (!hoveredVendor) return null
    return vendorEngineerSegments.find((segment) => segment.vendor === hoveredVendor) ?? null
  }, [hoveredVendor, vendorEngineerSegments])

  const vendorCoverageHeadline = hoveredVendorSegment
    ? {
        value: hoveredVendorSegment.engineerCount,
        label: shortVendorLabel(hoveredVendorSegment.vendor),
        detail: `${hoveredVendorSegment.certificationCount} cert${
          hoveredVendorSegment.certificationCount === 1 ? '' : 's'
        }`,
      }
    : {
        value: uniqueCertifiedEngineers,
        label: 'Engineers',
        detail: 'with certifications',
      }

  useEffect(() => {
    if (!hoveredVendor) return
    if (!vendorEngineerSegments.some((segment) => segment.vendor === hoveredVendor)) {
      setHoveredVendor(null)
    }
  }, [hoveredVendor, vendorEngineerSegments])

  const vendorTrend = useMemo(() => {
    if (certifications.length === 0) {
      return { years: [] as number[], series: [] as Array<{ vendor: string; history: Array<{ year: number; count: number }> }>, maxCount: 0 }
    }

    const yearSet = new Set<number>()
    const vendorYearCounts = new Map<string, Map<number, number>>()

    for (const record of certifications) {
      const vendorName = record.vendor?.trim()
      if (!vendorName) {
        continue
      }

      const resolvedYear = resolveCertificationYear(record)
      if (resolvedYear === null) {
        continue
      }

      yearSet.add(resolvedYear)

      if (!vendorYearCounts.has(vendorName)) {
        vendorYearCounts.set(vendorName, new Map())
      }

      const yearCounts = vendorYearCounts.get(vendorName) as Map<number, number>
      yearCounts.set(resolvedYear, (yearCounts.get(resolvedYear) ?? 0) + 1)
    }

    if (yearSet.size === 0 || vendorYearCounts.size === 0) {
      return { years: [], series: [], maxCount: 0 }
    }

    const years = Array.from(yearSet).sort((a, b) => a - b)
    const series = Array.from(vendorYearCounts.entries())
      .sort(([vendorA], [vendorB]) => vendorA.localeCompare(vendorB))
      .map(([vendor, counts]) => {
        const history = years.map((year) => ({ year, count: counts.get(year) ?? 0 }))
        return { vendor, history }
      })

    const maxCount = series.length
      ? Math.max(...series.flatMap((item) => item.history.map((point) => point.count)))
      : 0

    return { years, series, maxCount }
  }, [certifications])

  useEffect(() => {
    if (!highlightedTrendVendor) return
    if (!vendorTrend.series.some((series) => series.vendor === highlightedTrendVendor)) {
      setHighlightedTrendVendor(null)
    }
  }, [highlightedTrendVendor, vendorTrend.series])

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
    for (const track of oemTracks) {
      const current = totals.get(track.oem) ?? { required: 0, earned: 0 }
      current.required = Math.max(current.required, track.overallRequirement)
      current.earned = Math.max(current.earned, track.overallEarned)
      totals.set(track.oem, current)
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
  }, [oemTracks])

  function openCertificationModal() {
    const vendorFallback = vendorOptions[0] ?? DEFAULT_VENDOR_OPTIONS[0]
    setCertificationForm(defaultCertificationForm(activeEngineer, vendorFallback))
    setCustomVendorName('')
    setCustomVendorError('')
    setAttachmentInputKey((key) => key + 1)
    setCertificationAttachmentError('')
    setModal({ open: true, type: 'certifications' })
  }

  function openTrainingModal() {
    const vendorFallback = vendorOptions[0] ?? DEFAULT_VENDOR_OPTIONS[0]
    setTrainingForm(defaultTrainingForm(vendorFallback))
    setTrainingFormError('')
    setModal({ open: true, type: 'training', meta: undefined })
  }

  function openTrainingEditModal(record: TrainingRecord) {
    setVendorOptions((previous) => {
      if (record.vendor === 'Others') return previous
      const withoutOthers = previous.filter((item) => item !== 'Others')
      if (withoutOthers.some((item) => item.toLowerCase() === record.vendor.toLowerCase())) {
        return previous
      }
      const merged = [...withoutOthers, record.vendor].sort((a, b) => a.localeCompare(b))
      return [...merged, 'Others']
    })
    setTrainingForm({
      employee: record.employee,
      vendor: record.vendor,
      module: record.module,
      domain: record.domain === 'General' ? '' : record.domain,
      progressPercent: record.progressPercent.toString(),
      timeline: record.timeline === 'TBD' ? '' : record.timeline,
      status: record.status,
    })
    setTrainingFormError('')
    setModal({ open: true, type: 'training', meta: { trainingId: record.id } })
  }

  function ensureOemOptionExists(vendor: string) {
    if (!vendor.trim()) return
    setOemOptions((previous) => {
      const withoutOthers = previous.filter((item) => item !== 'Others')
      if (withoutOthers.some((item) => item.toLowerCase() === vendor.toLowerCase())) {
        return previous
      }
      const merged = [...withoutOthers, vendor].sort((a, b) => a.localeCompare(b))
      return [...merged, 'Others']
    })
  }

  function openEnablementProgramModal() {
    const vendorFallback = oemOptions[0] ?? DEFAULT_OEM_OPTIONS[0]
    setEnablementForm(defaultEnablementProgramForm(currentReportingYear, vendorFallback))
    setEnablementFormError('')
    setModal({ open: true, type: 'enablementProgram', meta: undefined })
  }

  function openEnablementEditModal(program: EnablementProgramRecord) {
    ensureOemOptionExists(program.vendor)
    setEnablementForm({
      vendor: program.vendor,
      specialization: program.specialization,
      role: program.role,
      keywords: program.keywords.join(', '),
      activeYear: `${program.activeYear}`,
      notes: program.notes ?? '',
    })
    setEnablementFormError('')
    setModal({
      open: true,
      type: 'enablementProgram',
      meta: { enablementProgramId: program.id },
    })
  }

  function closeModal() {
    setModal({ open: false, type: null, meta: undefined })
    const vendorFallback = vendorOptions[0] ?? DEFAULT_VENDOR_OPTIONS[0]
    const enablementVendorFallback = oemOptions[0] ?? DEFAULT_OEM_OPTIONS[0]
    setCertificationForm(defaultCertificationForm(activeEngineer, vendorFallback))
    setCustomVendorName('')
    setCustomVendorError('')
    setAttachmentInputKey((key) => key + 1)
    setCertificationAttachmentError('')
  setOemTrackForm(defaultOemTrackForm(oemOptions[0] ?? DEFAULT_OEM_OPTIONS[0]))
  setCustomOemName('')
  setCustomOemError('')
    setOemAssignmentForm(defaultOemAssignmentForm(''))
    setOemFormError('')
    setOemAssignmentError('')
    setTrainingForm(defaultTrainingForm(vendorFallback))
    setTrainingFormError('')
    setEnablementForm(defaultEnablementProgramForm(currentReportingYear, enablementVendorFallback))
    setEnablementFormError('')
  }

  function handleSaveData(message: string) {
    window.alert(message)
  }

  function toggleEngineerView(engineer: string) {
    setExpandedEngineers((previous) =>
      previous.includes(engineer)
        ? previous.filter((name) => name !== engineer)
        : [...previous, engineer]
    )
  }

  function handleCertificationAttachmentChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    if (!file) {
      setCertificationForm((previous) => ({ ...previous, attachment: null }))
      setCertificationAttachmentError('')
      return
    }

    if (!CERT_ATTACHMENT_TYPES.has(file.type)) {
      setCertificationAttachmentError('Upload a PDF or image (PNG, JPG, GIF, or WEBP).')
      setCertificationForm((previous) => ({ ...previous, attachment: null }))
      setAttachmentInputKey((key) => key + 1)
      return
    }

    setCertificationForm((previous) => ({ ...previous, attachment: file }))
    setCertificationAttachmentError('')
  }

  function handleVendorSelectChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextVendor = event.target.value
    setCertificationForm((previous) => ({ ...previous, vendor: nextVendor }))
    setCustomVendorError('')
    if (nextVendor !== 'Others') {
      setCustomVendorName('')
    }
  }

  function handleAddCustomVendor() {
    const trimmed = customVendorName.trim()
    if (!trimmed) {
      setCustomVendorError('Enter a vendor name before adding.')
      return
    }

    setVendorOptions((previous) => {
      const withoutOthers = previous.filter((item) => item !== 'Others')
      const exists = withoutOthers.some((item) => item.toLowerCase() === trimmed.toLowerCase())
      const merged = exists ? withoutOthers : [...withoutOthers, trimmed]
      merged.sort((a, b) => a.localeCompare(b))
      return [...merged, 'Others']
    })

    setCertificationForm((previous) => ({ ...previous, vendor: trimmed }))
    setCustomVendorName('')
    setCustomVendorError('')
  }

  function handleOemSelectChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextOem = event.target.value
    setOemTrackForm((previous) => ({ ...previous, oem: nextOem }))
    setCustomOemError('')
    if (nextOem !== 'Others') {
      setCustomOemName('')
    }
  }

  function handleAddCustomOem() {
    const trimmed = customOemName.trim()
    if (!trimmed) {
      setCustomOemError('Enter an OEM name before adding.')
      return
    }

    setOemOptions((previous) => {
      const withoutOthers = previous.filter((item) => item !== 'Others')
      const exists = withoutOthers.some((item) => item.toLowerCase() === trimmed.toLowerCase())
      const merged = exists ? withoutOthers : [...withoutOthers, trimmed]
      merged.sort((a, b) => a.localeCompare(b))
      return [...merged, 'Others']
    })

    setOemTrackForm((previous) => ({ ...previous, oem: trimmed }))
    setCustomOemName('')
    setCustomOemError('')
  }

  function handleNotExpiringToggle(event: ChangeEvent<HTMLInputElement>) {
    const { checked } = event.target
    setCertificationForm((previous) => ({
      ...previous,
      notExpiring: checked,
      expires: checked ? '' : previous.expires,
      status: checked ? 'Active' : previous.status,
    }))
  }

  function handlePrintAttachment(attachmentUrl: string) {
    if (typeof window === 'undefined') return
    const printWindow = window.open(attachmentUrl, '_blank', 'noopener')
    if (!printWindow) {
      window.alert('Pop-ups are blocked. Allow pop-ups to print the attachment.')
      return
    }

    const triggerPrint = () => {
      try {
        printWindow.focus()
        printWindow.print()
      } catch (error) {
        console.warn('Unable to trigger print for certification attachment', error)
      }
    }

    if (printWindow.document?.readyState === 'complete') {
      triggerPrint()
    } else {
      printWindow.addEventListener('load', triggerPrint, { once: true })
    }
  }

  function openAttachmentPreview(payload: AttachmentPreviewState) {
    setAttachmentPreview(payload)
  }

  function closeAttachmentPreview() {
    setAttachmentPreview(null)
  }

  async function handleAddCertification(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!certificationForm.employee || !certificationForm.certification) return

    const formData = new FormData()
    formData.set('employee', certificationForm.employee)
    formData.set('role', certificationForm.role)
    formData.set('certification', certificationForm.certification)
    formData.set('vendor', certificationForm.vendor)
    formData.set('domain', certificationForm.domain)
    formData.set('year', certificationForm.year)
    formData.set('expires', certificationForm.expires)
    formData.set('status', certificationForm.status)
    formData.set('statusDetail', certificationForm.statusDetail)
    formData.set('notExpiring', certificationForm.notExpiring ? 'true' : 'false')
    if (certificationForm.attachment) {
      formData.set('attachment', certificationForm.attachment)
    }

    try {
      const response = await fetch('/api/competency/certifications', {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) {
        const detail = await response.json().catch(() => null)
        throw new Error(detail?.error ?? 'Unable to save certification right now.')
      }
      const data = await response.json()
      const payload = normalizeCertificationPayload(data?.certification ?? {})
      setCertifications((previous) => sortCertifications([...previous, payload]))
      setVendorOptions((previous) => mergeVendorOptions(previous, [payload]))
      setExpandedEngineers((previous) =>
        previous.includes(payload.employee) ? previous : [...previous, payload.employee]
      )
      closeModal()
    } catch (error) {
      console.error('Failed to add certification', error)
      window.alert(error instanceof Error ? error.message : 'Unable to save certification right now.')
    }
  }

  function openOemTrackModal() {
    setOemTrackForm(defaultOemTrackForm(oemOptions[0] ?? DEFAULT_OEM_OPTIONS[0]))
    setOemFormError('')
    setCustomOemName('')
    setCustomOemError('')
    setModal({ open: true, type: 'oemTrack' })
  }

  function openOemAssignmentModal(track: OemTrack, assignment?: OemAssignment) {
    if (assignment) {
      setOemAssignmentForm(
        defaultOemAssignmentForm(track.id, {
          engineer: assignment.engineer,
          engineerRole: assignment.engineerRole,
          certificationName: assignment.certificationName,
          status: assignment.status,
          startedAt: assignment.startedAt ?? '',
          completedAt: assignment.completedAt ?? '',
          dueAt: assignment.dueAt ?? '',
          certificationId: assignment.certificationId ?? '',
        })
      )
      setModal({ open: true, type: 'oemAssignment', meta: { trackId: track.id, assignmentId: assignment.id } })
    } else {
      setOemAssignmentForm(defaultOemAssignmentForm(track.id, { status: 'Pending' }))
      setModal({ open: true, type: 'oemAssignment', meta: { trackId: track.id } })
    }
    setOemAssignmentError('')
  }

  function syncTrackState(updated: OemTrack) {
    setOemTracks((previous) => sortOemTracks([...previous.filter((item) => item.id !== updated.id), updated]))
    setOemOptions((previous) => mergeOemOptions(previous, [updated]))
  }

  async function handleSubmitOemTrack(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setOemFormError('')

    if (!oemTrackForm.oem.trim() || !oemTrackForm.specialization.trim()) {
      setOemFormError('OEM name and specialization are required.')
      return
    }

    const requiredCerts = Math.max(0, Number.parseInt(oemTrackForm.requiredCerts, 10) || 0)
    const overallRequirement = Math.max(
      requiredCerts,
      Number.parseInt(oemTrackForm.overallRequirement, 10) || requiredCerts
    )

    const payload = {
      oem: oemTrackForm.oem.trim(),
      specialization: oemTrackForm.specialization.trim(),
      requiredCerts,
      overallRequirement,
      targetDate: oemTrackForm.targetDate ? oemTrackForm.targetDate : undefined,
      complianceStatus: oemTrackForm.complianceStatus,
      roadmapNotes: oemTrackForm.roadmapNotes.trim(),
    }

    try {
      const response = await fetch('/api/competency/oem/tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const detail = await response.json().catch(() => null)
        throw new Error(detail?.error ?? 'Unable to create OEM compliance track.')
      }
      const data = await response.json()
      const normalized = normalizeOemTrackPayload(data?.track ?? {})
      syncTrackState(normalized)
  setOemOptions((previous) => mergeOemOptions(previous, [normalized]))
      closeModal()
    } catch (error) {
      console.error('Failed to create OEM compliance track', error)
      setOemFormError(error instanceof Error ? error.message : 'Unable to create OEM compliance track.')
    }
  }

  async function handleSubmitOemAssignment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setOemAssignmentError('')

    const targetTrackId = modal.meta?.trackId || oemAssignmentForm.trackId
    if (!targetTrackId) {
      setOemAssignmentError('Unable to resolve the OEM compliance track.')
      return
    }

    if (!oemAssignmentForm.engineer.trim() || !oemAssignmentForm.certificationName.trim()) {
      setOemAssignmentError('Engineer and certification are required.')
      return
    }

    const payload = {
      engineer: oemAssignmentForm.engineer.trim(),
      engineerRole: oemAssignmentForm.engineerRole.trim(),
      certificationName: oemAssignmentForm.certificationName.trim(),
      status: oemAssignmentForm.status,
      startedAt: oemAssignmentForm.startedAt || undefined,
      completedAt: oemAssignmentForm.completedAt || undefined,
      dueAt: oemAssignmentForm.dueAt || undefined,
      certificationId: oemAssignmentForm.certificationId.trim() || undefined,
    }

    const assignmentId = modal.meta?.assignmentId
    const endpoint = assignmentId
      ? `/api/competency/oem/assignments/${assignmentId}`
      : `/api/competency/oem/tracks/${targetTrackId}/assignments`
    const method = assignmentId ? 'PATCH' : 'POST'

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const detail = await response.json().catch(() => null)
        throw new Error(detail?.error ?? 'Unable to save OEM assignment.')
      }
      const data = await response.json()
      const normalized = normalizeOemTrackPayload(data?.track ?? {})
      syncTrackState(normalized)
      closeModal()
    } catch (error) {
      console.error('Failed to save OEM compliance assignment', error)
      setOemAssignmentError(error instanceof Error ? error.message : 'Unable to save OEM assignment.')
    }
  }

  async function deleteOemTrack(id: string) {
    if (!id) return
    try {
      const response = await fetch(`/api/competency/oem/tracks/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        const detail = await response.json().catch(() => null)
        throw new Error(detail?.error ?? 'Unable to remove OEM compliance track.')
      }
      setOemTracks((previous) => previous.filter((item) => item.id !== id))
    } catch (error) {
      console.error('Failed to delete OEM compliance track', error)
      window.alert(error instanceof Error ? error.message : 'Unable to remove OEM compliance track.')
    }
  }

  async function deleteOemAssignment(trackId: string, assignmentId: string) {
    if (!trackId || !assignmentId) return
    try {
      const response = await fetch(`/api/competency/oem/assignments/${assignmentId}`, { method: 'DELETE' })
      if (!response.ok) {
        const detail = await response.json().catch(() => null)
        throw new Error(detail?.error ?? 'Unable to remove OEM assignment.')
      }
      const data = await response.json()
      const normalized = normalizeOemTrackPayload(data?.track ?? {})
      syncTrackState(normalized)
    } catch (error) {
      console.error('Failed to delete OEM assignment', error)
      window.alert(error instanceof Error ? error.message : 'Unable to remove OEM assignment.')
    }
  }

  async function handleSubmitTraining(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setTrainingFormError('')

    const employee = trainingForm.employee.trim()
    const vendor = trainingForm.vendor.trim()
    const moduleName = trainingForm.module.trim()

    if (!employee || !vendor || !moduleName) {
      setTrainingFormError('Engineer, vendor, and module are required.')
      return
    }

    const progressValue = Number.parseInt(trainingForm.progressPercent, 10)
    const progressPercent = Number.isFinite(progressValue)
      ? Math.min(100, Math.max(0, progressValue))
      : 0

    const payload = {
      employee,
      vendor,
      module: moduleName,
      domain: trainingForm.domain.trim(),
      progressPercent,
      timeline: trainingForm.timeline.trim(),
      status: trainingForm.status,
    }

    const trainingId = modal.meta?.trainingId
    const method = trainingId ? 'PATCH' : 'POST'
    const endpoint = trainingId
      ? `/api/competency/training/${trainingId}`
      : '/api/competency/training'

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const detail = await response.json().catch(() => null)
        throw new Error(detail?.error ?? 'Unable to save training plan.')
      }
      const data = await response.json()
      const normalized = normalizeTrainingPayload(data?.training ?? {})
      setTraining((previous) => {
        if (trainingId) {
          return sortTrainingRecords(
            previous.map((item) => (item.id === normalized.id ? normalized : item))
          )
        }
        return sortTrainingRecords([...previous, normalized])
      })
      closeModal()
    } catch (error) {
      console.error('Failed to save training plan', error)
      setTrainingFormError(error instanceof Error ? error.message : 'Unable to save training plan.')
    }
  }

  async function handleSubmitEnablementProgram(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setEnablementFormError('')

    const vendor = enablementForm.vendor.trim()
    const specialization = enablementForm.specialization.trim()

    if (!vendor || !specialization) {
      setEnablementFormError('Vendor and specialization are required.')
      return
    }

    const yearValue = Number.parseInt(enablementForm.activeYear, 10)
    if (!Number.isFinite(yearValue)) {
      setEnablementFormError('Enter a valid active year.')
      return
    }
    const activeYear = Math.max(2000, Math.min(9999, yearValue))

    const keywords = enablementForm.keywords
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0)

    const payload = {
      vendor,
      specialization,
      role: enablementForm.role,
      keywords,
      activeYear,
      notes: enablementForm.notes.trim(),
    }

    const programId = modal.meta?.enablementProgramId
    const method = programId ? 'PATCH' : 'POST'
    const endpoint = programId
      ? `/api/competency/enablement-programs/${programId}`
      : '/api/competency/enablement-programs'

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const detail = await response.json().catch(() => null)
        throw new Error(detail?.error ?? 'Unable to save enablement program.')
      }
      const data = await response.json()
      const normalized = normalizeEnablementProgramPayload(data?.program ?? {})
      setEnablementPrograms((previous) => {
        if (programId) {
          const replaced = previous.map((item) => (item.id === normalized.id ? normalized : item))
          return sortEnablementPrograms(replaced)
        }
        return sortEnablementPrograms([...previous, normalized])
      })
      setOemOptions((previous) => mergeOemVendorsFromPrograms(previous, [normalized]))
      closeModal()
    } catch (error) {
      console.error('Failed to save enablement program', error)
      setEnablementFormError(error instanceof Error ? error.message : 'Unable to save enablement program.')
    }
  }

  async function deleteEnablementProgram(id: string) {
    if (!id) return
    try {
      const response = await fetch(`/api/competency/enablement-programs/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        const detail = await response.json().catch(() => null)
        throw new Error(detail?.error ?? 'Unable to delete enablement program.')
      }
      setEnablementPrograms((previous) => previous.filter((item) => item.id !== id))
    } catch (error) {
      console.error('Failed to delete enablement program', error)
      window.alert(error instanceof Error ? error.message : 'Unable to delete enablement program.')
    }
  }

  async function deleteCertification(id: string) {
    const target = certifications.find((item) => item.id === id)
    if (!target) return

    try {
      const response = await fetch(`/api/competency/certifications/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        const detail = await response.json().catch(() => null)
        throw new Error(detail?.error ?? 'Unable to remove certification right now.')
      }

      const next = certifications.filter((item) => item.id !== id)
      setCertifications(next)
      setExpandedEngineers((previous) => {
        if (next.some((item) => item.employee === target.employee)) {
          return previous
        }
        return previous.filter((name) => name !== target.employee)
      })
      setAttachmentPreview((previous) => {
        if (previous && previous.url.endsWith(`${id}/attachment`)) {
          return null
        }
        return previous
      })
    } catch (error) {
      console.error('Failed to delete certification', error)
      window.alert(error instanceof Error ? error.message : 'Unable to remove certification right now.')
    }
  }

  async function deleteTrainingRecord(id: string) {
    if (!id) return
    try {
      const response = await fetch(`/api/competency/training/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        const detail = await response.json().catch(() => null)
        throw new Error(detail?.error ?? 'Unable to remove training plan.')
      }
      setTraining((prev) => prev.filter((item) => item.id !== id))
    } catch (error) {
      console.error('Failed to delete training plan', error)
      window.alert(error instanceof Error ? error.message : 'Unable to remove training plan.')
    }
  }

  const topVendorCopy = competencySignals.topVendor
    ? `Top vendor coverage: ${competencySignals.topVendor.vendor} holds ${competencySignals.topVendor.percent}% (${competencySignals.topVendor.count} certifications).`
    : 'Capture certifications to build vendor coverage insights.'

  const heroMetrics: Array<{
    label: string
    value: string
    detail: string
    accent: string
    navigate?: HeroNavigateTarget
  }> = [
    {
      label: 'Certified engineers',
      value: uniqueCertifiedEngineers.toString(),
      detail: competencySignals.topVendor
        ? `${competencySignals.topVendor.vendor} leads coverage`
        : 'Capture certifications to surface a leader',
      accent: 'from-sky-400 via-sky-500 to-cyan-300',
      navigate: { tab: 'certifications', elementId: 'certified-engineer-spread' },
    },
    {
      label: 'Active certifications',
      value: headerStats.totalCertifications.toString(),
      detail: `${vendorPercentages.length} vendors represented`,
      accent: 'from-amber-400 via-orange-500 to-amber-300',
      navigate: { tab: 'certifications', elementId: 'certification-overview' },
    },
    {
      label: 'Training completion',
      value: `${headerStats.completionRate}%`,
      detail:
        training.length === 0
          ? 'No enablement tracks added yet'
          : `${training.length} enablement track${training.length === 1 ? '' : 's'}`,
      accent: 'from-emerald-400 via-emerald-500 to-teal-300',
      navigate: { tab: 'training', elementId: 'engineer-training-progress' },
    },
    {
      label: 'Renewals (90d)',
      value: upcomingRenewals.length.toString(),
      detail:
        upcomingRenewals.length === 0
          ? 'No renewals in the next quarter'
          : 'Expiring certifications flagged',
      accent: 'from-rose-400 via-rose-500 to-orange-300',
      navigate: { tab: 'certifications', elementId: 'upcoming-renewals' },
    },
    {
      label: 'OEM tracks',
      value: oemTracks.length.toString(),
      detail:
        oemTracks.length === 0
          ? 'No compliance plans captured'
          : competencySignals.highEffortPlans === 0
            ? 'All compliance plans on track'
            : `${competencySignals.highEffortPlans} gap${competencySignals.highEffortPlans === 1 ? '' : 's'} need action`,
      accent: 'from-purple-400 via-indigo-500 to-blue-400',
  navigate: { tab: 'oem', elementId: 'oem-compliance-coverage' },
    },
    {
      label: 'Avg load / engineer',
      value: competencySignals.avgLoad.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 }),
      detail: 'Certifications carried per specialist',
      accent: 'from-slate-300 via-sky-500 to-slate-200',
      navigate: { tab: 'certifications', elementId: 'coverage-signals' },
    },
  ]

  const heroHighlights = [
    `${headerStats.totalCertifications} active certifications tracked across ${vendorPercentages.length} vendor${vendorPercentages.length === 1 ? '' : 's'}.`,
    `Enablement completion sits at ${headerStats.completionRate}% across ${training.length || 0} training track${training.length === 1 ? '' : 's'}, with an average load of ${competencySignals.avgLoad} certification${competencySignals.avgLoad === 1 ? '' : 's'} per engineer.`,
    `${upcomingRenewals.length} renewal${upcomingRenewals.length === 1 ? '' : 's'} due in the next 90 days and ${competencySignals.highEffortPlans === 0 ? 'no OEM compliance gaps flagged.' : `${competencySignals.highEffortPlans} OEM gap${competencySignals.highEffortPlans === 1 ? ' is' : 's are'} awaiting remediation.`}`,
  ]

  function handleHeroMetricView(target?: HeroNavigateTarget) {
    if (!target || typeof window === 'undefined') return
    setPendingHeroScroll({ ...target, attempts: 0 })
    if (target.tab && target.tab !== activeTab) {
      setActiveTab(target.tab)
    }
  }

  useEffect(() => {
    if (!pendingHeroScroll) return
    if (pendingHeroScroll.tab && pendingHeroScroll.tab !== activeTab) {
      return
    }

    if (!pendingHeroScroll.elementId) {
      setPendingHeroScroll(null)
      return
    }

    const element = document.getElementById(pendingHeroScroll.elementId)
    if (element) {
      window.requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect()
        const targetTop = window.scrollY + rect.top - HERO_SCROLL_OFFSET
        window.scrollTo({ top: Math.max(targetTop, 0), behavior: 'smooth' })
      })
      setPendingHeroScroll(null)
      return
    }

    if ((pendingHeroScroll.attempts ?? 0) >= HERO_SCROLL_MAX_ATTEMPTS) {
      setPendingHeroScroll(null)
      return
    }

    const timeout = window.setTimeout(() => {
      setPendingHeroScroll((current) =>
        current
          ? { ...current, attempts: (current.attempts ?? 0) + 1 }
          : null
      )
    }, 100)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [pendingHeroScroll, activeTab])

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-8 py-9 text-slate-100 shadow-2xl">
        <div className="pointer-events-none absolute -left-12 top-0 h-64 w-64 rounded-full bg-sky-500/30 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute right-4 top-16 h-48 w-48 rounded-full bg-emerald-400/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute bottom-0 right-[-10%] h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" aria-hidden />
        <div className="relative flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-2xl space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-300">Competency coverage</p>
            <h1 className="text-3xl font-bold text-white">Certifications &amp; Enablement Trainings</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-200/80">
              Monitor certification velocity, OEM accountability, and enablement activity in one workspace.
            </p>
            <ul className="mt-4 space-y-3 text-sm text-slate-100/80">
              {heroHighlights.map((highlight, index) => (
                <li key={`highlight-${index}`} className="flex items-start gap-3">
                  <span aria-hidden className="mt-1 h-2 w-2 rounded-full bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-500" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid w-full gap-4 sm:grid-cols-2 xl:w-auto xl:grid-cols-3">
            {heroMetrics.map((metric) => (
              <button
                key={metric.label}
                type="button"
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-5 py-5 text-left text-sm text-slate-100 shadow-lg transition hover:scale-[1.01] hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60 backdrop-blur"
                onClick={() => handleHeroMetricView(metric.navigate)}
              >
                <span className={`pointer-events-none absolute left-4 right-4 top-0 block h-1 rounded-full bg-gradient-to-r ${metric.accent}`} aria-hidden />
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-200/70">{metric.label}</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{metric.value}</p>
                  </div>
                  <p className="text-xs text-slate-200/80">{metric.detail}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
  <article
    id="certification-overview"
    className="rounded-3xl border border-slate-200 bg-white p-6 shadow scroll-mt-32"
  >
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
              <svg
                width={chartWidth}
                height={chartHeight}
                className="max-w-full"
                onMouseLeave={() => setHighlightedTrendVendor(null)}
              >
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
                  const color = vendorLineColor(series.vendor)
                  const isActive = !highlightedTrendVendor || highlightedTrendVendor === series.vendor
                  const strokeOpacity = highlightedTrendVendor ? (isActive ? 1 : 0.2) : 1
                  const strokeWidth = isActive ? 3 : 2
                  const pathData = series.history
                    .map((point, index) => {
                      const x = xScale(index)
                      const y = yScale(point.count)
                      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
                    })
                    .join(' ')
                  return (
                    <g
                      key={series.vendor}
                      fill="none"
                      stroke={color}
                      strokeOpacity={strokeOpacity}
                      style={{ cursor: 'pointer' }}
                      tabIndex={0}
                      role="button"
                      aria-label={`Highlight ${series.vendor} trend`}
                      onMouseEnter={() => setHighlightedTrendVendor(series.vendor)}
                      onFocus={() => setHighlightedTrendVendor(series.vendor)}
                      onMouseLeave={() =>
                        setHighlightedTrendVendor((current) =>
                          current === series.vendor ? null : current
                        )
                      }
                      onBlur={() =>
                        setHighlightedTrendVendor((current) =>
                          current === series.vendor ? null : current
                        )
                      }
                    >
                      <path d={pathData} strokeWidth={strokeWidth} strokeLinecap="round">
                        <title>
                          {`${series.vendor}: ${series.history
                            .map((point) => `${point.year} ${point.count}`)
                            .join(', ')}`}
                        </title>
                      </path>
                      {series.history.map((point, index) => {
                        const x = xScale(index)
                        const y = yScale(point.count)
                        return (
                          <circle
                            key={`${series.vendor}-${point.year}`}
                            cx={x}
                            cy={y}
                            r={isActive ? 4 : 3}
                            fill="#fff"
                            stroke={color}
                            strokeWidth={isActive ? 2.5 : 1.5}
                          >
                            <title>{`${series.vendor} ${point.year}: ${point.count} cert${point.count === 1 ? '' : 's'}`}</title>
                          </circle>
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
            {vendorTrend.series.map((series) => {
              const color = vendorLineColor(series.vendor)
              const isActive = !highlightedTrendVendor || highlightedTrendVendor === series.vendor
              return (
                <button
                  key={`legend-${series.vendor}`}
                  type="button"
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 ${
                    isActive
                      ? 'border-slate-200 bg-slate-50 text-slate-700'
                      : 'border-slate-200 bg-white text-slate-400'
                  }`}
                  onMouseEnter={() => setHighlightedTrendVendor(series.vendor)}
                  onFocus={() => setHighlightedTrendVendor(series.vendor)}
                  onMouseLeave={() =>
                    setHighlightedTrendVendor((current) =>
                      current === series.vendor ? null : current
                    )
                  }
                  onBlur={() =>
                    setHighlightedTrendVendor((current) =>
                      current === series.vendor ? null : current
                    )
                  }
                  aria-pressed={isActive}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-medium">{series.vendor}</span>
                </button>
              )
            })}
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
            {engineerSummary.length > 0 ? (
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Top certification holders
                </p>
                <ul className="mt-2 space-y-2 text-sm text-slate-600">
                  {engineerSummary.slice(0, 4).map((item) => (
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
          <article
            id="oem-overview"
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow scroll-mt-32"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Engineer certifications</h2>
                <p className="text-sm text-slate-500">Live roster of credentials with expiration windows.</p>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700"
                onClick={openCertificationModal}
              >
                <span aria-hidden>＋</span>
                Add certification
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] xl:gap-6">
              <div
                id="certified-engineer-spread"
                className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm scroll-mt-32"
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-sm">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Vendor coverage</p>
                    <h3 className="text-base font-semibold text-slate-900">Certified engineer spread</h3>
                    <p className="text-sm text-slate-500">Engineers with active certifications per vendor.</p>
                  </div>
                  {vendorEngineerSegments.length > 0 ? (
                    <div className="relative mx-auto flex h-[180px] w-[180px] items-center justify-center">
                      <svg
                        width={CERT_SPREAD_CHART_SIZE}
                        height={CERT_SPREAD_CHART_SIZE}
                        viewBox={`0 0 ${CERT_SPREAD_CHART_SIZE} ${CERT_SPREAD_CHART_SIZE}`}
                        onMouseLeave={() => setHoveredVendor(null)}
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
                          {vendorEngineerSegments.map((segment) => {
                            const isActive = !hoveredVendor || hoveredVendor === segment.vendor
                            const strokeOpacity = hoveredVendor ? (isActive ? 1 : 0.35) : 1
                            const strokeWidth = isActive ? CERT_SPREAD_STROKE_WIDTH + 1 : CERT_SPREAD_STROKE_WIDTH
                            return (
                              <circle
                                key={segment.vendor}
                                cx={CERT_SPREAD_CHART_SIZE / 2}
                                cy={CERT_SPREAD_CHART_SIZE / 2}
                                r={CERT_SPREAD_CHART_RADIUS}
                                stroke={vendorPieColor(segment.vendor)}
                                strokeWidth={strokeWidth}
                                strokeLinecap="round"
                                strokeOpacity={strokeOpacity}
                                fill="transparent"
                                strokeDasharray={`${segment.share * CERT_SPREAD_CIRCUMFERENCE} ${CERT_SPREAD_CIRCUMFERENCE}`}
                                strokeDashoffset={-segment.offset * CERT_SPREAD_CIRCUMFERENCE}
                                tabIndex={0}
                                onMouseEnter={() => setHoveredVendor(segment.vendor)}
                                onFocus={() => setHoveredVendor(segment.vendor)}
                                onMouseLeave={() => setHoveredVendor((current) =>
                                  current === segment.vendor ? null : current
                                )}
                                onBlur={() =>
                                  setHoveredVendor((current) =>
                                    current === segment.vendor ? null : current
                                  )
                                }
                                style={{ cursor: 'pointer' }}
                              >
                                <title>
                                  {`${segment.vendor}: ${segment.engineerCount} engineer${
                                    segment.engineerCount === 1 ? '' : 's'
                                  } • ${segment.certificationCount} cert${
                                    segment.certificationCount === 1 ? '' : 's'
                                  }`}
                                </title>
                              </circle>
                            )
                          })}
                        </g>
                      </svg>
                      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-3xl font-semibold text-slate-900">{vendorCoverageHeadline.value}</span>
                        <span className="text-xs uppercase tracking-widest text-slate-500">
                          {vendorCoverageHeadline.label}
                        </span>
                        <span className="text-[11px] text-slate-400">{vendorCoverageHeadline.detail}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4 text-sm text-slate-500">
                      No certification coverage yet.
                    </div>
                  )}
                </div>
                {vendorEngineerSegments.length > 0 ? (
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                    {vendorEngineerSegments.map((segment) => (
                      <button
                        key={`${segment.vendor}-spread`}
                        type="button"
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50/80 px-3 py-1 shadow-sm transition hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
                        onMouseEnter={() => setHoveredVendor(segment.vendor)}
                        onFocus={() => setHoveredVendor(segment.vendor)}
                        onMouseLeave={() => setHoveredVendor((current) =>
                          current === segment.vendor ? null : current
                        )}
                        onBlur={() =>
                          setHoveredVendor((current) =>
                            current === segment.vendor ? null : current
                          )
                        }
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: vendorPieColor(segment.vendor) }}
                        />
                        <span className="font-medium text-slate-700">{shortVendorLabel(segment.vendor)}</span>
                        <span className="text-xs text-slate-500">{segment.engineerCount} engineers</span>
                        <span className="text-[11px] font-medium text-slate-400">{segment.certificationCount} cert</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Certification breakdown</p>
                    <h3 className="text-base font-semibold text-slate-900">All engineers</h3>
                    <p className="text-sm text-slate-500">Vendor, domain, and renewal context for every credential.</p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {certificationBreakdown.length} engineer{certificationBreakdown.length === 1 ? '' : 's'}
                  </span>
                </div>
                {certificationBreakdown.length > 0 ? (
                  <ul className="mt-5 space-y-3">
                    {certificationBreakdown.map((group) => {
                      const isExpanded = expandedEngineers.includes(group.employee)
                      const engineerKey = group.employee || 'Unassigned'
                      const panelId = `cert-panel-${engineerKey
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-') || 'unassigned'}`
                      return (
                        <li key={group.employee} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 shadow-sm">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{group.employee}</p>
                              <p className="text-xs text-slate-500">{group.role || 'Role not specified'}</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                                {group.total} cert{group.total === 1 ? '' : 's'}
                              </span>
                              <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
                                onClick={() => toggleEngineerView(group.employee)}
                                aria-expanded={isExpanded}
                                aria-controls={panelId}
                              >
                                {isExpanded ? 'Hide details' : 'View details'}
                              </button>
                            </div>
                          </div>
                          {isExpanded ? (
                            <div id={panelId} className="mt-4 space-y-3">
                              {group.certifications.length > 0 ? (
                                group.certifications.map((item) => {
                                  const attachmentUrl = item.attachmentUrl
                                  return (
                                    <div key={item.id} className="rounded-xl border border-white/60 bg-white px-4 py-3 shadow-sm">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                      <div>
                                        <p className="text-sm font-semibold text-slate-900">{item.certification}</p>
                                        <p className="text-xs text-slate-500">{shortVendorLabel(item.vendor)} · {item.domain}</p>
                                        <p className="mt-2 text-xs text-slate-500">
                                          Earned {item.year} · Expires {formatMonthLabel(item.expires)}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">Detail: {item.statusDetail}</p>
                                      </div>
                                      <div className="flex flex-col items-start gap-2 sm:items-end">
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(item.status)}`}>
                                          {item.status}
                                        </span>
                                        {attachmentUrl ? (
                                          <div className="flex flex-col items-start gap-1 sm:items-end">
                                            <button
                                              type="button"
                                              className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-100"
                                              onClick={() =>
                                                openAttachmentPreview({
                                                  url: attachmentUrl,
                                                  name: item.attachmentName,
                                                  type: item.attachmentType,
                                                })
                                              }
                                            >
                                              View attachment
                                            </button>
                                            {item.attachmentName ? (
                                              <span className="text-[11px] text-slate-400">{item.attachmentName}</span>
                                            ) : null}
                                          </div>
                                        ) : (
                                          <span className="text-xs text-slate-400">No attachment uploaded</span>
                                        )}
                                        <button
                                          type="button"
                                          className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-200"
                                          onClick={() => deleteCertification(item.id)}
                                        >
                                          Remove
                                        </button>
                                      </div>
                                    </div>
                                    </div>
                                  )
                                })
                              ) : (
                                <p className="text-xs text-slate-500">No certifications recorded.</p>
                              )}
                            </div>
                          ) : null}
                        </li>
                      )
                    })}
                  </ul>
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
                  {certifications.map((item) => {
                    const attachmentUrl = item.attachmentUrl ?? ''
                    const hasAttachment = Boolean(item.attachmentUrl)
                    return (
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
                          <div className="flex flex-wrap items-center gap-2">
                            {hasAttachment ? (
                              <button
                                type="button"
                                className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-100"
                                onClick={() =>
                                  openAttachmentPreview({
                                    url: attachmentUrl,
                                    name: item.attachmentName,
                                    type: item.attachmentType,
                                  })
                                }
                              >
                                View
                              </button>
                            ) : null}
                            <button
                              type="button"
                              className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-200"
                              onClick={() => deleteCertification(item.id)}
                            >
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </article>

          <div className="grid gap-6 md:grid-cols-2">
            <article
              id="upcoming-renewals"
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow scroll-mt-32"
            >
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

            <article
              id="training-overview"
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow scroll-mt-32"
            >
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

          <article
            id="coverage-signals"
            className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-950 to-[#03070f] px-6 py-7 text-sm text-slate-200 shadow scroll-mt-32"
          >
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
          <article
            id="oem-compliance-coverage"
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow scroll-mt-32"
          >
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
                onClick={openOemTrackModal}
              >
                <span aria-hidden>＋</span>
                Add OEM compliance
              </button>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-3 text-left">OEM</th>
                    <th className="px-6 py-3 text-left">Specialization</th>
                    <th className="px-6 py-3 text-left">Team requirement</th>
                    <th className="px-6 py-3 text-left">Team earned</th>
                    <th className="px-6 py-3 text-left">Target date</th>
                    <th className="px-6 py-3 text-left">Assignments</th>
                    <th className="px-6 py-3 text-left">Compliance status</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {oemTracks.map((track) => (
                    <tr key={track.id} className="hover:bg-slate-50/70">
                      <td className="px-6 py-4 font-medium text-slate-900">{track.oem}</td>
                      <td className="px-6 py-4">{track.specialization}</td>
                      <td className="px-6 py-4">{track.overallRequirement}</td>
                      <td className="px-6 py-4">{track.overallEarned}</td>
                      <td className="px-6 py-4">{formatDateLabel(track.targetDate)}</td>
                      <td className="px-6 py-4">{track.assignments.length}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${complianceBadgeClass(track.complianceStatus)}`}>
                          {track.complianceStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-400 hover:text-slate-900"
                            onClick={() => openOemAssignmentModal(track)}
                          >
                            Add engineer
                          </button>
                          <button
                            type="button"
                            className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-200"
                            onClick={() => deleteOemTrack(track.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">OEM compliance roadmap</h2>
                <p className="text-sm text-slate-500">Deep dive into vendor specializations, engineer ownership, and certification timelines.</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {oemTracks.length} track{oemTracks.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="space-y-5">
              {oemTracks.map((track) => {
                const engineerGroups = groupAssignmentsByEngineer(track.assignments)

                return (
                  <div key={track.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{track.oem}</p>
                        <h3 className="text-lg font-semibold text-slate-900">{track.specialization || 'General specialization'}</h3>
                        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                          <span>Required certs: {track.requiredCerts}</span>
                          <span>Team requirement: {track.overallRequirement}</span>
                          <span>Earned: {track.overallEarned}</span>
                        </div>
                        {track.roadmapNotes ? (
                          <p className="text-sm text-slate-600">{track.roadmapNotes}</p>
                        ) : null}
                      </div>
                      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                        <div className="text-sm text-slate-500">
                          <p className="font-semibold text-slate-700">Target date</p>
                          <p>{formatDateLabel(track.targetDate)}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${complianceBadgeClass(track.complianceStatus)}`}>
                          {track.complianceStatus}
                        </span>
                        <button
                          type="button"
                          className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-400 hover:text-slate-900"
                          onClick={() => openOemAssignmentModal(track)}
                        >
                          Add engineer
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 space-y-4">
                      {engineerGroups.map((group) => (
                        <div key={group.engineer} className="rounded-2xl border border-slate-200 bg-white p-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{group.engineer}</p>
                              {group.engineerRole ? (
                                <p className="text-xs text-slate-500">{group.engineerRole}</p>
                              ) : null}
                            </div>
                            <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                              <span>Required certs: {group.requiredCount}</span>
                              <span>Earned: {group.earnedCount}</span>
                            </div>
                          </div>

                          <div className="mt-4 space-y-3">
                            {group.assignments.map((assignment) => {
                              const timeline = describeAssignmentTimeline(assignment)
                              return (
                                <div key={assignment.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                                  <div className="space-y-2">
                                    <p className="text-sm font-semibold text-slate-900">{assignment.certificationName}</p>
                                    <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                                      {assignment.startedAt ? (
                                        <span>Start: {formatDateLabel(assignment.startedAt)}</span>
                                      ) : null}
                                      {assignment.completedAt ? (
                                        <span>Completed: {formatDateLabel(assignment.completedAt)}</span>
                                      ) : null}
                                      {assignment.dueAt ? (
                                        <span>Due: {formatDateLabel(assignment.dueAt)}</span>
                                      ) : null}
                                    </div>
                                  </div>
                                  <div className="flex flex-col gap-2 sm:items-end">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${assignmentStatusBadgeClass(assignment.status)}`}>
                                        {assignment.status}
                                      </span>
                                      {assignment.status === 'Earned' && assignment.attachmentUrl ? (
                                        <button
                                          type="button"
                                          className="text-xs font-semibold text-sky-600 hover:text-sky-700"
                                          onClick={() =>
                                            openAttachmentPreview({
                                              url: assignment.attachmentUrl!,
                                              name: assignment.attachmentName ?? assignment.certificationName,
                                              type: assignment.attachmentType,
                                            })
                                          }
                                        >
                                          View attachment
                                        </button>
                                      ) : null}
                                    </div>
                                    <p className={`text-xs font-medium ${timelineToneClass(timeline.tone)}`}>
                                      {timeline.label}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      <button
                                        type="button"
                                        className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-400 hover:text-slate-900"
                                        onClick={() => openOemAssignmentModal(track, assignment)}
                                      >
                                        Edit
                                      </button>
                                      <button
                                        type="button"
                                        className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-200"
                                        onClick={() => deleteOemAssignment(track.id, assignment.id)}
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                            {group.assignments.length === 0 ? (
                              <p className="text-xs text-slate-500">No certifications assigned yet.</p>
                            ) : null}
                          </div>
                        </div>
                      ))}

                      {track.assignments.length === 0 ? (
                        <p className="text-sm text-slate-500">No engineers assigned to this specialization yet.</p>
                      ) : null}
                    </div>
                  </div>
                )
              })}

              {oemTracks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                  Add OEM compliance tracks to build a vendor-by-vendor roadmap.
                </div>
              ) : null}
            </div>
          </article>
        </section>
      ) : null}

      {activeTab === 'training' ? (
        <section className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <article
              id="engineer-training-progress"
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow scroll-mt-32"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Engineer training progress</h2>
                  <p className="text-sm text-slate-500">Track course velocity and domain coverage.</p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700"
                  onClick={openTrainingModal}
                >
                  <span aria-hidden>＋</span>
                  Add training
                </button>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="min-w-[860px] divide-y divide-slate-200 text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-6 py-3 text-left">Name</th>
                        <th className="px-6 py-3 text-left">Vendor</th>
                        <th className="px-6 py-3 text-left">Module</th>
                        <th className="px-6 py-3 text-left">Domain</th>
                        <th className="px-6 py-3 text-left">Progress</th>
                        <th className="px-6 py-3 text-left">Timeline</th>
                        <th className="px-6 py-3 text-left">Status</th>
                        <th className="px-6 py-3 text-right">Actions</th>
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
                          <td className="px-6 py-4 text-right align-middle whitespace-nowrap">
                            <div className="inline-flex items-center justify-end gap-2">
                              <button
                                type="button"
                                className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-300"
                                onClick={() => openTrainingEditModal(item)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-200"
                                onClick={() => {
                                  void deleteTrainingRecord(item.id)
                                }}
                              >
                                Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </article>

            <aside className="space-y-6">
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow">
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-slate-900">OEM Compliance Training coverage</h3>
                  <p className="text-sm text-slate-500">Distribution of training statuses synced with completion insights.</p>
                </div>
                {trainingCoverage.total > 0 ? (
                  <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative h-28 w-28 rounded-full" style={{ background: trainingCoverage.gradient }}>
                      <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-white text-center">
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Complete</span>
                        <span className="text-lg font-semibold text-slate-900">{trainingCoverage.completionRate}%</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-3 self-stretch">
                      {trainingCoverage.segments.map((segment) => (
                        <div key={segment.key} className="flex items-center justify-between gap-3 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: segment.color }} />
                            <span>{segment.label}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="font-semibold text-slate-900">{segment.value}</span>
                            <span className="text-slate-500">{segment.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="mt-5 text-sm text-slate-500">Capture training plans to see coverage by status.</p>
                )}
              </article>
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
                <h3 className="text-base font-semibold text-slate-900">Training completion insights</h3>
                <div className="mt-5 space-y-4 text-sm text-slate-600">
                  <div>
                    <div className="flex items-center justify-between">
                      <span>Overall completion</span>
                      <span>{headerStats.completionRate}%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${headerStats.completionRate}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span>Average progress</span>
                      <span>{trainingCompletionSummary.averageProgress}%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-sky-500"
                        style={{ width: `${trainingCompletionSummary.averageProgress}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span>Completed tracks</span>
                      <span>
                        {trainingCompletionSummary.completed} / {trainingCompletionSummary.total}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {trainingCompletionSummary.inProgress} in progress · {trainingCompletionSummary.notStarted}{' '}
                      not started
                    </p>
                  </div>
                </div>
              </article>
            </aside>
          </div>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Enablement training roadmap</h3>
                <p className="text-sm text-slate-500">Annual OEM partner enablement coverage by specialization and role.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {totalEnablementRecords} tracked record{totalEnablementRecords === 1 ? '' : 's'}
                </span>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 hover:border-slate-400 hover:text-slate-900"
                  onClick={openEnablementProgramModal}
                >
                  Add program
                </button>
              </div>
            </div>
            <div className="mt-6 space-y-5">
              {enablementCoverage.map((track) => {
                const freshnessBadge = track.needsRefresh
                  ? {
                      tone: 'warning' as const,
                      label: `Refresh ${track.refreshYear ?? currentReportingYear}`,
                      className: 'bg-amber-100 text-amber-700',
                    }
                  : {
                      tone: 'success' as const,
                      label: 'Current year ready',
                      className: 'bg-emerald-100 text-emerald-700',
                    }

                return (
                  <div
                    key={`${track.vendor}-${track.specialization}`}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{track.vendor} · {track.specialization}</p>
                        <p className="text-xs text-slate-500">
                          {track.total > 0
                            ? `Coverage ${track.coverage}% across ${track.total} track${track.total === 1 ? '' : 's'}`
                            : 'No enablement records captured yet.'}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${freshnessBadge.className}`}>
                        {freshnessBadge.label}
                      </span>
                    </div>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      {track.categories.map((category) => {
                        const sourceProgram = enablementProgramMap.get(category.programId)
                        return (
                          <div key={category.category} className="rounded-xl border border-slate-200 bg-white p-4">
                            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
                              <span>{category.category}</span>
                              <span>{category.coverage}%</span>
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                              <button
                                type="button"
                                className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-600 hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                                onClick={() => sourceProgram && openEnablementEditModal(sourceProgram)}
                                disabled={!sourceProgram}
                              >
                                Edit program
                              </button>
                              <button
                                type="button"
                                className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold text-rose-600 hover:border-rose-200 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                                onClick={() => {
                                  if (!sourceProgram) return
                                  if (typeof window !== 'undefined' && window.confirm('Remove this enablement program?')) {
                                    deleteEnablementProgram(sourceProgram.id)
                                  }
                                }}
                                disabled={!sourceProgram}
                              >
                                Remove
                              </button>
                            </div>
                            <div className="mt-3 h-2 rounded-full bg-slate-200">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  backgroundColor: ENABLEMENT_ROLE_COLORS[category.category],
                                  width: `${category.coverage}%`,
                                }}
                              />
                            </div>
                            {category.total === 0 ? (
                              <p className="mt-3 text-xs text-slate-500">
                                Log {category.category.toLowerCase()} curriculum for this specialization.
                              </p>
                            ) : category.outstanding.length > 0 ? (
                              <p className="mt-3 text-xs text-slate-500">
                                Focus: {category.outstanding
                                  .map((item) => `${item.employee} — ${item.module} (${item.progress}%)`)
                                  .join('; ')}
                              </p>
                            ) : (
                              <p className="mt-3 text-xs font-semibold text-emerald-600">Fully compliant</p>
                            )}
                            {sourceProgram ? (
                              <p className="mt-2 text-xs text-slate-500">
                                Active {sourceProgram.activeYear}{' '}
                                {sourceProgram.keywords.length > 0
                                  ? `· ${sourceProgram.keywords.join(', ')}`
                                  : ''}
                              </p>
                            ) : null}
                            {category.needsRefresh ? (
                              <p className="mt-2 text-xs text-amber-600">
                                Update with {category.refreshYear ?? currentReportingYear} curriculum.
                              </p>
                            ) : null}
                            {sourceProgram?.notes ? (
                              <p className="mt-2 text-xs text-slate-400">{sourceProgram.notes}</p>
                            ) : null}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
              {enablementCoverage.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                  No enablement programs configured yet. Add a program to start tracking coverage.
                </div>
              ) : null}
            </div>
          </article>

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
        <div className="fixed inset-0 z-40 overflow-y-auto bg-slate-900/50">
          <div className="flex min-h-full items-center justify-center px-4 py-8 sm:py-12">
            <div className="relative w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Add record</p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">
                  {modal.type === 'certifications' && 'Add certification'}
                  {modal.type === 'oemTrack' && 'Add OEM compliance track'}
                  {modal.type === 'oemAssignment' && (modal.meta?.assignmentId ? 'Update OEM assignment' : 'Add OEM assignment')}
                  {modal.type === 'training' && 'Add training'}
                  {modal.type === 'enablementProgram' && (modal.meta?.enablementProgramId ? 'Update enablement program' : 'Add enablement program')}
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
                      Engineer
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
                      onChange={handleVendorSelectChange}
                    >
                      {vendorOptions.map((vendor) => (
                        <option key={vendor} value={vendor}>
                          {vendor}
                        </option>
                      ))}
                    </select>
                    {certificationForm.vendor === 'Others' ? (
                      <div className="mt-3 space-y-3 rounded-2xl border border-dashed border-slate-300 p-3">
                        <div>
                          <label className="text-sm font-medium text-slate-700" htmlFor="cert-custom-vendor">
                            Custom vendor name
                          </label>
                          <input
                            id="cert-custom-vendor"
                            className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm"
                            value={customVendorName}
                            onChange={(event) => setCustomVendorName(event.target.value)}
                            placeholder="Enter vendor you want to track"
                          />
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs text-slate-500">Saved vendors will appear in the dropdown next time.</p>
                          <button
                            type="button"
                            className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white hover:bg-slate-700"
                            onClick={handleAddCustomVendor}
                          >
                            Save vendor
                          </button>
                        </div>
                        {customVendorError ? (
                          <p className="text-xs text-rose-500">{customVendorError}</p>
                        ) : null}
                      </div>
                    ) : null}
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
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                      value={certificationForm.expires}
                      onChange={(event) =>
                        setCertificationForm((prev) => ({ ...prev, expires: event.target.value }))
                      }
                      disabled={certificationForm.notExpiring}
                      required={!certificationForm.notExpiring}
                    />
                    <label className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-600" htmlFor="cert-not-expiring">
                      <input
                        id="cert-not-expiring"
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                        checked={certificationForm.notExpiring}
                        onChange={handleNotExpiringToggle}
                      />
                      Mark as not expiring / lifetime credential
                    </label>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="cert-status">
                      Status
                    </label>
                    <select
                      id="cert-status"
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                      value={certificationForm.status}
                      onChange={(event) => setCertificationForm((prev) => ({ ...prev, status: event.target.value as CertificationRecord['status'] }))}
                      disabled={certificationForm.notExpiring}
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
                <div>
                  <label className="text-sm font-medium text-slate-700" htmlFor="cert-attachment">
                    Certificate attachment
                  </label>
                  <input
                    key={attachmentInputKey}
                    id="cert-attachment"
                    type="file"
                    accept=".pdf,image/*"
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-slate-900 file:px-4 file:py-1.5 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-700"
                    onChange={handleCertificationAttachmentChange}
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Upload a PDF or image (PNG, JPG, GIF, or WEBP) so reviewers can verify the credential.
                  </p>
                  {certificationForm.attachment ? (
                    <p className="mt-1 text-xs text-emerald-600">Selected: {certificationForm.attachment.name}</p>
                  ) : null}
                  {certificationAttachmentError ? (
                    <p className="mt-1 text-xs text-rose-500">{certificationAttachmentError}</p>
                  ) : null}
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

            {modal.type === 'oemTrack' ? (
              <form className="mt-6 space-y-4" onSubmit={handleSubmitOemTrack}>
                {oemFormError ? (
                  <p className="rounded-2xl bg-rose-50 px-4 py-2 text-sm text-rose-600">{oemFormError}</p>
                ) : null}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="oem-track-name">OEM</label>
                    <select
                      id="oem-track-name"
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm"
                      value={oemTrackForm.oem}
                      onChange={handleOemSelectChange}
                    >
                      {oemOptions.map((vendor) => (
                        <option key={vendor} value={vendor}>
                          {vendor}
                        </option>
                      ))}
                    </select>
                    {oemTrackForm.oem === 'Others' ? (
                      <div className="mt-3 space-y-3 rounded-2xl border border-dashed border-slate-300 p-3">
                        <div>
                          <label className="text-sm font-medium text-slate-700" htmlFor="oem-custom-name">
                            Custom OEM name
                          </label>
                          <input
                            id="oem-custom-name"
                            className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm"
                            value={customOemName}
                            onChange={(event) => setCustomOemName(event.target.value)}
                            placeholder="Enter OEM you want to track"
                          />
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs text-slate-500">Saved OEMs will appear in the dropdown next time.</p>
                          <button
                            type="button"
                            className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white hover:bg-slate-700"
                            onClick={handleAddCustomOem}
                          >
                            Save OEM
                          </button>
                        </div>
                        {customOemError ? <p className="text-xs text-rose-500">{customOemError}</p> : null}
                      </div>
                    ) : null}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="oem-track-specialization">Specialization</label>
                    <input
                      id="oem-track-specialization"
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm"
                      value={oemTrackForm.specialization}
                      onChange={(event) => setOemTrackForm((prev) => ({ ...prev, specialization: event.target.value }))}
                      placeholder="e.g. Storage Deployment"
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="oem-track-required">Required certs</label>
                    <input
                      id="oem-track-required"
                      type="number"
                      min={0}
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm"
                      value={oemTrackForm.requiredCerts}
                      onChange={(event) => setOemTrackForm((prev) => ({ ...prev, requiredCerts: event.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="oem-track-overall">Team requirement</label>
                    <input
                      id="oem-track-overall"
                      type="number"
                      min={0}
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm"
                      value={oemTrackForm.overallRequirement}
                      onChange={(event) => setOemTrackForm((prev) => ({ ...prev, overallRequirement: event.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="oem-track-target">Target date</label>
                    <input
                      id="oem-track-target"
                      type="date"
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm"
                      value={oemTrackForm.targetDate}
                      onChange={(event) => setOemTrackForm((prev) => ({ ...prev, targetDate: event.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="oem-track-status">Compliance status</label>
                    <select
                      id="oem-track-status"
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm"
                      value={oemTrackForm.complianceStatus}
                      onChange={(event) => setOemTrackForm((prev) => ({ ...prev, complianceStatus: event.target.value as OemTrack['complianceStatus'] }))}
                    >
                      {OEM_TRACK_STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700" htmlFor="oem-track-notes">Roadmap notes</label>
                  <textarea
                    id="oem-track-notes"
                    rows={3}
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm"
                    value={oemTrackForm.roadmapNotes}
                    onChange={(event) => setOemTrackForm((prev) => ({ ...prev, roadmapNotes: event.target.value }))}
                    placeholder="Highlight priorities, renewal windows, or staffing considerations."
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-sky-700"
                  >
                    Save OEM compliance track
                  </button>
                </div>
              </form>
            ) : null}

            {modal.type === 'oemAssignment' ? (
              <form className="mt-6 space-y-4" onSubmit={handleSubmitOemAssignment}>
                {oemAssignmentError ? (
                  <p className="rounded-2xl bg-rose-50 px-4 py-2 text-sm text-rose-600">{oemAssignmentError}</p>
                ) : null}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <p className="font-semibold text-slate-800">
                    {oemTracks.find((track) => track.id === (modal.meta?.trackId ?? oemAssignmentForm.trackId))?.oem ?? 'OEM track'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {oemTracks.find((track) => track.id === (modal.meta?.trackId ?? oemAssignmentForm.trackId))?.specialization ?? 'Specialization pending'}
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="oem-assignment-engineer">Engineer</label>
                    <input
                      id="oem-assignment-engineer"
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm"
                      value={oemAssignmentForm.engineer}
                      onChange={(event) => setOemAssignmentForm((prev) => ({ ...prev, engineer: event.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="oem-assignment-role">Role</label>
                    <input
                      id="oem-assignment-role"
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm"
                      value={oemAssignmentForm.engineerRole}
                      onChange={(event) => setOemAssignmentForm((prev) => ({ ...prev, engineerRole: event.target.value }))}
                      placeholder="e.g. Systems Engineer"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="oem-assignment-cert-name">Certification</label>
                    <input
                      id="oem-assignment-cert-name"
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm"
                      value={oemAssignmentForm.certificationName}
                      onChange={(event) => setOemAssignmentForm((prev) => ({ ...prev, certificationName: event.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="oem-assignment-status">Status</label>
                    <select
                      id="oem-assignment-status"
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm"
                      value={oemAssignmentForm.status}
                      onChange={(event) => setOemAssignmentForm((prev) => ({ ...prev, status: event.target.value as OemAssignment['status'] }))}
                    >
                      {OEM_ASSIGNMENT_STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="oem-assignment-start">Start date</label>
                    <input
                      id="oem-assignment-start"
                      type="date"
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm"
                      value={oemAssignmentForm.startedAt}
                      onChange={(event) => setOemAssignmentForm((prev) => ({ ...prev, startedAt: event.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="oem-assignment-due">Due date</label>
                    <input
                      id="oem-assignment-due"
                      type="date"
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm"
                      value={oemAssignmentForm.dueAt}
                      onChange={(event) => setOemAssignmentForm((prev) => ({ ...prev, dueAt: event.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="oem-assignment-completed">Completed</label>
                    <input
                      id="oem-assignment-completed"
                      type="date"
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm"
                      value={oemAssignmentForm.completedAt}
                      onChange={(event) => setOemAssignmentForm((prev) => ({ ...prev, completedAt: event.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700" htmlFor="oem-assignment-cert-id">Link existing certification (optional)</label>
                  <select
                    id="oem-assignment-cert-id"
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm"
                    value={oemAssignmentForm.certificationId}
                    onChange={(event) => setOemAssignmentForm((prev) => ({ ...prev, certificationId: event.target.value }))}
                  >
                    <option value="">Select certificate to link</option>
                    {certifications.map((cert) => (
                      <option key={cert.id} value={cert.id}>
                        {cert.employee} — {cert.certification} ({cert.vendor})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-sky-700"
                  >
                    {modal.meta?.assignmentId ? 'Update assignment' : 'Save assignment'}
                  </button>
                </div>
              </form>
            ) : null}

            {modal.type === 'enablementProgram' ? (
              <form className="mt-6 space-y-4" onSubmit={handleSubmitEnablementProgram}>
                {enablementFormError ? (
                  <p className="rounded-2xl bg-rose-50 px-4 py-2 text-sm text-rose-600">{enablementFormError}</p>
                ) : null}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="enablement-vendor">Vendor</label>
                    <select
                      id="enablement-vendor"
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm"
                      value={enablementForm.vendor}
                      onChange={(event) => setEnablementForm((prev) => ({ ...prev, vendor: event.target.value }))}
                    >
                      {oemOptions.map((vendor) => (
                        <option key={vendor} value={vendor}>
                          {vendor}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="enablement-specialization">Specialization</label>
                    <input
                      id="enablement-specialization"
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm"
                      value={enablementForm.specialization}
                      onChange={(event) => setEnablementForm((prev) => ({ ...prev, specialization: event.target.value }))}
                      placeholder="e.g. Hybrid Cloud"
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="enablement-role">Role</label>
                    <select
                      id="enablement-role"
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm"
                      value={enablementForm.role}
                      onChange={(event) => setEnablementForm((prev) => ({ ...prev, role: event.target.value as EnablementRoleLabel }))}
                    >
                      {ENABLEMENT_ROLE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="enablement-year">Active year</label>
                    <input
                      id="enablement-year"
                      type="number"
                      min={2000}
                      max={9999}
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm"
                      value={enablementForm.activeYear}
                      onChange={(event) => setEnablementForm((prev) => ({ ...prev, activeYear: event.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700" htmlFor="enablement-keywords">Keywords</label>
                  <input
                    id="enablement-keywords"
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm"
                    value={enablementForm.keywords}
                    onChange={(event) => setEnablementForm((prev) => ({ ...prev, keywords: event.target.value }))}
                    placeholder="Comma-separated synonyms"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700" htmlFor="enablement-notes">Notes</label>
                  <textarea
                    id="enablement-notes"
                    rows={3}
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm"
                    value={enablementForm.notes}
                    onChange={(event) => setEnablementForm((prev) => ({ ...prev, notes: event.target.value }))}
                    placeholder="Summarize proof-of-performance or partner validation requirements."
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-sky-700"
                  >
                    {modal.meta?.enablementProgramId ? 'Update program' : 'Save program'}
                  </button>
                </div>
              </form>
            ) : null}

            {modal.type === 'training' ? (
              <form className="mt-6 space-y-4" onSubmit={handleSubmitTraining}>
                {trainingFormError ? (
                  <p className="rounded-2xl bg-rose-50 px-4 py-2 text-sm text-rose-600">{trainingFormError}</p>
                ) : null}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="training-employee">Engineer</label>
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
                      {vendorOptions.map((vendor) => (
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
        </div>
      ) : null}

      {attachmentPreview ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 px-4 py-8 sm:py-12">
          <div className="mx-auto w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Attachment preview</p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">
                  {attachmentPreview.name || 'Certification attachment'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={attachmentPreview.url}
                  download={attachmentPreview.name ?? 'certification-attachment'}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-slate-400 hover:text-slate-900"
                >
                  Download
                </a>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-slate-400 hover:text-slate-900"
                  onClick={() => handlePrintAttachment(attachmentPreview.url)}
                >
                  Print
                </button>
                <button
                  type="button"
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-500 hover:border-slate-300 hover:text-slate-900"
                  onClick={closeAttachmentPreview}
                >
                  Close
                </button>
              </div>
            </div>
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              {attachmentPreview.type === 'pdf' ? (
                <iframe
                  src={attachmentPreview.url}
                  title={attachmentPreview.name ?? 'Certification attachment'}
                  className="h-[65vh] w-full rounded-xl bg-white"
                />
              ) : (
                <div className="flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element -- previewing user-provided blob URLs */}
                  <img
                    src={attachmentPreview.url}
                    alt={attachmentPreview.name ?? 'Certification attachment'}
                    className="max-h-[65vh] w-full rounded-xl object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

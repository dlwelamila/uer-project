import { normaliseCsvRow, type CsvRow } from '@/lib/csv'

export type ContractsReviewSection = {
  title: string
  summary: string
  keyNotes: string[]
  statusHighlights: Array<{ label: string; value: string }>
  productHighlights: Array<{ label: string; value: string }>
  screenshotCaption: string
}

export const DEFAULT_CONTRACTS_REVIEW: ContractsReviewSection = {
  title: 'Support Contracts Status – January 2024 to date',
  summary:
    'Capture the renewal outlook for all monitored assets. Highlight focus areas that require procurement or exception handling.',
  keyNotes: [
    'The data captures contract details from January 2023 to present.',
    'Use MS360 profiles to review historic contract expirations prior to 2023.',
  ],
  statusHighlights: [
    { label: 'Ending within 30 days', value: '36.99%' },
    { label: 'Ending beyond 180 days', value: '56.16%' },
    { label: 'Ending within 31-90 days', value: '6.85%' },
  ],
  productHighlights: [
    { label: 'VxRail', value: '20 assets require review' },
    { label: 'Connectrix', value: '3 assets nearing renewal' },
  ],
  screenshotCaption: 'Support contract status dashboard sourced from MS360 contract analytics.',
}

export type ContractsReviewImportOptions = {
  customerName?: string
}

const CUSTOMER_HEADERS = ['customer', 'customer name', 'account', 'account name', 'location name', 'site name', 'installation']
const CONTRACT_DATE_HEADERS = [
  'contract end date',
  'contract end',
  'contract endday',
  'end date',
  'expiration date',
  'expires',
  'end of standard support',
]

export function cloneContractsReview(section: ContractsReviewSection | null | undefined): ContractsReviewSection {
  if (!section || typeof section !== 'object') {
    return {
      ...DEFAULT_CONTRACTS_REVIEW,
      keyNotes: [...DEFAULT_CONTRACTS_REVIEW.keyNotes],
      statusHighlights: DEFAULT_CONTRACTS_REVIEW.statusHighlights.map((item) => ({ ...item })),
      productHighlights: DEFAULT_CONTRACTS_REVIEW.productHighlights.map((item) => ({ ...item })),
    }
  }

  return {
    title: String(section.title ?? '').trim(),
    summary: String(section.summary ?? '').trim(),
    keyNotes: Array.isArray(section.keyNotes)
      ? section.keyNotes.map((note) => String(note ?? '').trim())
      : [],
    statusHighlights: Array.isArray(section.statusHighlights)
      ? section.statusHighlights.map((item) => ({
          label: String(item?.label ?? '').trim(),
          value: String(item?.value ?? '').trim(),
        }))
      : [],
    productHighlights: Array.isArray(section.productHighlights)
      ? section.productHighlights.map((item) => ({
          label: String(item?.label ?? '').trim(),
          value: String(item?.value ?? '').trim(),
        }))
      : [],
    screenshotCaption: String(section.screenshotCaption ?? '').trim(),
  }
}

type ContractsCsvProvided = {
  title: boolean
  summary: boolean
  keyNotes: number
  statusHighlights: number
  productHighlights: number
  screenshotCaption: boolean
}

type ContractEvent = { date: Date; description: string }

export type ContractsCsvImportResult = {
  section: ContractsReviewSection
  provided: ContractsCsvProvided
  skipped: number
  categoryCounts: Record<string, number>
  totalRows: number
  processedRows: number
  filtered: {
    byCustomer: number
  }
  metadata: {
    customerColumn: string | null
  }
}

function pickFirstValue(...values: Array<string | undefined>): string {
  for (const value of values) {
    const trimmed = (value ?? '').trim()
    if (trimmed) return trimmed
  }
  return ''
}

function pickFirstWithKey(row: Record<string, string>, keys: string[]): { value: string; key: string | null } {
  for (const key of keys) {
    const value = row[key]
    if (value && value.trim()) {
      return { value: value.trim(), key }
    }
  }
  return { value: '', key: null }
}

function normaliseKey(value: string): string {
  return value.replace(/[^a-z0-9]+/gi, ' ').trim().replace(/\s+/g, ' ').toLowerCase()
}

function evaluateCustomerFilter(normalised: Record<string, string>, customerName: string): { include: boolean; column: string | null } {
  const target = normaliseKey(customerName)
  if (!target) {
    return { include: true, column: null }
  }

  let mismatchColumn: string | null = null

  for (const header of CUSTOMER_HEADERS) {
    if (!(header in normalised)) continue
    const candidate = normaliseKey(normalised[header] ?? '')
    if (!candidate) continue
    if (candidate.includes(target) || target.includes(candidate)) {
      return { include: true, column: header }
    }
    mismatchColumn = mismatchColumn ?? header
  }

  if (mismatchColumn) {
    return { include: false, column: mismatchColumn }
  }

  return { include: true, column: null }
}

function parseDateCandidate(value: string | undefined): number | null {
  if (!value) return null
  const cleaned = value.replace(/\u00a0/g, ' ').trim()
  if (!cleaned) return null

  const parsed = Date.parse(cleaned)
  if (!Number.isNaN(parsed)) {
    const date = new Date(parsed)
    return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  }

  const isoMatch = cleaned.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (isoMatch) {
    const [, yearStr, monthStr, dayStr] = isoMatch
    const year = Number(yearStr)
    const month = Number(monthStr)
    const day = Number(dayStr)
    if (Number.isFinite(year) && Number.isFinite(month) && Number.isFinite(day)) {
      return Date.UTC(year, month - 1, day)
    }
  }

  const slashMatch = cleaned.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/)
  if (slashMatch) {
    const [, monthStr, dayStr, yearStr] = slashMatch
    let year = Number(yearStr)
    if (yearStr.length === 2) {
      year += year < 50 ? 2000 : 1900
    }
    const month = Number(monthStr)
    const day = Number(dayStr)
    if (Number.isFinite(year) && Number.isFinite(month) && Number.isFinite(day)) {
      return Date.UTC(year, month - 1, day)
    }
  }

  return null
}

function formatPercentage(count: number, total: number): string {
  if (!total) return '0%'
  const pct = (count / total) * 100
  return `${pct.toFixed(pct < 10 ? 1 : 0)}%`
}

function mergeKeyNotes(
  current: string[],
  incoming: string[],
  mode: 'replace' | 'merge',
): string[] {
  if (mode === 'replace') {
    return incoming.map((note) => note.trim()).filter((note) => note.length > 0)
  }
  const seen = new Set<string>()
  const merged: string[] = []
  const add = (note: string) => {
    const trimmed = note.trim()
    if (!trimmed) return
    const key = trimmed.toLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    merged.push(trimmed)
  }
  current.forEach(add)
  incoming.forEach(add)
  return merged
}

function mergeHighlights(
  current: Array<{ label: string; value: string }>,
  incoming: Array<{ label: string; value: string }>,
  mode: 'replace' | 'merge',
): Array<{ label: string; value: string }> {
  if (mode === 'replace') {
    return incoming.map((item) => ({ label: item.label.trim(), value: item.value.trim() }))
  }
  const map = new Map<string, { label: string; value: string }>()
  current.forEach((item) => {
    const key = item.label.trim().toLowerCase()
    if (!key) return
    map.set(key, { label: item.label.trim(), value: item.value.trim() })
  })
  incoming.forEach((item) => {
    const key = item.label.trim().toLowerCase()
    if (!key) return
    map.set(key, { label: item.label.trim(), value: item.value.trim() })
  })
  return Array.from(map.values())
}

function parseDate(value: string): Date | null {
  if (!value) return null
  const timestamp = parseDateCandidate(value)
  if (timestamp !== null) {
    return new Date(timestamp)
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function normalizeCategory(raw: string): string {
  return raw.trim().toLowerCase().replace(/[\s_-]+/g, '')
}

function mapManualContractsRows(rows: CsvRow[], _options: ContractsReviewImportOptions): ContractsCsvImportResult {
  void _options
  const section: ContractsReviewSection = {
    title: '',
    summary: '',
    keyNotes: [],
    statusHighlights: [],
    productHighlights: [],
    screenshotCaption: '',
  }
  const provided: ContractsCsvProvided = {
    title: false,
    summary: false,
    keyNotes: 0,
    statusHighlights: 0,
    productHighlights: 0,
    screenshotCaption: false,
  }
  const categoryCounts: Record<string, number> = {}
  let skipped = 0
  let totalRows = 0
  let processedRows = 0

  rows.forEach((row) => {
    totalRows += 1
    const normalised = normaliseCsvRow(row)
    const categoryRaw = pickFirstValue(normalised['category'], normalised['section'], normalised['type'])
    if (!categoryRaw) {
      skipped += 1
      return
    }
    const category = normalizeCategory(categoryRaw)
    categoryCounts[category] = (categoryCounts[category] ?? 0) + 1

    const label = pickFirstValue(normalised['label'], normalised['name'], normalised['heading'])
    const value = pickFirstValue(normalised['value'], normalised['data'])
    const note = pickFirstValue(normalised['note'], normalised['text'])

    if (category === 'title') {
      const nextTitle = pickFirstValue(value, label, note)
      if (nextTitle) {
        section.title = nextTitle
        provided.title = true
        processedRows += 1
      } else {
        skipped += 1
      }
      return
    }

    if (category === 'summary') {
      const nextSummary = pickFirstValue(value, note, label)
      if (nextSummary) {
        section.summary = nextSummary
        provided.summary = true
        processedRows += 1
      } else {
        skipped += 1
      }
      return
    }

    if (category === 'caption' || category === 'screenshotcaption') {
      const nextCaption = pickFirstValue(value, note, label)
      if (nextCaption) {
        section.screenshotCaption = nextCaption
        provided.screenshotCaption = true
        processedRows += 1
      } else {
        skipped += 1
      }
      return
    }

    if (category === 'note' || category === 'keynote' || category === 'bullet') {
      const noteText = pickFirstValue(value, note, label)
      if (noteText) {
        section.keyNotes.push(noteText)
        provided.keyNotes += 1
        processedRows += 1
      } else {
        skipped += 1
      }
      return
    }

    if (category === 'status' || category === 'statushighlight') {
      const statusLabel = pickFirstValue(label, note, value)
      const statusValue = pickFirstValue(value, note)
      if (statusLabel || statusValue) {
        section.statusHighlights.push({
          label: statusLabel || statusValue,
          value: statusValue || statusLabel,
        })
        provided.statusHighlights += 1
        processedRows += 1
      } else {
        skipped += 1
      }
      return
    }

    if (category === 'product' || category === 'producthighlight') {
      const productLabel = pickFirstValue(label, note, value)
      const productValue = pickFirstValue(value, note)
      if (productLabel || productValue) {
        section.productHighlights.push({
          label: productLabel || productValue,
          value: productValue || productLabel,
        })
        provided.productHighlights += 1
        processedRows += 1
      } else {
        skipped += 1
      }
      return
    }

    skipped += 1
  })

  section.keyNotes = section.keyNotes.map((note) => note.trim()).filter((note) => note.length > 0)
  section.statusHighlights = section.statusHighlights.map((item) => ({
    label: item.label.trim(),
    value: item.value.trim(),
  }))
  section.productHighlights = section.productHighlights.map((item) => ({
    label: item.label.trim(),
    value: item.value.trim(),
  }))

  return {
    section,
    provided,
    skipped,
    categoryCounts,
    totalRows,
    processedRows,
    filtered: {
      byCustomer: 0,
    },
    metadata: {
      customerColumn: null,
    },
  }
}

function mapAssetContractsRows(rows: CsvRow[], options: ContractsReviewImportOptions): ContractsCsvImportResult {
  const section: ContractsReviewSection = {
    title: '',
    summary: '',
    keyNotes: [],
    statusHighlights: [],
    productHighlights: [],
    screenshotCaption: '',
  }
  const provided: ContractsCsvProvided = {
    title: false,
    summary: false,
    keyNotes: 0,
    statusHighlights: 0,
    productHighlights: 0,
    screenshotCaption: false,
  }
  const categoryCounts: Record<string, number> = { assets: 0 }
  let skipped = 0
  let totalRows = 0
  let processed = 0
  let filteredByCustomer = 0
  let customerColumn: string | null = null

  const bucketCounts: Record<string, number> = {
    expired: 0,
    within30: 0,
    within90: 0,
    within180: 0,
    beyond180: 0,
    unknown: 0,
  }
  const productCounts = new Map<string, number>()
  const servicesStatusCounts = new Map<string, number>()
  const contractTypeCounts = new Map<string, number>()

  const customerName = options.customerName?.trim() ?? ''
  const referenceDate = new Date()
  let earliestFuture: ContractEvent | null = null
  let earliestExpired: ContractEvent | null = null

  rows.forEach((row) => {
    totalRows += 1
    const normalised = normaliseCsvRow(row)
  const productName = pickFirstValue(normalised['product name'], normalised['product'], normalised['system'])
  const { value: contractEndDateStr } = pickFirstWithKey(normalised, CONTRACT_DATE_HEADERS)
    const servicesStatus = pickFirstValue(normalised['services status'], normalised['status']) || 'Unknown'
    const contractType = pickFirstValue(normalised['contract type'], normalised['type'])
    const assetId = pickFirstValue(normalised['asset id'], normalised['serial number'])

    if (!productName && !contractEndDateStr && !assetId) {
      skipped += 1
      return
    }

    if (customerName) {
      const customerCheck = evaluateCustomerFilter(normalised, customerName)
      if (customerCheck.column && !customerColumn) {
        customerColumn = customerCheck.column
      }
      if (!customerCheck.include) {
        filteredByCustomer += 1
        return
      }
    }

    const contractTimestamp = parseDateCandidate(contractEndDateStr)

    processed += 1
    categoryCounts.assets = processed

    if (productName) {
      productCounts.set(productName, (productCounts.get(productName) ?? 0) + 1)
    }
    if (servicesStatus) {
      servicesStatusCounts.set(servicesStatus, (servicesStatusCounts.get(servicesStatus) ?? 0) + 1)
    }
    if (contractType) {
      contractTypeCounts.set(contractType, (contractTypeCounts.get(contractType) ?? 0) + 1)
    }

    const contractEndDate = contractTimestamp !== null ? new Date(contractTimestamp) : parseDate(contractEndDateStr)
    if (!contractEndDate) {
      bucketCounts.unknown += 1
      return
    }

    const diffMs = contractEndDate.getTime() - referenceDate.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      bucketCounts.expired += 1
      if (!earliestExpired || contractEndDate < earliestExpired.date) {
        earliestExpired = {
          date: contractEndDate,
          description: productName || assetId || 'asset',
        }
      }
      return
    }

    if (diffDays <= 30) {
      bucketCounts.within30 += 1
    } else if (diffDays <= 90) {
      bucketCounts.within90 += 1
    } else if (diffDays <= 180) {
      bucketCounts.within180 += 1
    } else {
      bucketCounts.beyond180 += 1
      if (!earliestFuture || contractEndDate < earliestFuture.date) {
        earliestFuture = {
          date: contractEndDate,
          description: productName || assetId || 'asset',
        }
      }
    }
  })

  if (!processed) {
    return {
      section,
      provided,
      skipped,
      categoryCounts,
      totalRows,
      processedRows: processed,
      filtered: {
        byCustomer: filteredByCustomer,
      },
      metadata: {
        customerColumn,
      },
    }
  }

  const total = processed
  const bucketOrder: Array<{ key: keyof typeof bucketCounts; label: string }> = [
    { key: 'expired', label: 'Contracts expired' },
    { key: 'within30', label: 'Ending within 30 days' },
    { key: 'within90', label: 'Ending within 31-90 days' },
    { key: 'within180', label: 'Ending within 91-180 days' },
    { key: 'beyond180', label: 'Ending beyond 180 days' },
    { key: 'unknown', label: 'No end date recorded' },
  ]

  bucketOrder.forEach(({ key, label }) => {
    const count = bucketCounts[key]
    if (!count) return
    const value = `${count} asset${count === 1 ? '' : 's'} (${formatPercentage(count, total)})`
    section.statusHighlights.push({ label, value })
    provided.statusHighlights += 1
  })

  const sortedProducts = Array.from(productCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5)
  sortedProducts.forEach(([label, count]) => {
    section.productHighlights.push({
      label,
      value: `${count} asset${count === 1 ? '' : 's'}`,
    })
  })
  provided.productHighlights = section.productHighlights.length

  const keyNotes: string[] = []
  keyNotes.push(
    `Dashboard generated from ${total} contract record${total === 1 ? '' : 's'} exported on ${formatDate(referenceDate)}.`,
  )

  const attentionCount = bucketCounts.within30 + bucketCounts.within90 + bucketCounts.expired
  if (attentionCount) {
    keyNotes.push(
      `${attentionCount} asset${attentionCount === 1 ? '' : 's'} require renewal review within the next 90 days or are already expired.`,
    )
  }

  if (servicesStatusCounts.size) {
    const statusSummary = Array.from(servicesStatusCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([status, count]) => `${status}: ${count}`)
      .join(', ')
    if (statusSummary) {
      keyNotes.push(`Service coverage snapshot – ${statusSummary}.`)
    }
  }

  if (contractTypeCounts.size) {
    const types = Array.from(contractTypeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type, count]) => `${type}: ${count}`)
      .join(', ')
    if (types) {
      keyNotes.push(`Contract types represented – ${types}.`)
    }
  }

  if (earliestFuture !== null) {
    const event: ContractEvent = earliestFuture
  const diffDays = Math.ceil((event.date.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24))
    keyNotes.push(
      `Next renewal: ${formatDate(event.date)} (${diffDays} day${diffDays === 1 ? '' : 's'}) for ${event.description}.`,
    )
  }

  if (bucketCounts.expired && earliestExpired !== null) {
    const event: ContractEvent = earliestExpired
    keyNotes.push(
      `${bucketCounts.expired} contract${bucketCounts.expired === 1 ? '' : 's'} expired, earliest on ${formatDate(
        event.date,
      )} (${event.description}).`,
    )
  }

  section.keyNotes = keyNotes
  provided.keyNotes = keyNotes.length

  const dueSoon = bucketCounts.within30 + bucketCounts.within90
  section.summary = `Auto-generated from Dell contract export (${total} asset${total === 1 ? '' : 's'}). ${dueSoon} asset${
    dueSoon === 1 ? '' : 's'
  } due for renewal within 90 days; ${bucketCounts.expired} expired.`
  provided.summary = true

  section.productHighlights = section.productHighlights.map((item) => ({
    label: item.label.trim(),
    value: item.value.trim(),
  }))
  section.statusHighlights = section.statusHighlights.map((item) => ({
    label: item.label.trim(),
    value: item.value.trim(),
  }))

  section.keyNotes = section.keyNotes.map((note) => note.trim()).filter((note) => note.length > 0)

  return {
    section,
    provided,
    skipped,
    categoryCounts,
    totalRows,
    processedRows: processed,
    filtered: {
      byCustomer: filteredByCustomer,
    },
    metadata: {
      customerColumn,
    },
  }
}

export function mapContractsReviewCsvRows(
  rows: CsvRow[],
  options: ContractsReviewImportOptions = {},
): ContractsCsvImportResult {
  if (!rows.length) {
    return {
      section: {
        title: '',
        summary: '',
        keyNotes: [],
        statusHighlights: [],
        productHighlights: [],
        screenshotCaption: '',
      },
      provided: {
        title: false,
        summary: false,
        keyNotes: 0,
        statusHighlights: 0,
        productHighlights: 0,
        screenshotCaption: false,
      },
      skipped: 0,
      categoryCounts: {},
      totalRows: 0,
      processedRows: 0,
      filtered: {
        byCustomer: 0,
      },
      metadata: {
        customerColumn: null,
      },
    }
  }

  const manualRowsDetected = rows.some((row) => {
    const normalised = normaliseCsvRow(row)
    const categoryRaw = pickFirstValue(normalised['category'], normalised['section'], normalised['type'])
    return Boolean(categoryRaw)
  })

  return manualRowsDetected ? mapManualContractsRows(rows, options) : mapAssetContractsRows(rows, options)
}

export function mergeContractsReviewSections(
  current: ContractsReviewSection,
  incoming: ContractsReviewSection,
  provided: ContractsCsvProvided,
  mode: 'replace' | 'merge',
): ContractsReviewSection {
  const next: ContractsReviewSection = {
    title: current.title,
    summary: current.summary,
    keyNotes: [...current.keyNotes],
    statusHighlights: current.statusHighlights.map((item) => ({ ...item })),
    productHighlights: current.productHighlights.map((item) => ({ ...item })),
    screenshotCaption: current.screenshotCaption,
  }

  if (provided.title && incoming.title.trim()) {
    if (mode === 'replace' || !next.title.trim()) {
      next.title = incoming.title.trim()
    }
  }

  if (provided.summary && incoming.summary.trim()) {
    if (mode === 'replace' || !next.summary.trim()) {
      next.summary = incoming.summary.trim()
    }
  }

  if (provided.screenshotCaption && incoming.screenshotCaption.trim()) {
    if (mode === 'replace' || !next.screenshotCaption.trim()) {
      next.screenshotCaption = incoming.screenshotCaption.trim()
    }
  }

  if (provided.keyNotes > 0 && incoming.keyNotes.length) {
    next.keyNotes = mergeKeyNotes(next.keyNotes, incoming.keyNotes, mode)
  }

  if (provided.statusHighlights > 0 && incoming.statusHighlights.length) {
    next.statusHighlights = mergeHighlights(next.statusHighlights, incoming.statusHighlights, mode)
  }

  if (provided.productHighlights > 0 && incoming.productHighlights.length) {
    next.productHighlights = mergeHighlights(next.productHighlights, incoming.productHighlights, mode)
  }

  return next
}

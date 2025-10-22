import { normaliseCsvRow, type CsvRow } from '@/lib/csv'

export type ConnectivityLegendNote = string

export type ConnectivityRowDraft = {
  assetId: string
  alternateAssetId: string
  productName: string
  assetAlias: string
  lastAlertAt: string
  connectionType: string
  healthScore: number | ''
  healthLabel: '' | 'Good' | 'Fair' | 'Poor'
}

export type ConnectivityImportOptions = {
  customerName?: string
}

export const DEFAULT_CONNECTIVITY_NOTES: ConnectivityLegendNote[] = [
  'Featured - installed systems with active support contracts.',
  'Secure Connect Gateway aggregates remote monitoring feeds.',
  'Health scores incorporate CloudIQ telemetry (good, fair, poor) with proactive alerting for degraded assets.',
  'Track connectivity restoration for devices that have recently dropped offline; review Data Domain telemetry for more context.',
]

export function cloneConnectivityNotes(notes: ConnectivityLegendNote[]): ConnectivityLegendNote[] {
  return Array.isArray(notes) ? notes.map((note) => String(note ?? '')) : []
}

const CONNECTED_STATUSES = new Set(['connected'])

function deriveHealthLabel(score: number | ''): ConnectivityRowDraft['healthLabel'] {
  if (score === '' || Number.isNaN(score)) return ''
  if (score >= 80) return 'Good'
  if (score >= 55) return 'Fair'
  return 'Poor'
}

function makeRowKey(row: ConnectivityRowDraft): string {
  const parts = [row.assetId, row.alternateAssetId, row.productName, row.assetAlias]
  return parts
    .filter((part) => Boolean(part && part.trim()))
    .map((part) => part.trim().toLowerCase())
    .join('::')
}

function sortRows(rows: ConnectivityRowDraft[]): ConnectivityRowDraft[] {
  return [...rows].sort((a, b) => {
    const productCompare = a.productName.localeCompare(b.productName)
    if (productCompare !== 0) return productCompare
    const assetCompare = a.assetId.localeCompare(b.assetId)
    if (assetCompare !== 0) return assetCompare
    return a.alternateAssetId.localeCompare(b.alternateAssetId)
  })
}

export type ConnectivityCsvImportResult = {
  connected: ConnectivityRowDraft[]
  notConnected: ConnectivityRowDraft[]
  summary: { totalAssets: number; connectedCount: number }
  skipped: number
  statusCounts: Record<string, number>
  totalRows: number
  processedRows: number
  filtered: {
    byCustomer: number
  }
  metadata: {
    customerColumn: string | null
  }
}

const CUSTOMER_HEADERS = ['customer', 'customer name', 'account', 'account name', 'location name', 'site name', 'installation']

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

export function mapConnectivityCsvRows(
  rows: CsvRow[],
  options: ConnectivityImportOptions = {},
): ConnectivityCsvImportResult {
  const connectedMap = new Map<string, ConnectivityRowDraft>()
  const notConnectedMap = new Map<string, ConnectivityRowDraft>()
  const statusCounts: Record<string, number> = {}
  let skipped = 0
  let totalRows = 0
  let processedRows = 0
  let filteredByCustomer = 0
  let customerColumn: string | null = null
  const customerName = options.customerName?.trim() ?? ''

  rows.forEach((row) => {
    totalRows += 1
    const normalised = normaliseCsvRow(row)
    const assetId = (normalised['asset id'] ?? '').trim()
    const productName = (normalised['product name'] ?? '').trim()
    const alternateAssetId = (normalised['alt asset id'] ?? '').trim()
    if (!assetId && !alternateAssetId && !productName) {
      skipped += 1
      return
    }

    const statusRaw = (normalised['connectivity status'] ?? '').trim()
    const statusKey = statusRaw.toLowerCase() || 'unknown'

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
    processedRows += 1

    const assetAlias = (normalised['asset alias'] ?? '').trim()
    const lastAlertAt = (normalised['last alert & telemetry delivery'] ?? '').trim()
    const connectionType = (normalised['connection type'] ?? '').trim()
    const healthScoreRaw = (normalised['health score'] ?? '').trim()
    statusCounts[statusKey] = (statusCounts[statusKey] ?? 0) + 1

    let healthScore: number | '' = ''
    if (healthScoreRaw) {
      const parsed = Number(healthScoreRaw)
      if (!Number.isNaN(parsed)) {
        healthScore = parsed
      }
    }

    let healthLabel = (normalised['health label'] ?? '').trim()
    if (healthLabel !== 'Good' && healthLabel !== 'Fair' && healthLabel !== 'Poor') {
      healthLabel = deriveHealthLabel(healthScore)
    }

    const draft: ConnectivityRowDraft = {
      assetId,
      alternateAssetId,
      productName,
      assetAlias,
      lastAlertAt,
      connectionType,
      healthScore,
      healthLabel: healthLabel as ConnectivityRowDraft['healthLabel'],
    }

    const key = makeRowKey(draft)
    if (CONNECTED_STATUSES.has(statusKey)) {
      connectedMap.set(key, draft)
    } else {
      notConnectedMap.set(key, draft)
    }
  })

  const connected = sortRows(Array.from(connectedMap.values()))
  const notConnected = sortRows(Array.from(notConnectedMap.values()))
  const totalAssets = connected.length + notConnected.length

  return {
    connected,
    notConnected,
    summary: { totalAssets, connectedCount: connected.length },
    skipped,
    statusCounts,
    totalRows,
    processedRows,
    filtered: {
      byCustomer: filteredByCustomer,
    },
    metadata: {
      customerColumn,
    },
  }
}

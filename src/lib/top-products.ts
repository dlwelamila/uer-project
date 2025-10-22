import { cloneTopProducts, DEFAULT_TOP_PRODUCTS, type DashboardTopProduct } from '@/lib/dashboard'
import { normaliseCsvRow, type CsvRow } from '@/lib/csv'

const PRODUCT_KEYS = ['product', 'product name', 'productname', 'product family', 'offer name']
const COUNT_KEYS = ['count', '#', 'sr count', 'case count', 'tickets', 'total', 'volume']
const PERCENT_KEYS = ['percent', 'percentage', '%', 'percent of total', 'share %', 'share']
const RANK_KEYS = ['rank', 'position', 'order', 'row']
const CUSTOMER_KEYS = [
  'customer',
  'customer name',
  'account name',
  'account',
  'company',
  'organization',
  'organisation',
  'site name',
  'location name',
]

export type TopProductsImportOptions = {
  customerName?: string
}

export type TopProductsCsvImportResult = {
  topProducts: DashboardTopProduct[]
  detected: number
  skipped: number
  totalRows: number
  processedRows: number
  provided: {
    counts: number
    percents: number
    ranks: number
  }
  inferred: {
    percents: boolean
    totalCount: number
  }
  filtered: {
    byCustomer: number
  }
  metadata: {
    customerColumn: string | null
  }
}

type AggregatedRow = {
  product: string
  count: number
  percent: number | null
  rank: number | null
  order: number
}

function parseNumeric(value: string | undefined): number | null {
  if (!value) return null
  const cleaned = value.replace(/[%$,]/g, '').trim()
  if (!cleaned) return null
  const parsed = Number(cleaned)
  if (Number.isFinite(parsed)) return parsed

  const match = cleaned.match(/-?\d+(?:\.\d+)?/)
  if (!match) return null
  const fallback = Number(match[0])
  return Number.isFinite(fallback) ? fallback : null
}

function normaliseProductName(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function normaliseKey(value: string): string {
  return value.replace(/[^a-z0-9]+/gi, ' ').trim().replace(/\s+/g, ' ').toLowerCase()
}

function formatCount(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.round(value)
}

function formatPercent(value: number): number {
  if (!Number.isFinite(value)) return 0
  const clamped = Math.max(0, Math.min(100, value))
  return Math.round(clamped * 10) / 10
}

function padTopProducts(rows: DashboardTopProduct[]): DashboardTopProduct[] {
  const next = cloneTopProducts(rows)
  while (next.length < DEFAULT_TOP_PRODUCTS.length) {
    next.push({ product: '', count: 0, percent: 0 })
  }
  return next
}

function extractFirstNumeric(normalised: Record<string, string>, keys: string[]): number | null {
  for (const key of keys) {
    const candidate = normalised[key]
    const parsed = parseNumeric(candidate)
    if (parsed !== null) return parsed
  }
  return null
}

function evaluateCustomerFilter(
  normalised: Record<string, string>,
  customerName: string,
): { include: boolean; column: string | null } {
  const target = normaliseKey(customerName)
  if (!target) {
    return { include: true, column: null }
  }

  let mismatchColumn: string | null = null

  for (const header of CUSTOMER_KEYS) {
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

export function mapTopProductsCsvRows(
  rows: CsvRow[],
  options: TopProductsImportOptions = {},
): TopProductsCsvImportResult {
  const aggregated = new Map<string, AggregatedRow>()
  let providedCounts = 0
  let providedPercents = 0
  let providedRanks = 0
  let skipped = 0
  let totalRows = 0
  let processedRows = 0
  let filteredByCustomer = 0
  let customerColumn: string | null = null

  const customerName = options.customerName?.trim() ?? ''

  rows.forEach((row, index) => {
    totalRows += 1
    const normalised = normaliseCsvRow(row)
    const productKey = PRODUCT_KEYS.find((key) => normalised[key])
    const productValue = productKey ? normalised[productKey] ?? '' : ''
    const product = normaliseProductName(productValue ?? '')
    if (!product) {
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

    processedRows += 1

    const count = extractFirstNumeric(normalised, COUNT_KEYS)
    const hasExplicitCount = count !== null
    const resolvedCount = hasExplicitCount ? count! : 1
    if (hasExplicitCount) {
      providedCounts += 1
    }

    const percent = extractFirstNumeric(normalised, PERCENT_KEYS)
    if (percent !== null) {
      providedPercents += 1
    }

    const rank = extractFirstNumeric(normalised, RANK_KEYS)
    if (rank !== null) {
      providedRanks += 1
    }

    const key = product.toLowerCase()
    const current = aggregated.get(key)
    if (current) {
      current.count += resolvedCount
      if (percent !== null) current.percent = percent
      if (rank !== null) current.rank = current.rank !== null ? Math.min(current.rank, rank) : rank
    } else {
      aggregated.set(key, {
        product,
        count: resolvedCount,
        percent,
        rank,
        order: index,
      })
    }
  })

  const rowsArray = Array.from(aggregated.values())
  const totalCount = rowsArray.reduce((total, row) => total + (Number.isFinite(row.count) ? row.count : 0), 0)
  let computedPercents = false

  rowsArray.forEach((row) => {
    if (row.percent === null) {
      if (totalCount > 0) {
        row.percent = Number.isFinite(row.count) ? (row.count / totalCount) * 100 : 0
        computedPercents = true
      } else {
        row.percent = 0
      }
    }
  })

  rowsArray.sort((a, b) => {
    if (a.rank !== null || b.rank !== null) {
      const rankA = a.rank ?? Number.POSITIVE_INFINITY
      const rankB = b.rank ?? Number.POSITIVE_INFINITY
      if (rankA !== rankB) return rankA - rankB
    }
    if (b.count !== a.count) return b.count - a.count
    if ((b.percent ?? 0) !== (a.percent ?? 0)) return (b.percent ?? 0) - (a.percent ?? 0)
    return a.order - b.order
  })

  const truncated = rowsArray.slice(0, DEFAULT_TOP_PRODUCTS.length)
  const normalisedRows = truncated.map((row) => ({
    product: row.product,
    count: formatCount(row.count),
    percent: formatPercent(row.percent ?? 0),
  }))

  return {
    topProducts: padTopProducts(normalisedRows),
    detected: truncated.filter((row) => Boolean(row.product)).length,
    skipped,
    totalRows,
    processedRows,
    provided: {
      counts: providedCounts,
      percents: providedPercents,
      ranks: providedRanks,
    },
    inferred: {
      percents: computedPercents,
      totalCount,
    },
    filtered: {
      byCustomer: filteredByCustomer,
    },
    metadata: {
      customerColumn,
    },
  }
}

export function mergeTopProducts(
  existing: DashboardTopProduct[],
  incoming: DashboardTopProduct[],
  mode: 'replace' | 'merge' = 'merge',
): DashboardTopProduct[] {
  if (mode === 'replace') {
    return padTopProducts(incoming.filter((row) => row.product.trim().length))
  }

  const result = new Map<string, DashboardTopProduct>()

  existing.forEach((row) => {
    const product = normaliseProductName(row.product ?? '')
    if (!product) return
    result.set(product.toLowerCase(), {
      product,
      count: formatCount(row.count ?? 0),
      percent: formatPercent(row.percent ?? 0),
    })
  })

  incoming.forEach((row) => {
    const product = normaliseProductName(row.product ?? '')
    if (!product) return
    result.set(product.toLowerCase(), {
      product,
      count: formatCount(row.count ?? 0),
      percent: formatPercent(row.percent ?? 0),
    })
  })

  const merged = Array.from(result.values()).sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count
    if (b.percent !== a.percent) return b.percent - a.percent
    return a.product.localeCompare(b.product)
  })

  return padTopProducts(merged.slice(0, DEFAULT_TOP_PRODUCTS.length))
}

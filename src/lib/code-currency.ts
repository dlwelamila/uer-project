import { normaliseCsvRow, type CsvRow } from '@/lib/csv'

export type CodeCurrencyRowDraft = {
  id?: string
  systemModel: string
  assetCount: number
  installedCode: string
  statuses: { o?: boolean; m?: boolean; r?: boolean; l?: boolean }
  minSupported7: string
  minSupported8: string
  recommended7: string
  recommended8: string
  latest7: string
  latest8: string
}

export type CodeCurrencyImportOptions = {
  customerName?: string
}

export type CodeCurrencyImportResult = {
  rows: CodeCurrencyRowDraft[]
  skipped: number
  totalRows: number
  processedRows: number
  filtered: {
    byCustomer: number
  }
  metadata: {
    customerColumn: string | null
  }
}

const PRODUCT_NAME_HEADERS = ['product name', 'product', 'system model', 'model']
const INSTALLED_CODE_HEADERS = ['installed code', 'firmware', 'code', 'code version']
const CUSTOMER_HEADERS = ['customer', 'customer name', 'account', 'account name', 'location name', 'site name', 'installation']

function pickFirst(row: Record<string, string>, keys: string[]): string {
  for (const key of keys) {
    const value = row[key]
    if (value) return value
  }
  return ''
}

function normaliseLabel(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
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

export function mapCodeCurrencyCsvRows(rows: CsvRow[], options: CodeCurrencyImportOptions = {}): CodeCurrencyImportResult {
  const buckets = new Map<string, { systemModel: string; assetCount: number; installedCodes: Set<string> }>()
  let skipped = 0
  let totalRows = 0
  let processedRows = 0
  let filteredByCustomer = 0
  let customerColumn: string | null = null

  const customerName = options.customerName?.trim() ?? ''

  rows.forEach((raw) => {
    totalRows += 1
    const normalised = normaliseCsvRow(raw)
    const productName = pickFirst(normalised, PRODUCT_NAME_HEADERS)
    if (!productName) {
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

    const key = productName.toLowerCase()
    const bucket = buckets.get(key) ?? {
      systemModel: normaliseLabel(productName),
      assetCount: 0,
      installedCodes: new Set<string>(),
    }
    bucket.assetCount += 1
    const installedCode = pickFirst(normalised, INSTALLED_CODE_HEADERS)
    if (installedCode) bucket.installedCodes.add(normaliseLabel(installedCode))
    buckets.set(key, bucket)
  })

  const rowsArray: CodeCurrencyRowDraft[] = Array.from(buckets.values())
    .map((bucket) => ({
      systemModel: bucket.systemModel,
      assetCount: bucket.assetCount,
      installedCode: Array.from(bucket.installedCodes.values()).join('\n'),
      statuses: {},
      minSupported7: '',
      minSupported8: '',
      recommended7: '',
      recommended8: '',
      latest7: '',
      latest8: '',
    }))
    .sort((a, b) => a.systemModel.localeCompare(b.systemModel))

  return {
    rows: rowsArray,
    skipped,
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

export function mergeCodeCurrencyRows(
  current: CodeCurrencyRowDraft[],
  incoming: CodeCurrencyRowDraft[],
): CodeCurrencyRowDraft[] {
  const map = new Map<string, CodeCurrencyRowDraft>()
  current.forEach((row) => {
    map.set(row.systemModel.trim().toLowerCase(), { ...row })
  })
  incoming.forEach((row) => {
    map.set(row.systemModel.trim().toLowerCase(), { ...row })
  })
  return Array.from(map.values()).sort((a, b) => a.systemModel.localeCompare(b.systemModel))
}

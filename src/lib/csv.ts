import Papa, { type ParseError, type ParseResult } from 'papaparse'

export type CsvRow = Record<string, unknown>

export type CsvParseOutcome = {
  rows: CsvRow[]
  errors: ParseError[]
  meta: ParseResult<CsvRow>['meta']
}

/**
 * Parse a CSV file in the browser using PapaParse. The parser runs in streaming mode
 * and resolves once the full file has been processed.
 */
export function parseCsvFile(file: File): Promise<CsvParseOutcome> {
  return new Promise((resolve, reject) => {
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      transformHeader(header: string): string {
        return header.trim()
      },
      complete(results: ParseResult<CsvRow>) {
        resolve({ rows: results.data ?? [], errors: results.errors ?? [], meta: results.meta })
      },
      error(error: ParseError) {
        reject(error)
      },
    })
  })
}

export function normaliseCsvRow(row: CsvRow): Record<string, string> {
  const normalised: Record<string, string> = {}
  Object.entries(row ?? {}).forEach(([key, value]) => {
    const cleanedKey = (key ?? '').toString().trim().toLowerCase()
    if (!cleanedKey) return
    if (typeof value === 'string') {
      normalised[cleanedKey] = value.trim()
    } else if (value === null || value === undefined) {
      normalised[cleanedKey] = ''
    } else {
      normalised[cleanedKey] = String(value).trim()
    }
  })
  return normalised
}

export type FcoTseRow = {
  srCreated: string
  fcoId: string
  description: string
  srNumber: string
  severity: string
  serialNumber: string
  status: string
  productName: string
  problemSummary: string
}

export const DEFAULT_FCO_TSE_ROWS: FcoTseRow[] = []

export function cloneFcoTseRows(rows: FcoTseRow[]): FcoTseRow[] {
  return Array.isArray(rows)
    ? rows.map((row) => ({
        srCreated: String(row?.srCreated ?? '').trim(),
        fcoId: String(row?.fcoId ?? '').trim(),
        description: String(row?.description ?? '').trim(),
        srNumber: String(row?.srNumber ?? '').trim(),
        severity: String(row?.severity ?? '').trim(),
        serialNumber: String(row?.serialNumber ?? '').trim(),
        status: String(row?.status ?? '').trim(),
        productName: String(row?.productName ?? '').trim(),
        problemSummary: String(row?.problemSummary ?? '').trim(),
      }))
    : []
}

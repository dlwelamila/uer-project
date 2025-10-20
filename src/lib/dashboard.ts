export const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const
export type MonthLabel = (typeof MONTH_LABELS)[number]

export type DashboardTopProduct = {
  product: string
  count: number
  percent: number
}

export type DashboardTrendPoint = {
  month: number
  value: number
  comparison?: number | null
  note?: string
}

export type DashboardSeverity = 'S1' | 'S2' | 'S3' | 'S5'

export type DashboardSeveritySplit = {
  severity: DashboardSeverity
  percent: number
}

export type DashboardChannelSplit = {
  channel: string
  percent: number
}

export type DashboardKeyNote = string

export type DashboardSparePart = {
  product: string
  sparePart: string
  qty: string
  mode: string
}

export type DashboardSummary = {
  topProducts: DashboardTopProduct[]
  trend: DashboardTrendPoint[]
  severity: DashboardSeveritySplit[]
  channels: DashboardChannelSplit[]
  keyNotes: DashboardKeyNote[]
  spareParts: DashboardSparePart[]
}

export const DEFAULT_TOP_PRODUCTS: DashboardTopProduct[] = [
  { product: 'VxRail P570F', count: 45, percent: 39.8 },
  { product: 'Networker', count: 21, percent: 18.5 },
  { product: 'VxRail P670F', count: 14, percent: 12.3 },
  { product: 'Dell EMC Unity XT 480', count: 9, percent: 7.9 },
  { product: 'DD6400 Appliance', count: 8, percent: 7.0 },
  { product: 'Dell EMC Unity 500', count: 6, percent: 5.3 },
  { product: 'Others', count: 10, percent: 8.8 },
]

export const DEFAULT_TREND_POINTS: DashboardTrendPoint[] = [
  { month: 1, value: 27 },
  { month: 2, value: 18 },
  { month: 3, value: 11 },
  { month: 4, value: 9 },
  { month: 5, value: 3 },
  { month: 6, value: 6 },
  { month: 7, value: 11 },
  { month: 8, value: 5 },
  { month: 9, value: 5 },
  { month: 10, value: 7 },
  { month: 11, value: 1 },
  { month: 12, value: 13 },
]

export const DEFAULT_SEVERITY_SPLIT: DashboardSeveritySplit[] = [
  { severity: 'S1', percent: 2 },
  { severity: 'S2', percent: 52 },
  { severity: 'S3', percent: 32 },
  { severity: 'S5', percent: 14 },
]

export const CHANNEL_ORDER = ['Dial-Home', 'Web', 'Phone', 'Connect Home', 'Chat', 'Email'] as const

export const DEFAULT_CHANNEL_SPLIT: DashboardChannelSplit[] = [
  { channel: 'Dial-Home', percent: 38 },
  { channel: 'Web', percent: 56 },
  { channel: 'Phone', percent: 2 },
  { channel: 'Connect Home', percent: 2 },
  { channel: 'Chat', percent: 1 },
  { channel: 'Email', percent: 1 },
]

export const DEFAULT_KEY_NOTES: DashboardKeyNote[] = [
  'Incident Management (Support cases raised within the reporting period)',
  'Positive downward trajectory of cases',
  'Uptick of cases in Q1. VxRail environment varied issues',
  '52% raised as S2',
  'Multi-channels for raising support tickets. 56% of the cases raised via web interaction',
  'Minimal parts replaced over the period',
]

export const DEFAULT_SPARE_PARTS: DashboardSparePart[] = [
  { product: 'Dell EMC Unity XT 480', sparePart: '-Disk', qty: '1', mode: '-' },
  { product: 'Dell EMC Unity 500', sparePart: '-Dimms', qty: '-', mode: '-' },
]

export function cloneTopProducts(rows: DashboardTopProduct[]): DashboardTopProduct[] {
  return rows.map((row) => ({ ...row }))
}

export function cloneTrendPoints(rows: DashboardTrendPoint[]): DashboardTrendPoint[] {
  return rows.map((row) => {
    const comparisonValue = row?.comparison
    const normalizedComparison =
      comparisonValue === undefined || comparisonValue === null ? null : Number(comparisonValue)

    return {
      month: row?.month ?? 1,
      value: Number(row?.value ?? 0),
      comparison: Number.isFinite(normalizedComparison as number) ? normalizedComparison : null,
      note: row?.note ?? '',
    }
  })
}

export function cloneSeveritySplit(rows: DashboardSeveritySplit[]): DashboardSeveritySplit[] {
  return rows.map((row) => ({ ...row }))
}

export function cloneChannelSplit(rows: DashboardChannelSplit[]): DashboardChannelSplit[] {
  return rows.map((row) => ({ ...row }))
}

export function cloneKeyNotes(rows: DashboardKeyNote[]): DashboardKeyNote[] {
  return rows.map((row) => String(row ?? ''))
}

export function cloneSpareParts(rows: DashboardSparePart[]): DashboardSparePart[] {
  return rows.map((row) => ({
    product: row?.product ?? '',
    sparePart: row?.sparePart ?? '',
    qty: row?.qty ?? '',
    mode: row?.mode ?? '',
  }))
}

export function withSummaryFallback(summary?: Partial<DashboardSummary>): DashboardSummary {
  return {
    topProducts: summary?.topProducts?.length
      ? cloneTopProducts(summary.topProducts)
      : cloneTopProducts(DEFAULT_TOP_PRODUCTS),
    trend: summary?.trend?.length
      ? cloneTrendPoints(summary.trend)
      : cloneTrendPoints(DEFAULT_TREND_POINTS),
    severity: summary?.severity?.length
      ? cloneSeveritySplit(summary.severity)
      : cloneSeveritySplit(DEFAULT_SEVERITY_SPLIT),
    channels: summary?.channels?.length
      ? cloneChannelSplit(summary.channels)
      : cloneChannelSplit(DEFAULT_CHANNEL_SPLIT),
    keyNotes: summary?.keyNotes?.length
      ? cloneKeyNotes(summary.keyNotes)
      : cloneKeyNotes(DEFAULT_KEY_NOTES),
    spareParts: summary?.spareParts?.length
      ? cloneSpareParts(summary.spareParts)
      : cloneSpareParts(DEFAULT_SPARE_PARTS),
  }
}

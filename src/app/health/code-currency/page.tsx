'use client'

import { useEffect, useMemo, useState } from 'react'
import { useIncidentsFilters } from '@/components/IncidentsFilters'

type CodeCurrencyRow = {
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

const FALLBACK_ROWS: CodeCurrencyRow[] = [
  {
    systemModel: 'Connectrix DS-6505B',
    assetCount: 3,
    installedCode: '7.2.1d',
    statuses: { o: true },
    minSupported7: '8.2.3d',
    minSupported8: '–',
    recommended7: '8.2.3e1',
    recommended8: '–',
    latest7: '8.2.3e2',
    latest8: '–',
  },
  {
    systemModel: 'DD6300 Appliance',
    assetCount: 2,
    installedCode: '7.7.2.0 / 7.7.5.30',
    statuses: { m: true },
    minSupported7: '7.7.1',
    minSupported8: '–',
    recommended7: 'LTS2024 7.13.1',
    recommended8: '–',
    latest7: '8.3.0.0',
    latest8: '–',
  },
  {
    systemModel: 'Dell EMC Unity P670F',
    assetCount: 18,
    installedCode: '0.0.0000 / 8.0.213-28667925',
    statuses: { r: true },
    minSupported7: '7.0.532',
    minSupported8: '8.0.000',
    recommended7: '7.0.532',
    recommended8: '8.0.311',
    latest7: '7.0.532',
    latest8: '8.0.311',
  },
  {
    systemModel: 'VxRail P570F',
    assetCount: 32,
    installedCode: '7.0.410 / 8.0.213 / 4.5.215',
    statuses: { l: true },
    minSupported7: '7.0.532',
    minSupported8: '8.0.000',
    recommended7: '7.0.532',
    recommended8: '8.0.311',
    latest7: '7.0.532',
    latest8: '8.0.311',
  },
]

type StatusKey = 'o' | 'm' | 'r' | 'l'

type ColumnKey =
  | 'systemModel'
  | 'assetCount'
  | 'installedCode'
  | StatusKey
  | 'minSupported7'
  | 'minSupported8'
  | 'recommended7'
  | 'recommended8'
  | 'latest7'
  | 'latest8'

type ColumnMeta = {
  header: string
  headerClass: string
  cellClass: string
  align: 'left' | 'center'
  width?: string
  cellTextClass?: string
  dividerLeft?: boolean
  dividerRight?: boolean
  format?: (value: string) => string
}

const formatInstalledCode = (value: string) => value.replace(/\s*\/\s*/g, '\n')

const COLUMN_ORDER: ColumnKey[] = [
  'systemModel',
  'assetCount',
  'installedCode',
  'o',
  'm',
  'r',
  'l',
  'minSupported7',
  'minSupported8',
  'recommended7',
  'recommended8',
  'latest7',
  'latest8',
]

const STATUS_KEYS: StatusKey[] = ['o', 'm', 'r', 'l']

const COLUMN_META: Record<ColumnKey, ColumnMeta> = {
  systemModel: {
    header: 'System Model',
    headerClass: 'bg-[#dbe3f0] text-slate-900 text-left',
    cellClass: 'bg-[#f2f5fb] font-semibold text-[#1f2a44]',
    align: 'left',
    width: 'w-64',
  },
  assetCount: {
    header: 'Asset Count #',
    headerClass: 'bg-[#dbe3f0] text-slate-900 text-center',
    cellClass: 'bg-[#f2f5fb] text-center font-semibold text-[#1f2a44]',
    align: 'center',
    width: 'w-24',
  },
  installedCode: {
    header: 'Installed Code',
    headerClass: 'bg-[#dbe3f0] text-slate-900 text-left',
    cellClass: 'bg-[#f6f8fd] whitespace-pre-line text-[#243356]',
    align: 'left',
    width: 'w-56',
    format: formatInstalledCode,
  },
  o: {
    header: 'O',
    headerClass: 'bg-[#c62828] text-white text-center border-l-[3px] border-l-[#2f3a4c]',
    cellClass: 'bg-[#fde7e9] text-[#8b1515] text-center font-semibold',
    align: 'center',
    width: 'w-12',
    dividerLeft: true,
  },
  m: {
    header: 'M',
    headerClass: 'bg-[#ef6c00] text-white text-center',
    cellClass: 'bg-[#feecce] text-[#9b5300] text-center font-semibold',
    align: 'center',
    width: 'w-12',
  },
  r: {
    header: 'R',
    headerClass: 'bg-[#7cb342] text-white text-center',
    cellClass: 'bg-[#e3f2c3] text-[#3f6d1d] text-center font-semibold',
    align: 'center',
    width: 'w-12',
  },
  l: {
    header: 'L',
    headerClass: 'bg-[#0397a6] text-white text-center border-r-[3px] border-r-[#2f3a4c]',
    cellClass: 'bg-[#d5f4f7] text-[#03626d] text-center font-semibold',
    align: 'center',
    width: 'w-12',
    dividerRight: true,
  },
  minSupported7: {
    header: 'Minimum (Supported) Code 7.0.x',
    headerClass: 'bg-[#f7e08c] text-[#2f2d1f] text-left border-l-[3px] border-l-[#2f3a4c]',
    cellClass: 'bg-[#fff6d6] text-[#5d4400]',
    align: 'left',
    width: 'w-44',
    dividerLeft: true,
  },
  minSupported8: {
    header: 'Minimum (Supported) Code 8.0.x',
    headerClass: 'bg-[#f7e08c] text-[#2f2d1f] text-left',
    cellClass: 'bg-[#fff6d6] text-[#5d4400]',
    align: 'left',
    width: 'w-40',
  },
  recommended7: {
    header: 'Recommended (Target) Code 7.0.x',
    headerClass: 'bg-[#f6c343] text-[#2f240f] text-left border-l-[3px] border-l-[#2f3a4c]',
    cellClass: 'bg-[#ffe4a3]',
    align: 'left',
    width: 'w-44',
    dividerLeft: true,
    cellTextClass: 'font-semibold text-[#7b4e00]',
  },
  recommended8: {
    header: 'Recommended (Target) Code 8.0.x',
    headerClass: 'bg-[#f6c343] text-[#2f240f] text-left',
    cellClass: 'bg-[#ffe4a3]',
    align: 'left',
    width: 'w-40',
    cellTextClass: 'font-semibold text-[#7b4e00]',
  },
  latest7: {
    header: 'Latest Code 7.0.x',
    headerClass: 'bg-[#7cb342] text-white text-left border-l-[3px] border-l-[#2f3a4c]',
    cellClass: 'bg-[#cce8b8]',
    align: 'left',
    width: 'w-40',
    dividerLeft: true,
    cellTextClass: 'font-semibold text-[#205723]',
  },
  latest8: {
    header: 'Latest Code 8.0.x',
    headerClass: 'bg-[#7cb342] text-white text-left',
    cellClass: 'bg-[#cce8b8]',
    align: 'left',
    width: 'w-40',
    cellTextClass: 'font-semibold text-[#205723]',
  },
}

const composeHeaderClasses = (meta: ColumnMeta) => {
  const base = 'border border-[#3d4a60] px-3 py-3 text-[11px] font-semibold uppercase tracking-wide'
  const alignClass = meta.align === 'center' ? 'text-center' : 'text-left'
  return `${base} ${meta.headerClass} ${alignClass} ${meta.width ?? ''}`
}

const composeCellClasses = (meta: ColumnMeta) => {
  const base = 'border border-[#c2c9d6] px-3 py-2'
  const alignClass = meta.align === 'center' ? 'text-center' : 'text-left'
  const dividerLeft = meta.dividerLeft ? ' border-l-[3px] border-l-[#2f3a4c]' : ''
  const dividerRight = meta.dividerRight ? ' border-r-[3px] border-r-[#2f3a4c]' : ''
  return `${base} ${alignClass} ${meta.cellClass}${dividerLeft}${dividerRight}`
}

export default function CodeCurrencyPage() {
  const {
    selectedEngagementId,
    engagementsLoading,
    periodLabel,
    reportTypeLabel,
    currentEngagement,
  } = useIncidentsFilters()

  const [rows, setRows] = useState<CodeCurrencyRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedEngagementId) {
      setRows([])
      setLoading(false)
      return
    }

    let cancelled = false
    async function loadCodeCurrency() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/code-currency?engagementId=${encodeURIComponent(selectedEngagementId)}`)
        if (!res.ok) throw new Error(`Failed to load code currency (${res.status})`)
        const payload = await res.json()
        if (cancelled) return
        if (Array.isArray(payload) && payload.length) {
          setRows(payload as CodeCurrencyRow[])
        } else {
          setRows(FALLBACK_ROWS)
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err)
          setError('Unable to load code currency for this engagement. Showing baseline data.')
          setRows(FALLBACK_ROWS)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadCodeCurrency()
    return () => {
      cancelled = true
    }
  }, [selectedEngagementId])

  const tableRows = useMemo(() => rows, [rows])

  if (engagementsLoading && !selectedEngagementId) {
    return <div className="rounded-lg bg-white p-4 shadow">Loading engagements…</div>
  }

  if (!selectedEngagementId) {
    return (
      <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
        Select a published engagement to view code currency analysis.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {currentEngagement && (
        <div className="flex flex-wrap justify-between gap-2 text-sm text-slate-600">
          <span>{periodLabel}</span>
          <span>
            Interval: {reportTypeLabel} {'·'} Status: {currentEngagement.status}
          </span>
        </div>
      )}

      {error && (
        <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-lg bg-white p-4 shadow">Loading code currency data…</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#3d4a60] shadow">
          <div className="flex items-center gap-4 bg-[#f5f8ff] px-6 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-inner">
              <CodeCurrencyIcon className="h-8 w-8 text-[#0d5cad]" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[#123c73]">Hardware Code Currency Breakdown</h1>
              <p className="text-xs text-[#4a5d7a]">Code currency analysis for products with active support contracts</p>
            </div>
          </div>

          <div className="overflow-x-auto border-t-[3px] border-[#2f3a4c]">
            <table className="min-w-[1100px] border-separate border-spacing-0 text-sm text-slate-800">
              <thead>
                <tr>
                  {COLUMN_ORDER.map((key) => {
                    const meta = COLUMN_META[key]
                    return (
                      <th key={key} className={composeHeaderClasses(meta)}>
                        {meta.header}
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row) => (
                  <tr key={row.systemModel}>
                    {COLUMN_ORDER.map((key) => {
                      const meta = COLUMN_META[key]
                      if (STATUS_KEYS.includes(key as StatusKey)) {
                        return (
                          <StatusCell
                            key={key}
                            active={row.statuses[key as StatusKey]}
                            meta={meta}
                          />
                        )
                      }

                      const rawValue = (row as Record<string, unknown>)[key]
                      const formatted =
                        typeof rawValue === 'string' && meta.format
                          ? meta.format(rawValue)
                          : rawValue

                      const display =
                        formatted !== undefined && formatted !== null && formatted !== ''
                          ? String(formatted)
                          : '—'

                      return (
                        <td key={key} className={composeCellClasses(meta)}>
                          <span className={meta.cellTextClass}>{display}</span>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-[#f5f8ff] p-4 text-sm text-[#1f2a44] shadow-sm">
        <h2 className="mb-2 font-semibold text-[#123c73]">How to interpret</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <span className="font-semibold">O / M / R / L</span> flag the current support posture for each product family.
          </li>
          <li>Highlight items where installed code is below the minimum supported release and coordinate remediation.</li>
          <li>Target recommended and latest versions during lifecycle planning to stay aligned with vendor best practice.</li>
        </ul>
      </div>
    </div>
  )
}

function StatusCell({ active, meta }: { active?: boolean; meta: ColumnMeta }) {
  const content = active ? <span className="text-lg leading-none">*</span> : <span className="text-slate-400">-</span>
  return <td className={composeCellClasses(meta)}>{content}</td>
}

function CodeCurrencyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="3" y="4" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <line x1="6" y1="9" x2="6" y2="15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="10.5" y1="6.5" x2="10.5" y2="15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="15" y1="11" x2="15" y2="15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="18.5" y1="8.5" x2="18.5" y2="15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3 18.5H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}


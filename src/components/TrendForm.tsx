'use client'

import { useEffect, useState } from 'react'
import {
  DEFAULT_TREND_POINTS,
  cloneTrendPoints,
  MONTH_LABELS,
  type DashboardTrendPoint,
} from '@/lib/dashboard'

type Props = {
  value?: DashboardTrendPoint[]
  onChange?: (rows: DashboardTrendPoint[]) => void
}

export function TrendForm({ value, onChange }: Props) {
  const [rows, setRows] = useState<DashboardTrendPoint[]>(() =>
    value && value.length ? cloneTrendPoints(value) : cloneTrendPoints(DEFAULT_TREND_POINTS)
  )

  useEffect(() => {
    if (value && value.length) {
      setRows(cloneTrendPoints(value))
    } else {
      setRows(cloneTrendPoints(DEFAULT_TREND_POINTS))
    }
  }, [value])

  function updateValue(i: number, val: string) {
    setRows((prev) => {
      const copy = cloneTrendPoints(prev)
      copy[i].value = Number(val || 0)
      onChange?.(copy)
      return copy
    })
  }

  function updateComparison(i: number, val: string) {
    setRows((prev) => {
      const copy = cloneTrendPoints(prev)
      const parsed = val.trim()
      if (!parsed.length) {
        copy[i].comparison = null
      } else {
        const numeric = Number(parsed)
        copy[i].comparison = Number.isFinite(numeric) ? numeric : null
      }
      onChange?.(copy)
      return copy
    })
  }

  function updateNote(i: number, val: string) {
    setRows((prev) => {
      const copy = cloneTrendPoints(prev)
      copy[i].note = val
      onChange?.(copy)
      return copy
    })
  }

  return (
    <div className="space-y-2">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="w-28 p-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Metric
            </th>
            {MONTH_LABELS.map((label) => (
              <th key={label} className="p-2">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <th className="bg-slate-50 p-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Volume
            </th>
            {rows.map((row, index) => (
              <td key={index} className="p-2">
                <input
                  type="number"
                  className="w-full rounded border p-1 text-right"
                  value={row.value}
                  onChange={(event) => updateValue(index, event.target.value)}
                />
              </td>
            ))}
          </tr>
          <tr className="border-t">
            <th className="bg-slate-50 p-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Prev Period
            </th>
            {rows.map((row, index) => (
              <td key={index} className="p-2">
                <input
                  type="number"
                  className="w-full rounded border p-1 text-right"
                  value={row.comparison ?? ''}
                  onChange={(event) => updateComparison(index, event.target.value)}
                  placeholder="--"
                />
              </td>
            ))}
          </tr>
          <tr className="border-t align-top">
            <th className="bg-slate-50 p-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Note
            </th>
            {rows.map((row, index) => (
              <td key={index} className="p-2">
                <textarea
                  className="h-16 w-full resize-none rounded border px-2 py-1 text-xs"
                  value={row.note ?? ''}
                  onChange={(event) => updateNote(index, event.target.value)}
                  placeholder="Add context for this month (optional)"
                />
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import {
  DEFAULT_SEVERITY_SPLIT,
  cloneSeveritySplit,
  type DashboardSeveritySplit,
} from '@/lib/dashboard'

type Props = {
  value?: DashboardSeveritySplit[]
  onChange?: (rows: DashboardSeveritySplit[]) => void
}

export function SeverityForm({ value, onChange }: Props) {
  const [rows, setRows] = useState<DashboardSeveritySplit[]>(() =>
    value && value.length ? cloneSeveritySplit(value) : cloneSeveritySplit(DEFAULT_SEVERITY_SPLIT)
  )

  useEffect(() => {
    if (value && value.length) {
      setRows(cloneSeveritySplit(value))
    } else {
      setRows(cloneSeveritySplit(DEFAULT_SEVERITY_SPLIT))
    }
  }, [value])

  function update(index: number, val: string) {
    setRows((prev) => {
      const copy = cloneSeveritySplit(prev)
      copy[index].percent = Number(val || 0)
      onChange?.(copy)
      return copy
    })
  }

  const sum = rows.reduce((acc, row) => acc + (row.percent || 0), 0)

  return (
    <div className="space-y-2">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Severity</th>
            <th className="p-2 text-left">Percent</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.severity}>
              <td className="p-2">{row.severity}</td>
              <td className="p-2">
                <input
                  type="number"
                  className="w-full rounded border p-1 text-right"
                  value={row.percent}
                  onChange={(event) => update(index, event.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={`text-xs ${sum === 100 ? 'text-green-700' : 'text-red-700'}`}>Sum % = {sum}</div>
    </div>
  )
}

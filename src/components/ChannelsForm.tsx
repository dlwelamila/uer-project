'use client'

import { useEffect, useState } from 'react'
import {
  CHANNEL_ORDER,
  DEFAULT_CHANNEL_SPLIT,
  cloneChannelSplit,
  type DashboardChannelSplit,
} from '@/lib/dashboard'

type Props = {
  value?: DashboardChannelSplit[]
  onChange?: (rows: DashboardChannelSplit[]) => void
}

export function ChannelsForm({ value, onChange }: Props) {
  const deriveRows = (source?: DashboardChannelSplit[]) => {
    if (!source || !source.length) {
      return cloneChannelSplit(DEFAULT_CHANNEL_SPLIT)
    }
    const ordered = CHANNEL_ORDER.map((label) => source.find((row) => row.channel === label)).filter(
      Boolean
    ) as DashboardChannelSplit[]
    if (ordered.length) {
      const remaining = source.filter(
        (row) => !CHANNEL_ORDER.includes(row.channel as (typeof CHANNEL_ORDER)[number])
      )
      return cloneChannelSplit([...ordered, ...remaining])
    }
    return cloneChannelSplit(source)
  }

  const [rows, setRows] = useState<DashboardChannelSplit[]>(() => deriveRows(value))

  useEffect(() => {
    setRows(deriveRows(value))
  }, [value])

  function update(index: number, val: string) {
    setRows((prev) => {
      const copy = cloneChannelSplit(prev)
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
            <th className="p-2 text-left">Channel</th>
            <th className="p-2 text-left">Percent</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.channel}>
              <td className="p-2">{row.channel}</td>
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

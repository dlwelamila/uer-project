'use client'
import { useEffect, useState } from 'react'
import {
  DEFAULT_TOP_PRODUCTS,
  cloneTopProducts,
  type DashboardTopProduct,
} from '@/lib/dashboard'

type Props = {
  value?: DashboardTopProduct[]
  onChange?: (rows: DashboardTopProduct[]) => void
}

export function TopFiveForm({ value, onChange }: Props) {
  const [rows, setRows] = useState<DashboardTopProduct[]>(() =>
    value && value.length ? cloneTopProducts(value) : cloneTopProducts(DEFAULT_TOP_PRODUCTS)
  )

  useEffect(() => {
    if (value && value.length) {
      setRows(cloneTopProducts(value))
    } else {
      setRows(cloneTopProducts(DEFAULT_TOP_PRODUCTS))
    }
  }, [value])

  function update(i: number, key: keyof DashboardTopProduct, val: string) {
    setRows((prev) => {
      const copy = cloneTopProducts(prev)
      if (key === 'product') {
        copy[i].product = val
      } else if (key === 'count') {
        copy[i].count = Number(val || 0)
      } else if (key === 'percent') {
        copy[i].percent = Number(val || 0)
      }
      onChange?.(copy)
      return copy
    })
  }

  return (
    <div className="space-y-2">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Product</th>
            <th className="p-2 text-right">#</th>
            <th className="p-2 text-right">% </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i)=>(
            <tr key={i} className="border-t">
              <td className="p-2">
                <input className="w-full border p-1 rounded" value={r.product}
                  onChange={e=>update(i,'product',e.target.value)} />
              </td>
              <td className="p-2">
                <input type="number" className="w-full border p-1 rounded text-right"
                  value={r.count} onChange={e=>update(i,'count',e.target.value)} />
              </td>
              <td className="p-2">
                <input type="number" step="0.1" className="w-full border p-1 rounded text-right"
                  value={r.percent} onChange={e=>update(i,'percent',e.target.value)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* footer removed as requested */}
    </div>
  )
}

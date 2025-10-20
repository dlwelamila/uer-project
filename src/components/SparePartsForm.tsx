import { useMemo } from 'react'
import { DashboardSparePart } from '@/lib/dashboard'

type Props = {
  value: DashboardSparePart[]
  onChange?: (rows: DashboardSparePart[]) => void
}

export function SparePartsForm({ value, onChange }: Props) {
  const rows = useMemo(() => value ?? [], [value])

  const update = (index: number, key: keyof DashboardSparePart, next: string) => {
    if (!onChange) return
    const copy = rows.map((row) => ({ ...row }))
    copy[index][key] = next
    onChange(copy)
  }

  const addRow = () => {
    onChange?.([...rows, { product: '', sparePart: '', qty: '', mode: '' }])
  }

  const removeRow = (index: number) => {
    if (!onChange) return
    const copy = rows.filter((_, i) => i !== index)
    onChange(copy.length ? copy : [{ product: '', sparePart: '', qty: '', mode: '' }])
  }

  return (
    <div className="space-y-3">
      <table className="w-full border-separate border-spacing-y-2 text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
            <th className="px-2">Product</th>
            <th className="px-2">Spare Part</th>
            <th className="px-2">Qty</th>
            <th className="px-2">Mode</th>
            <th className="px-2" aria-hidden />
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="rounded border">
              <td className="px-2">
                <input
                  className="w-full rounded border px-2 py-1"
                  value={row.product}
                  onChange={(event) => update(index, 'product', event.target.value)}
                />
              </td>
              <td className="px-2">
                <input
                  className="w-full rounded border px-2 py-1"
                  value={row.sparePart}
                  onChange={(event) => update(index, 'sparePart', event.target.value)}
                />
              </td>
              <td className="px-2">
                <input
                  className="w-full rounded border px-2 py-1"
                  value={row.qty}
                  onChange={(event) => update(index, 'qty', event.target.value)}
                />
              </td>
              <td className="px-2">
                <input
                  className="w-full rounded border px-2 py-1"
                  value={row.mode}
                  onChange={(event) => update(index, 'mode', event.target.value)}
                />
              </td>
              <td className="px-2">
                <button
                  type="button"
                  className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-600"
                  onClick={() => removeRow(index)}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        type="button"
        className="rounded border border-blue-500 px-3 py-1 text-xs text-blue-600"
        onClick={addRow}
      >
        + Add Spare Part
      </button>
    </div>
  )
}


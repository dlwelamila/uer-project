export type FcoTseRowDraft = {
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

type Props = {
  value: FcoTseRowDraft[]
  onChange?: (rows: FcoTseRowDraft[]) => void
  disabled?: boolean
}

const EMPTY_ROW: FcoTseRowDraft = {
  srCreated: '',
  fcoId: '',
  description: '',
  srNumber: '',
  severity: '',
  serialNumber: '',
  status: '',
  productName: '',
  problemSummary: '',
}

export function FcoTseForm({ value, onChange, disabled }: Props) {
  const rows = Array.isArray(value) ? value : []

  const update = (index: number, patch: Partial<FcoTseRowDraft>) => {
    if (!onChange) return
    const next = rows.map((row, idx) => (idx === index ? { ...row, ...patch } : row))
    onChange(next)
  }

  const addRow = () => {
    if (!onChange) return
    onChange([...rows, { ...EMPTY_ROW }])
  }

  const removeRow = (index: number) => {
    if (!onChange) return
    onChange(rows.filter((_, idx) => idx !== index))
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          type="button"
          className="inline-flex items-center rounded border border-[#0d5cad] px-3 py-1 text-xs font-semibold text-[#0d5cad] transition hover:bg-[#0d5cad]/10 disabled:opacity-50"
          onClick={addRow}
          disabled={disabled}
        >
          + Add Record
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[1024px] w-full border-collapse text-sm text-[#1f2a44]">
          <thead className="bg-[#f5f8ff] text-xs uppercase tracking-wide text-[#4a5d7a]">
            <tr>
              <th className="px-3 py-2 text-left">SR Created</th>
              <th className="px-3 py-2 text-left">FCO</th>
              <th className="px-3 py-2 text-left">FCO Description</th>
              <th className="px-3 py-2 text-left">SR #</th>
              <th className="px-3 py-2 text-left">Severity</th>
              <th className="px-3 py-2 text-left">Serial Number</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Product Name</th>
              <th className="px-3 py-2 text-left">Problem Summary</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {!rows.length && (
              <tr>
                <td colSpan={10} className="px-3 py-6 text-center text-xs text-[#5b6b7c]">
                  No FCOs or TSEs captured yet. Use &ldquo;Add Record&rdquo; to document activity.
                </td>
              </tr>
            )}
            {rows.map((row, index) => (
              <tr key={index} className="border-t border-[#e2e7f2]">
                <td className="px-3 py-2">
                  <input
                    type="date"
                    className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                    value={row.srCreated}
                    onChange={(event) => update(index, { srCreated: event.target.value })}
                    disabled={disabled}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                    value={row.fcoId}
                    onChange={(event) => update(index, { fcoId: event.target.value })}
                    disabled={disabled}
                    placeholder="FCO identifier"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                    value={row.description}
                    onChange={(event) => update(index, { description: event.target.value })}
                    disabled={disabled}
                    placeholder="Short description"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                    value={row.srNumber}
                    onChange={(event) => update(index, { srNumber: event.target.value })}
                    disabled={disabled}
                    placeholder="SR number"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                    value={row.severity}
                    onChange={(event) => update(index, { severity: event.target.value })}
                    disabled={disabled}
                    placeholder="Severity"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                    value={row.serialNumber}
                    onChange={(event) => update(index, { serialNumber: event.target.value })}
                    disabled={disabled}
                    placeholder="Serial number"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                    value={row.status}
                    onChange={(event) => update(index, { status: event.target.value })}
                    disabled={disabled}
                    placeholder="Status"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                    value={row.productName}
                    onChange={(event) => update(index, { productName: event.target.value })}
                    disabled={disabled}
                    placeholder="Product name"
                  />
                </td>
                <td className="px-3 py-2">
                  <textarea
                    className="h-20 w-full rounded border border-slate-300 px-2 py-1 text-sm"
                    value={row.problemSummary}
                    onChange={(event) => update(index, { problemSummary: event.target.value })}
                    disabled={disabled}
                    placeholder="Problem summary"
                  />
                </td>
                <td className="px-3 py-2 text-center">
                  <button
                    type="button"
                    className="text-xs font-semibold text-[#c62828] hover:text-[#8b1515] disabled:opacity-40"
                    onClick={() => removeRow(index)}
                    disabled={disabled}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

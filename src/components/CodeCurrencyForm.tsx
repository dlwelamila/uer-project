import { useMemo } from 'react'

export type CodeCurrencyRowDraft = {
  id?: string
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

type Props = {
  value: CodeCurrencyRowDraft[]
  onChange?: (rows: CodeCurrencyRowDraft[]) => void
  disabled?: boolean
}

const EMPTY_ROW: CodeCurrencyRowDraft = {
  systemModel: '',
  assetCount: 0,
  installedCode: '',
  statuses: {},
  minSupported7: '',
  minSupported8: '',
  recommended7: '',
  recommended8: '',
  latest7: '',
  latest8: '',
}

const STATUS_META = [
  { key: 'o', label: 'O', tone: 'bg-[#fde7e9] border-[#c62828] text-[#8b1515]' },
  { key: 'm', label: 'M', tone: 'bg-[#feecce] border-[#ef6c00] text-[#9b5300]' },
  { key: 'r', label: 'R', tone: 'bg-[#e3f2c3] border-[#7cb342] text-[#3f6d1d]' },
  { key: 'l', label: 'L', tone: 'bg-[#d5f4f7] border-[#0397a6] text-[#03626d]' },
] as const

export function CodeCurrencyForm({ value, onChange, disabled }: Props) {
  const rows = useMemo(() => value ?? [], [value])

  const updateRow = (index: number, patch: Partial<CodeCurrencyRowDraft>) => {
    if (!onChange) return
    const next = rows.map((row, idx) => (idx === index ? { ...row, ...patch } : row))
    onChange(next)
  }

  const updateStatus = (index: number, key: keyof CodeCurrencyRowDraft['statuses']) => {
    if (!onChange) return
    const current = rows[index]
    if (!current) return
    const nextStatus = { ...current.statuses, [key]: !current.statuses[key] }
    updateRow(index, { statuses: nextStatus })
  }

  const addRow = () => {
    if (!onChange) return
    onChange([
      ...rows,
      {
        ...EMPTY_ROW,
        statuses: {},
      },
    ])
  }

  const removeRow = (index: number) => {
    if (!onChange) return
    const next = rows.filter((_, idx) => idx !== index)
    onChange(next)
  }

  const renderInput = (
    index: number,
    field: keyof CodeCurrencyRowDraft,
    options?: { type?: 'text' | 'number'; placeholder?: string; multiline?: boolean },
  ) => {
    const row = rows[index]
    const value = row?.[field]
    const type = options?.type ?? 'text'
    if (options?.multiline) {
      return (
        <textarea
          className="h-16 w-full resize-none rounded border border-slate-300 px-2 py-1 text-sm"
          value={String(value ?? '')}
          placeholder={options?.placeholder}
          onChange={(event) => updateRow(index, { [field]: event.target.value } as Partial<CodeCurrencyRowDraft>)}
          disabled={disabled}
        />
      )
    }
    return (
      <input
        type={type}
        className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
        value={type === 'number' ? Number(value ?? 0) : String(value ?? '')}
        onChange={(event) => {
          const nextValue =
            type === 'number' ? Number(event.target.value ?? 0) : (event.target.value as string)
          updateRow(index, { [field]: nextValue } as Partial<CodeCurrencyRowDraft>)
        }}
        placeholder={options?.placeholder}
        disabled={disabled}
        min={type === 'number' ? 0 : undefined}
      />
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#123c73]">Captured Products</h3>
        <button
          type="button"
          className="inline-flex items-center rounded border border-[#0d5cad] px-3 py-1 text-xs font-semibold text-[#0d5cad] transition hover:bg-[#0d5cad]/10 disabled:opacity-50"
          onClick={addRow}
          disabled={disabled}
        >
          + Add Product
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[1020px] border-separate border-spacing-y-2 text-sm">
          <thead>
            <tr className="text-[11px] uppercase tracking-wide text-[#4a5d7a]">
              <th className="w-48 text-left">System Model</th>
              <th className="w-20 text-center">Asset Count #</th>
              <th className="w-56 text-left">Installed Code</th>
              {STATUS_META.map((meta) => (
                <th key={meta.key} className="w-12 text-center">
                  {meta.label}
                </th>
              ))}
              <th className="w-48 text-left">Minimum 7.0.x</th>
              <th className="w-48 text-left">Minimum 8.0.x</th>
              <th className="w-48 text-left">Recommended 7.0.x</th>
              <th className="w-48 text-left">Recommended 8.0.x</th>
              <th className="w-48 text-left">Latest 7.0.x</th>
              <th className="w-48 text-left">Latest 8.0.x</th>
              <th className="w-16" />
            </tr>
          </thead>
          <tbody>
            {!rows.length && (
              <tr>
                <td colSpan={12} className="rounded bg-[#f5f8ff] px-3 py-4 text-center text-xs text-[#4a5d7a]">
                  No products captured yet. Use &quot;Add Product&quot; to begin.
                </td>
              </tr>
            )}
            {rows.map((row, index) => (
              <tr key={row.id ?? `row-${index}`} className="rounded border border-[#d5dbe6] bg-white shadow-sm">
                <td className="px-3 py-2 align-top">{renderInput(index, 'systemModel', { placeholder: 'Model name' })}</td>
                <td className="px-3 py-2 align-top">
                  {renderInput(index, 'assetCount', { type: 'number', placeholder: '0' })}
                </td>
                <td className="px-3 py-2 align-top">
                  {renderInput(index, 'installedCode', { multiline: true, placeholder: 'Installed firmware details' })}
                </td>
                {STATUS_META.map((meta) => (
                  <td key={meta.key} className="px-2 py-2 text-center align-top">
                    <button
                      type="button"
                      className={`inline-flex h-7 w-7 items-center justify-center rounded border text-xs font-semibold transition ${
                        row.statuses[meta.key] ? meta.tone : 'border-slate-300 text-slate-400'
                      } ${disabled ? 'cursor-not-allowed opacity-60' : 'hover:scale-105'}`}
                      onClick={() => updateStatus(index, meta.key)}
                      disabled={disabled}
                    >
                      {meta.label}
                    </button>
                  </td>
                ))}
                <td className="px-3 py-2 align-top">
                  {renderInput(index, 'minSupported7', { placeholder: 'e.g., 8.2.3d' })}
                </td>
                <td className="px-3 py-2 align-top">
                  {renderInput(index, 'minSupported8', { placeholder: '-' })}
                </td>
                <td className="px-3 py-2 align-top">
                  {renderInput(index, 'recommended7', { placeholder: 'e.g., 7.0.532' })}
                </td>
                <td className="px-3 py-2 align-top">
                  {renderInput(index, 'recommended8', { placeholder: 'e.g., 8.0.311' })}
                </td>
                <td className="px-3 py-2 align-top">
                  {renderInput(index, 'latest7', { placeholder: 'e.g., 7.0.532' })}
                </td>
                <td className="px-3 py-2 align-top">
                  {renderInput(index, 'latest8', { placeholder: 'e.g., 8.0.311' })}
                </td>
                <td className="px-3 py-2 align-top text-center">
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

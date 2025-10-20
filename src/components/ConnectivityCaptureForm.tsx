import type { ReactNode } from 'react'

export type ConnectivityRowDraft = {
  assetId: string
  alternateAssetId: string
  productName: string
  assetAlias: string
  lastAlertAt: string
  connectionType: string
  healthScore: number | ''
  healthLabel: '' | 'Good' | 'Fair' | 'Poor'
}

type Props = {
  connected: ConnectivityRowDraft[]
  notConnected: ConnectivityRowDraft[]
  onChange?: (next: { connected: ConnectivityRowDraft[]; notConnected: ConnectivityRowDraft[] }) => void
  disabled?: boolean
  notesSlot?: ReactNode
}

const EMPTY_ROW: ConnectivityRowDraft = {
  assetId: '',
  alternateAssetId: '',
  productName: '',
  assetAlias: '',
  lastAlertAt: '',
  connectionType: '',
  healthScore: '',
  healthLabel: '',
}

const HEALTH_OPTIONS: Array<{ value: '' | 'Good' | 'Fair' | 'Poor'; label: string }> = [
  { value: '', label: 'Select health' },
  { value: 'Good', label: 'Good' },
  { value: 'Fair', label: 'Fair' },
  { value: 'Poor', label: 'Poor' },
]

export function ConnectivityCaptureForm({ connected, notConnected, onChange, disabled, notesSlot }: Props) {
  const update = (
    bucket: 'connected' | 'notConnected',
    index: number,
    patch: Partial<ConnectivityRowDraft>,
  ) => {
    if (!onChange) return
    const source = bucket === 'connected' ? connected : notConnected
    const updated = source.map((row, idx) => (idx === index ? { ...row, ...patch } : row))
    onChange({
      connected: bucket === 'connected' ? updated : connected,
      notConnected: bucket === 'notConnected' ? updated : notConnected,
    })
  }

  const addRow = (bucket: 'connected' | 'notConnected') => {
    if (!onChange) return
    const source = bucket === 'connected' ? connected : notConnected
    const updated = [...source, { ...EMPTY_ROW }]
    onChange({
      connected: bucket === 'connected' ? updated : connected,
      notConnected: bucket === 'notConnected' ? updated : notConnected,
    })
  }

  const removeRow = (bucket: 'connected' | 'notConnected', index: number) => {
    if (!onChange) return
    const source = bucket === 'connected' ? connected : notConnected
    const updated = source.filter((_, idx) => idx !== index)
    onChange({
      connected: bucket === 'connected' ? updated : connected,
      notConnected: bucket === 'notConnected' ? updated : notConnected,
    })
  }

  const renderTable = (title: string, bucket: 'connected' | 'notConnected', rows: ConnectivityRowDraft[]) => (
    <div className="rounded-2xl border border-[#d6dbe7] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#d6dbe7] px-4 py-3">
        <h4 className="text-sm font-semibold text-[#123c73]">{title}</h4>
        <button
          type="button"
          className="inline-flex items-center rounded border border-[#0d5cad] px-3 py-1 text-xs font-semibold text-[#0d5cad] transition hover:bg-[#0d5cad]/10 disabled:opacity-50"
          onClick={() => addRow(bucket)}
          disabled={disabled}
        >
          + Add Asset
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[960px] w-full border-collapse text-sm text-[#1f2a44]">
          <thead className="bg-[#f5f8ff] text-xs uppercase tracking-wide text-[#4a5d7a]">
            <tr>
              <th className="px-3 py-2 text-left">Asset ID</th>
              <th className="px-3 py-2 text-left">Alt Asset ID</th>
              <th className="px-3 py-2 text-left">Product Name</th>
              <th className="px-3 py-2 text-left">Asset Alias</th>
              <th className="px-3 py-2 text-left whitespace-nowrap">Last Alert / Telemetry</th>
              <th className="px-3 py-2 text-left">Connection Type</th>
              <th className="px-3 py-2 text-left">Health Score</th>
              <th className="px-3 py-2 text-left">Health Label</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {!rows.length && (
              <tr>
                <td colSpan={9} className="px-3 py-6 text-center text-xs text-[#5b6b7c]">
                  No assets captured yet. Use "Add Asset" to begin.
                </td>
              </tr>
            )}
            {rows.map((row, index) => (
              <tr key={`${bucket}-${index}`} className="border-t border-[#e2e7f2]">
                <td className="px-3 py-2">
                  <input
                    className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                    value={row.assetId}
                    onChange={(event) => update(bucket, index, { assetId: event.target.value })}
                    disabled={disabled}
                    placeholder="Asset identifier"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                    value={row.alternateAssetId}
                    onChange={(event) => update(bucket, index, { alternateAssetId: event.target.value })}
                    disabled={disabled}
                    placeholder="Alternative ID"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                    value={row.productName}
                    onChange={(event) => update(bucket, index, { productName: event.target.value })}
                    disabled={disabled}
                    placeholder="Product name"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                    value={row.assetAlias}
                    onChange={(event) => update(bucket, index, { assetAlias: event.target.value })}
                    disabled={disabled}
                    placeholder="Alias"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                    value={row.lastAlertAt}
                    onChange={(event) => update(bucket, index, { lastAlertAt: event.target.value })}
                    disabled={disabled}
                    placeholder="ISO date/time"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                    value={row.connectionType}
                    onChange={(event) => update(bucket, index, { connectionType: event.target.value })}
                    disabled={disabled}
                    placeholder="Connection type"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                    value={row.healthScore === '' ? '' : row.healthScore}
                    onChange={(event) => {
                      const value = event.target.value
                      update(bucket, index, { healthScore: value === '' ? '' : Number(value) })
                    }}
                    disabled={disabled}
                    placeholder="Score"
                    min={0}
                    max={100}
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                    value={row.healthLabel}
                    onChange={(event) =>
                      update(bucket, index, { healthLabel: event.target.value as ConnectivityRowDraft['healthLabel'] })
                    }
                    disabled={disabled}
                  >
                    {HEALTH_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2 text-center">
                  <button
                    type="button"
                    className="text-xs font-semibold text-[#c62828] hover:text-[#8b1515] disabled:opacity-40"
                    onClick={() => removeRow(bucket, index)}
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

  const connectedTable = renderTable('Connected Hardware Assets Breakdown', 'connected', connected)
  const notConnectedTable = renderTable('Not Connected Breakdown', 'notConnected', notConnected)

  if (!notesSlot) {
    return (
      <div className="space-y-6">
        {connectedTable}
        {notConnectedTable}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {connectedTable}
      <div className="space-y-6">
        {notConnectedTable}
        <div>{notesSlot}</div>
      </div>
    </div>
  )
}

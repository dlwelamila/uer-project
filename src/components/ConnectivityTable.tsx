type ConnectivityStatus = 'Connected' | 'Not Connected'

export type ConnectivityRow = {
  assetId: string
  alternateAssetId?: string
  productName: string
  assetAlias?: string
  connectivityStatus: ConnectivityStatus
  lastAlertAt?: string
  connectionType?: string
  healthScore?: number | null
  healthLabel?: 'Good' | 'Fair' | 'Poor'
}

type Props = {
  title: string
  rows: ConnectivityRow[]
  emptyMessage: string
  highlight?: ConnectivityStatus
}

const SCORE_COLORS: Record<string, string> = {
  Good: 'bg-emerald-500',
  Fair: 'bg-amber-500',
  Poor: 'bg-rose-500',
}

export function ConnectivityTable({ title, rows, emptyMessage, highlight }: Props) {
  const hasRows = rows.length > 0
  return (
    <div className="rounded-2xl border border-[#d6dbe7] bg-white shadow-sm">
      <div className="border-b border-[#d6dbe7] px-5 py-4">
        <h3 className="text-sm font-semibold text-[#123c73]">{title}</h3>
        <p className="mt-1 text-xs text-[#4a5d7a]">
          {highlight === 'Connected'
            ? 'Installed assets that are actively reporting telemetry.'
            : highlight === 'Not Connected'
              ? 'Assets that have not connected within the monitoring window.'
              : 'Connectivity telemetry by asset.'}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[720px] w-full border-collapse text-sm text-[#1f2a44]">
          <thead className="bg-[#f5f8ff] text-xs uppercase tracking-wide text-[#4a5d7a]">
            <tr>
              <th className="px-4 py-3 text-left">Asset ID</th>
              <th className="px-4 py-3 text-left">Alt Asset ID</th>
              <th className="px-4 py-3 text-left">Product Name</th>
              <th className="px-4 py-3 text-left">Asset Alias</th>
              <th className="px-4 py-3 text-left">Connectivity Status</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">Last Alert &amp; Telemetry</th>
              <th className="px-4 py-3 text-left">Connection Type</th>
              <th className="px-4 py-3 text-left">Health Score</th>
            </tr>
          </thead>
          <tbody>
            {!hasRows && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-sm text-[#5b6b7c]">
                  {emptyMessage}
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.assetId} className="border-t border-[#e2e7f2]">
                <td className="px-4 py-3 font-medium text-[#0d5cad]">{row.assetId}</td>
                <td className="px-4 py-3 text-[#4a5d7a]">{row.alternateAssetId ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className="text-[#0d5cad] underline">{row.productName}</span>
                </td>
                <td className="px-4 py-3 text-[#4a5d7a]">{row.assetAlias ?? '—'}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={row.connectivityStatus} />
                </td>
                <td className="px-4 py-3 text-[#4a5d7a] whitespace-nowrap">
                  {row.lastAlertAt ? new Date(row.lastAlertAt).toLocaleString() : '—'}
                </td>
                <td className="px-4 py-3 text-[#4a5d7a]">{row.connectionType ?? '—'}</td>
                <td className="px-4 py-3">
                  {row.healthScore != null ? (
                    <span className="inline-flex items-center gap-2">
                      <span
                        className={`inline-flex min-w-[34px] items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold text-white ${
                          row.healthLabel ? SCORE_COLORS[row.healthLabel] ?? 'bg-slate-500' : 'bg-emerald-500'
                        }`}
                      >
                        {row.healthScore}
                      </span>
                      {row.healthLabel && <span className="text-xs font-medium text-[#4a5d7a]">{row.healthLabel}</span>}
                    </span>
                  ) : (
                    <span className="text-[#4a5d7a]">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: ConnectivityStatus }) {
  if (status === 'Connected') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        Connected
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-rose-400 bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-600">
      <span className="h-2 w-2 rounded-full bg-rose-500" />
      Not Connected
    </span>
  )
}


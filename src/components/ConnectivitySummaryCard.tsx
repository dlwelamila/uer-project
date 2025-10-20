type Props = {
  totalAssets: number
  connected: number
  disconnected: number
}

export function ConnectivitySummaryCard({ totalAssets, connected, disconnected }: Props) {
  const effectiveTotal = Math.max(totalAssets, connected + disconnected)
  const connectedPct = effectiveTotal ? Math.round((connected / effectiveTotal) * 100) : 0
  const disconnectedPct = effectiveTotal ? Math.round((disconnected / effectiveTotal) * 100) : 0
  const radius = 56
  const circumference = 2 * Math.PI * radius
  const connectedLength = (connectedPct / 100) * circumference
  const disconnectedLength = (disconnectedPct / 100) * circumference

  return (
    <div className="rounded-2xl border border-[#d6dbe7] bg-white p-6 shadow-sm">
      <div className="text-sm font-semibold text-[#123c73]">Connectivity Overview</div>
      <div className="text-xs text-[#4a5d7a]">Eligible assets connecting</div>

      <div className="mt-6 flex flex-col items-center">
        <div className="relative h-36 w-36">
          <svg viewBox="0 0 140 140" className="h-full w-full">
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="transparent"
              stroke="#e5e9f2"
              strokeWidth="16"
            />
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="transparent"
              stroke="#c62828"
              strokeWidth="16"
              strokeDasharray={`${disconnectedLength} ${circumference}`}
              strokeDashoffset={circumference * 0.25}
              strokeLinecap="round"
            />
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="transparent"
              stroke="#1f8f3d"
              strokeWidth="16"
              strokeDasharray={`${connectedLength} ${circumference}`}
              strokeDashoffset={circumference * 0.25 + disconnectedLength}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-2xl font-semibold text-[#123c73]">{effectiveTotal}</div>
            <div className="text-xs uppercase tracking-wide text-[#4a5d7a]">Assets</div>
          </div>
        </div>
        <div className="mt-4 flex w-full justify-between text-xs uppercase tracking-wide text-[#4a5d7a]">
          <span>{connectedPct}% Connected</span>
          <span>{disconnectedPct}% Not Connected</span>
        </div>
      </div>
    </div>
  )
}


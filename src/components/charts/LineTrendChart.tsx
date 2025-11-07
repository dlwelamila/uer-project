"use client"

export type LineTrendDatum = {
  label: string
  value: number
}

type LineTrendChartProps = {
  data: LineTrendDatum[]
  width?: number
  height?: number
  lineColor?: string
  fillColor?: string
  pointColor?: string
  axisColor?: string
}

export default function LineTrendChart({
  data,
  width = 520,
  height = 280,
  lineColor = "#22c55e",
  fillColor = "rgba(34,197,94,0.15)",
  pointColor = "#16a34a",
  axisColor = "#d1d5db",
}: LineTrendChartProps) {
  if (!data.length) {
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full">
        <text x={width / 2} y={height / 2} textAnchor="middle" fontSize="14" fill="#6b7280">
          No trend data available
        </text>
      </svg>
    )
  }

  const padding = { top: 32, right: 32, bottom: 48, left: 48 }
  const innerWidth = width - padding.left - padding.right
  const innerHeight = height - padding.top - padding.bottom
  const maxValue = Math.max(...data.map((datum) => datum.value), 0)
  const safeMax = maxValue > 0 ? maxValue : 1

  const xForIndex = (index: number) => {
    if (data.length === 1) return padding.left + innerWidth / 2
    return padding.left + (index / (data.length - 1)) * innerWidth
  }
  const yForValue = (value: number) => padding.top + innerHeight - (value / safeMax) * innerHeight

  const pathD = data
    .map((datum, index) => {
      const command = index === 0 ? "M" : "L"
      return `${command} ${xForIndex(index)} ${yForValue(datum.value)}`
    })
    .join(" ")

  const areaD = `${pathD} L ${xForIndex(data.length - 1)} ${padding.top + innerHeight} L ${xForIndex(0)} ${
    padding.top + innerHeight
  } Z`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full">
      <rect x="0" y="0" width={width} height={height} fill="transparent" />
      <line
        x1={padding.left}
        y1={padding.top + innerHeight}
        x2={padding.left + innerWidth}
        y2={padding.top + innerHeight}
        stroke={axisColor}
        strokeWidth="1"
      />
      <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + innerHeight} stroke={axisColor} strokeWidth="1" />

      <path d={areaD} fill={fillColor} />
      <path d={pathD} fill="none" stroke={lineColor} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />

      {data.map((datum, index) => (
        <g key={`${datum.label}-${datum.value}-${index}`}>
          <circle cx={xForIndex(index)} cy={yForValue(datum.value)} r={6} fill={pointColor} stroke="#ffffff" strokeWidth={2} />
          <text
            x={xForIndex(index)}
            y={yForValue(datum.value) - 12}
            textAnchor="middle"
            fontSize="12"
            fontWeight="600"
            fill="#15803d"
          >
            {datum.value}%
          </text>
          <text
            x={xForIndex(index)}
            y={padding.top + innerHeight + 20}
            textAnchor="middle"
            fontSize="12"
            fill="#6b7280"
          >
            {datum.label}
          </text>
        </g>
      ))}
    </svg>
  )
}

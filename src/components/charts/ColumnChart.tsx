"use client"

export type ColumnChartDatum = {
  label: string
  value: number
}

type ColumnChartProps = {
  data: ColumnChartDatum[]
  color?: string
  width?: number
  height?: number
  labelColor?: string
  axisColor?: string
}

export default function ColumnChart({
  data,
  color = "#22c55e",
  width = 520,
  height = 280,
  labelColor = "#1f2937",
  axisColor = "#d1d5db",
}: ColumnChartProps) {
  if (!data.length) {
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full">
        <text x={width / 2} y={height / 2} textAnchor="middle" fontSize="14" fill="#6b7280">
          No data available
        </text>
      </svg>
    )
  }

  const maxValue = Math.max(...data.map((datum) => datum.value), 0)
  const safeMax = maxValue > 0 ? maxValue : 1
  const padding = { top: 32, right: 32, bottom: 48, left: 40 }
  const innerWidth = width - padding.left - padding.right
  const innerHeight = height - padding.top - padding.bottom
  const barGap = 24
  const barWidth = Math.max(12, (innerWidth - barGap * (data.length - 1)) / data.length)

  const xForIndex = (index: number) => padding.left + index * (barWidth + barGap)
  const yForValue = (value: number) => padding.top + innerHeight - (value / safeMax) * innerHeight

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

      {data.map((datum, index) => {
        const x = xForIndex(index)
        const valueY = yForValue(datum.value)
        const labelY = padding.top + innerHeight + 20
        return (
          <g key={`${datum.label}-${index}`}>
            <rect
              x={x}
              y={valueY}
              width={barWidth}
              height={Math.max(4, padding.top + innerHeight - valueY)}
              rx={8}
              ry={8}
              fill={color}
            />
            <text
              x={x + barWidth / 2}
              y={valueY - 10}
              textAnchor="middle"
              fontSize="13"
              fontWeight="600"
              fill={labelColor}
            >
              {datum.value}
            </text>
            <text
              x={x + barWidth / 2}
              y={labelY}
              textAnchor="middle"
              fontSize="12"
              fill="#6b7280"
            >
              {datum.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

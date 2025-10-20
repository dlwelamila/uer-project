'use client'

type TrendChartPoint = {
  label: string
  value: number
  comparison?: number | null
  note?: string
}

type Props = {
  points: TrendChartPoint[]
  width?: number
  height?: number
  padding?: { top: number; right: number; bottom: number; left: number }
  areaColor?: string
  axisColor?: string
  guideColor?: string
  labelColor?: string
  showQuarterGuides?: boolean
  showComparison?: boolean
  comparisonColor?: string
}

export default function TrendAreaChart({
  points,
  width = 860,
  height = 320,
  padding = { top: 36, right: 32, bottom: 56, left: 48 },
  areaColor = 'rgba(154,166,185,.40)',
  axisColor = '#BFC8D6',
  guideColor = '#A8C5E8',
  labelColor = '#D32F2F',
  showQuarterGuides = true,
  showComparison = false,
  comparisonColor = 'rgba(0,118,206,0.65)',
}: Props) {
  const W = width
  const H = height

  const safePoints = points && points.length ? points : []
  if (!safePoints.length) {
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full">
        <text x={width / 2} y={height / 2} textAnchor="middle" fontSize="14" fill="#6C7A89">
          No trend data available
        </text>
      </svg>
    )
  }
  const denominator = Math.max(safePoints.length - 1, 1)

  const innerW = W - padding.left - padding.right
  const innerH = H - padding.top - padding.bottom

  const baseValues = safePoints.map((point) => Math.max(0, Number(point.value ?? 0)))
  const comparisonValues = safePoints.map((point) =>
    point.comparison === null || point.comparison === undefined ? null : Number(point.comparison),
  )

  const maxComparison = showComparison
    ? Math.max(
        ...comparisonValues.filter((value): value is number => Number.isFinite(value)),
        0,
      )
    : 0

  const maxVal = Math.max(...baseValues, maxComparison, 1)

  const x = (i: number) => padding.left + (i / denominator) * innerW
  const y = (v: number) => padding.top + innerH - (v / maxVal) * innerH

  const areaPath = baseValues
    .map((value, index) => `${index === 0 ? 'M' : 'L'} ${x(index)} ${y(value)}`)
    .join(' ')
  const closedAreaPath = `${areaPath} L ${x(baseValues.length - 1)} ${padding.top + innerH} L ${x(0)} ${
    padding.top + innerH
  } Z`

  const comparisonPath = buildComparisonPath(comparisonValues, x, y)

  const peakIndex = indexOfExtreme(baseValues, 'max')
  const troughIndex = indexOfExtreme(baseValues, 'min')

  const quarterRects = showQuarterGuides ? buildQuarterRects(innerW, padding.left, padding.top, innerH) : []

  const deltas = baseValues.map((value, index) => (index === 0 ? null : value - baseValues[index - 1]))

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
      <rect x="0" y="0" width={W} height={H} fill="transparent" />

      {/* quarter shading */}
      {quarterRects.map((rect, idx) => (
        <rect
          key={`quarter-${idx}`}
          x={rect.x}
          y={rect.y}
          width={rect.width}
          height={rect.height}
          fill={rect.fill}
        />
      ))}

      {/* axes */}
      <line
        x1={padding.left}
        y1={padding.top + innerH}
        x2={padding.left + innerW}
        y2={padding.top + innerH}
        stroke={axisColor}
        strokeWidth="1"
      />
      <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + innerH} stroke={axisColor} strokeWidth="1" />

      {/* dashed quarter guides */}
      {showQuarterGuides &&
        [2, 5, 8].map((idx) => (
          <line
            key={`guide-${idx}`}
            x1={x(idx)}
            y1={padding.top}
            x2={x(idx)}
            y2={padding.top + innerH}
            stroke={guideColor}
            strokeDasharray="4 4"
            strokeWidth="1"
            opacity={0.65}
          />
        ))}

      {/* primary area */}
      <path d={closedAreaPath} fill={areaColor} />

      {/* comparison line */}
      {showComparison && comparisonPath && (
        <path
          d={comparisonPath}
          fill="none"
          stroke={comparisonColor}
          strokeWidth={2}
          strokeDasharray="6 4"
          opacity={0.8}
        />
      )}

      {/* peak annotation */}
      {peakIndex >= 0 && (
        <Annotation
          x={x(peakIndex)}
          y={y(baseValues[peakIndex])}
          label={`Peak ${baseValues[peakIndex]}`}
          direction="up"
        />
      )}

      {/* trough annotation */}
      {troughIndex >= 0 && troughIndex !== peakIndex && (
        <Annotation
          x={x(troughIndex)}
          y={y(baseValues[troughIndex])}
          label={`Low ${baseValues[troughIndex]}`}
          direction="down"
        />
      )}

      {/* red point labels & note markers */}
      {safePoints.map((point, index) => (
        <g key={`point-${index}`}>
          <text
            x={x(index)}
            y={y(baseValues[index]) - 8}
            textAnchor="middle"
            fontSize="12"
            fontWeight="600"
            fill={labelColor}
          >
            {baseValues[index]}
          </text>

          {point.note && point.note.trim().length > 0 && (
            <g transform={`translate(${x(index)}, ${y(baseValues[index]) - 24})`}>
              <circle r="8" fill="#005A9E" opacity={0.85} />
              <text
                x="0"
                y="4"
                textAnchor="middle"
                fontSize="10"
                fontWeight="600"
                fill="#ffffff"
              >
                i
              </text>
              <title>{point.note}</title>
            </g>
          )}
        </g>
      ))}

      {/* month labels */}
      {safePoints.map((point, index) => (
        <text
          key={`month-${point.label}-${index}`}
          x={x(index)}
          y={padding.top + innerH + 16}
          textAnchor="middle"
          fontSize="11"
          fill="#6C7A89"
        >
          {point.label}
        </text>
      ))}

      {/* delta tags */}
      {deltas.map((delta, index) => {
        if (delta === null) return null
        const label = delta > 0 ? `+${delta}` : `${delta}`
        const color = delta > 0 ? '#C62828' : delta < 0 ? '#2E7D32' : '#5B6B7C'
        return (
          <text
            key={`delta-${index}`}
            x={x(index)}
            y={padding.top + innerH + 32}
            textAnchor="middle"
            fontSize="10"
            fontWeight="600"
            fill={color}
          >
            {label}
          </text>
        )
      })}
    </svg>
  )
}

function buildComparisonPath(values: Array<number | null>, x: (i: number) => number, y: (v: number) => number) {
  let path = ''
  let penDown = false

  values.forEach((value, index) => {
    if (value === null || value === undefined || !Number.isFinite(value)) {
      penDown = false
      return
    }
    const command = penDown ? 'L' : 'M'
    path += `${command} ${x(index)} ${y(value)} `
    penDown = true
  })

  return path.trim()
}

function indexOfExtreme(values: number[], mode: 'min' | 'max') {
  if (!values.length) return -1
  let index = 0
  for (let i = 1; i < values.length; i += 1) {
    if (mode === 'max') {
      if (values[i] > values[index]) index = i
    } else if (values[i] < values[index]) {
      index = i
    }
  }
  return index
}

function buildQuarterRects(innerW: number, left: number, top: number, innerH: number) {
  const quarterWidth = innerW / 4
  const shades = ['rgba(240,245,255,0.45)', 'rgba(240,245,255,0.25)']

  return Array.from({ length: 4 }, (_, quarter) => ({
    x: left + quarter * quarterWidth,
    y: top,
    width: quarterWidth,
    height: innerH,
    fill: shades[quarter % shades.length],
  }))
}

function Annotation({ x, y, label, direction }: { x: number; y: number; label: string; direction: 'up' | 'down' }) {
  const offset = direction === 'up' ? -32 : 32
  const pointerY = y + (direction === 'up' ? -6 : 6)
  const boxY = pointerY + offset
  const boxHeight = 22
  const rectY = direction === 'up' ? boxY : boxY - boxHeight
  const textY = rectY + boxHeight / 2 + 4

  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={pointerY} stroke="#005A9E" strokeWidth="1.5" strokeDasharray="3 3" />
      <rect
        x={x - 48}
        y={rectY}
        width={96}
        height={boxHeight}
        rx={6}
        ry={6}
        fill="#005A9E"
        opacity={0.9}
      />
      <text
        x={x}
        y={textY}
        textAnchor="middle"
        fontSize="11"
        fontWeight="600"
        fill="#ffffff"
      >
        {label}
      </text>
    </g>
  )
}

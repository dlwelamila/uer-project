'use client'

export default function StackedBar({
  data,
  colors,
  width = 480,
  height = 22,
  radius = 4
}:{
  data: number[]
  colors: string[]
  width?: number
  height?: number
  radius?: number
}) {
  const total = data.reduce((a,b)=>a+b,0) || 1
  const W = width, H = height
  let acc = 0

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* pale rounded track (Dell bar) */}
      <rect x="0" y="0" width={W} height={H} rx={radius} ry={radius} fill="#EEF2F7" />
      {data.map((v, i) => {
        const fraction = v / total
        const w = fraction * W
        const pct = Math.round(fraction * 100)
        const showLabel = pct > 0 && w >= 6
        const midX = acc + w / 2
        const textColor = getTextColor(colors[i])

        const segment = (
          <g key={i}>
            <rect
              x={acc}
              y="0"
              width={w}
              height={H}
              rx={i === 0 ? radius : 0}
              ry={i === 0 ? radius : 0}
              fill={colors[i]}
            />
            {showLabel && (
              <text
                x={midX}
                y={H / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={Math.max(9, Math.min(12, w / (String(pct).length + 1)))}
                fontWeight="600"
                fill={textColor}
                stroke="rgba(15,23,42,0.35)"
                strokeWidth="0.6"
                style={{ paintOrder: 'stroke' }}
              >
                {pct}%
              </text>
            )}
          </g>
        )

        acc += w
        return segment
      })}
    </svg>
  )
}

function getTextColor(hex: string) {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) {
    return '#0f172a'
  }

  let r = 0; let g = 0; let b = 0
  if (hex.length === 7) {
    r = parseInt(hex.slice(1, 3), 16)
    g = parseInt(hex.slice(3, 5), 16)
    b = parseInt(hex.slice(5, 7), 16)
  } else if (hex.length === 4) {
    r = parseInt(hex.slice(1, 2).repeat(2), 16)
    g = parseInt(hex.slice(2, 3).repeat(2), 16)
    b = parseInt(hex.slice(3, 4).repeat(2), 16)
  } else {
    return '#0f172a'
  }

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6 ? '#0f172a' : '#ffffff'
}

'use client'

export default function Donut({
  data,
  colors,
  strokeWidth = 16,
  className = ''
}:{
  data: number[]
  colors: string[]
  strokeWidth?: number
  className?: string
}) {
  const sum = data.reduce((a,b)=>a+b,0) || 1
  const norm = data.map(v=>v/sum)
  const R = 60
  const C = 2*Math.PI*R

  let offset = 0
  return (
    <svg viewBox="-80 -80 160 160" className={className}>
      {/* white center like Dell ring */}
      <circle r={R} cx="0" cy="0" fill="white" />
      {/* segments */}
      {norm.map((p, i) => {
        const len = C * p
        const dasharray = `${len} ${C - len}`
        const startOffset = offset
        offset += len

        return (
          <g key={i}>
            <circle
              r={R}
              cx="0"
              cy="0"
              fill="transparent"
              stroke={colors[i]}
              strokeWidth={strokeWidth}
              strokeDasharray={dasharray}
              strokeDashoffset={-startOffset}
              transform="rotate(-90)"
            />
          </g>
        )
      })}
    </svg>
  )
}

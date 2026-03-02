interface Segment {
  label: string
  value: number
  color: string
}

interface Props {
  segments: Segment[]
  total: number
}

export default function DonutChart({ segments, total }: Props) {
  if (total === 0) return null

  const size = 200
  const strokeWidth = 28
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const cx = size / 2
  const cy = size / 2

  let accumulatedOffset = 0
  const arcs = segments
    .filter((s) => s.value > 0)
    .map((segment) => {
      const pct = segment.value / total
      const length = pct * circumference
      const gap = 3
      const offset = accumulatedOffset
      accumulatedOffset += length + gap
      return { ...segment, pct, length, offset, gap }
    })

  return (
    <div
      className="rounded-xl p-6 transition-colors duration-300 hover:brightness-105"
      style={{ background: 'var(--t-surface)', border: '1px solid var(--t-border)' }}
    >
      <h3 className="mb-6 text-sm font-medium" style={{ color: 'var(--t-muted)' }}>Distribuição de leads</h3>

      <div className="flex items-center justify-center gap-10">
        <div className="relative">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth={strokeWidth}
            />
            {arcs.map((arc) => (
              <circle
                key={arc.label}
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke={arc.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${arc.length} ${circumference}`}
                strokeDashoffset={-arc.offset}
                strokeLinecap="round"
                style={{
                  transform: 'rotate(-90deg)',
                  transformOrigin: '50% 50%',
                  opacity: 1,
                  transition: 'stroke-dasharray 700ms ease',
                }}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-semibold tracking-tight" style={{ color: 'var(--t-text)' }}>{total}</span>
            <span className="text-[11px]" style={{ color: 'var(--t-muted2)' }}>total</span>
          </div>
        </div>

        <div className="space-y-3">
          {arcs.map((arc) => (
            <div key={arc.label} className="flex items-center gap-3">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: arc.color, opacity: 0.8 }}
              />
              <div>
                <p className="text-[13px]" style={{ color: 'var(--t-text)' }}>
                  {arc.value}
                  <span className="ml-1" style={{ color: 'var(--t-muted2)' }}>
                    ({(arc.pct * 100).toFixed(0)}%)
                  </span>
                </p>
                <p className="text-[11px]" style={{ color: 'var(--t-muted2)' }}>{arc.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

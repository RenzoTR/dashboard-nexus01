interface Stage {
  stage: string
  count: number
}

const stageColors: Record<string, string> = {
  Novos: '#ffffff',
  Contatados: '#888888',
  Proposta: '#666666',
  Fechados: '#22c55e',
  Perdidos: '#dc2626',
}

export default function FunnelChart({ data, total }: { data: Stage[]; total: number }) {
  if (total === 0) return null

  const max = Math.max(...data.map((s) => s.count), 1)

  return (
    <div
      className="rounded-xl p-6 transition-colors duration-300 hover:brightness-105"
      style={{ background: 'var(--t-surface)', border: '1px solid var(--t-border)' }}
    >
      <h3 className="mb-6 text-sm font-medium" style={{ color: 'var(--t-muted)' }}>Funil de conversão</h3>
      <div className="space-y-4">
        {data.map((stage) => {
          const pct = total > 0 ? ((stage.count / total) * 100).toFixed(1) : '0'
          const width = max > 0 ? (stage.count / max) * 100 : 0
          const color = stageColors[stage.stage] || '#666666'

          return (
            <div key={stage.stage} className="group rounded-lg p-2 transition-colors" style={{ ['--hover-bg' as string]: 'var(--t-hover-bg)' }}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[13px]" style={{ color: 'var(--t-muted2)' }}>{stage.stage}</span>
                <span className="text-[13px] font-medium tabular-nums" style={{ color: 'var(--t-text)' }}>
                  {stage.count}
                  <span className="ml-1" style={{ color: 'var(--t-muted2)' }}>({pct}%)</span>
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/[0.04]">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.max(width, 1)}%`,
                    backgroundColor: color,
                    opacity: 1,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

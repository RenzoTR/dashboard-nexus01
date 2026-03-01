import { ChevronDown, ChevronUp, Mail, Phone, Trash2 } from 'lucide-react'
import type { LeadItem, LeadStatus } from '../../hooks/useLeads'
import { SkeletonTable } from '../ui/Skeleton'
import { formatCurrency, formatPhone, truncate } from '../../utils/format'

interface Props {
  leads: LeadItem[]
  loading: boolean
  selected: Set<string>
  onSelect: (id: string) => void
  onSelectAll: () => void
  onPatch: (id: string, payload: Record<string, unknown>) => void
  onDelete: (id: string) => void
  onDetail: (id: string) => void
  sortBy: string
  sortDir: string
  onSort: (col: string) => void
}

const columns = [
  { key: 'status', label: 'Status', width: 'w-28', sortable: true },
  { key: 'empresa', label: 'Empresa', width: 'min-w-[220px]', sortable: true },
  { key: 'telefone', label: 'Telefone', width: 'w-44', sortable: false },
  { key: 'email', label: 'Email', width: 'w-52', sortable: false },
  { key: 'cidade', label: 'Cidade', width: 'w-32', sortable: true },
  { key: 'score', label: 'Score', width: 'w-28', sortable: true },
  { key: 'ticket_estimado', label: 'Ticket', width: 'w-34', sortable: true },
  { key: 'chance_fechamento', label: 'Chance', width: 'w-24', sortable: true },
  { key: 'proximo_follow_up', label: 'Follow-up', width: 'w-40', sortable: false },
  { key: 'ultimo_contato', label: 'Último contato', width: 'w-40', sortable: false },
  { key: 'observacoes', label: 'Observações', width: 'w-52', sortable: false },
]

const statusOptions: { value: LeadStatus; label: string }[] = [
  { value: 'novos', label: 'Novos' },
  { value: 'contatados', label: 'Contatados' },
  { value: 'proposta', label: 'Proposta' },
  { value: 'fechados', label: 'Fechados' },
  { value: 'perdidos', label: 'Perdidos' },
]

function SortIcon({ col, sortBy, sortDir }: { col: string; sortBy: string; sortDir: string }) {
  if (col !== sortBy) return null
  return sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
}

function scoreColor(score: number): string {
  if (score >= 70) return '#22c55e'
  if (score >= 40) return '#eab308'
  return '#dc2626'
}

function ScoreBar({ score }: { score: number }) {
  const color = scoreColor(score)
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/[0.08]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(score, 100)}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[12px] font-medium tabular-nums" style={{ color }}>{score}</span>
    </div>
  )
}

function ChanceIndicator({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const color = scoreColor(value)
  const radius = 12
  const stroke = 3
  const circumference = 2 * Math.PI * radius
  const filled = (value / 100) * circumference

  return (
    <div className="flex items-center gap-2">
      <svg width={30} height={30} viewBox="0 0 30 30">
        <circle cx={15} cy={15} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <circle
          cx={15} cy={15} r={radius} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dasharray 300ms ease' }}
        />
      </svg>
      <input
        type="number"
        min={0}
        max={100}
        defaultValue={value}
        onBlur={(e) => onChange(Number(e.target.value) || 0)}
        className="w-12 rounded border border-white/[0.08] bg-black px-1.5 py-0.5 text-[11px] text-[#cccccc] text-center"
      />
      <span className="text-[11px] text-[#999999]">%</span>
    </div>
  )
}

export default function LeadsTable({
  leads,
  loading,
  selected,
  onSelect,
  onSelectAll,
  onPatch,
  onDelete,
  onDetail,
  sortBy,
  sortDir,
  onSort,
}: Props) {
  const allSelected = leads.length > 0 && leads.every((lead) => selected.has(lead.id))

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.10] bg-[#0a0a0a]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1680px] text-[13px]">
          <thead>
            <tr className="border-b border-white/[0.10]">
              <th className="w-10 px-3 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onSelectAll}
                  className="accent-white"
                />
              </th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => {
                    if (column.sortable) onSort(column.key)
                  }}
                  className={`select-none px-3 py-3 text-left text-[11px] font-medium uppercase tracking-[0.12em] text-[#999999] ${column.width} ${
                    column.sortable ? 'cursor-pointer transition hover:text-white' : ''
                  }`}
                >
                  <span className="inline-flex items-center gap-1">
                    {column.label}
                    {column.sortable ? <SortIcon col={column.key} sortBy={sortBy} sortDir={sortDir} /> : null}
                  </span>
                </th>
              ))}
              <th className="w-12 px-3 py-3" />
            </tr>
          </thead>

          <tbody className="divide-y divide-white/[0.06]">
            {loading ? (
              <SkeletonTable rows={10} cols={columns.length + 2} />
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} className="px-6 py-16 text-center text-[13px] text-[#999999]">
                  Nenhum lead encontrado
                </td>
              </tr>
            ) : (
              leads.map((lead) => {
                const tel = lead.telefone || ''
                const cleanTel = formatPhone(tel)

                return (
                  <tr key={lead.id} className="group transition-colors hover:bg-white/[0.03]">
                    <td className="px-3 py-2.5">
                      <input
                        type="checkbox"
                        checked={selected.has(lead.id)}
                        onChange={() => onSelect(lead.id)}
                        className="accent-white"
                      />
                    </td>

                    <td className="px-3 py-2.5 align-top">
                      <select
                        value={lead.status}
                        onChange={(e) => onPatch(lead.id, { status: e.target.value })}
                        className="block rounded border border-white/[0.12] bg-black px-2 py-1 text-[11px] font-medium text-[#cccccc]"
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value} className="bg-[#1a1a1a] text-[#e0e0e0]">
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => onDetail(lead.id)}
                        className="max-w-[240px] truncate text-left font-medium text-white transition hover:text-[#cccccc]"
                        title={lead.empresa}
                      >
                        {truncate(lead.empresa || '-', 42)}
                      </button>
                      <p className="mt-1 truncate text-[11px] text-[#999999]">{lead.nicho || '-'}</p>
                    </td>

                    <td className="px-3 py-2.5">
                      {tel ? (
                        <a href={`tel:${cleanTel}`} className="inline-flex items-center gap-1.5 text-[#888888] transition hover:text-white">
                          <Phone className="h-3 w-3 text-[#777777]" />
                          {tel}
                        </a>
                      ) : (
                        <span className="text-[#555555]">-</span>
                      )}
                    </td>

                    <td className="px-3 py-2.5">
                      {lead.email ? (
                        <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-1 text-[12px] text-[#888888] transition hover:text-white">
                          <Mail className="h-3 w-3" />
                          {truncate(lead.email, 28)}
                        </a>
                      ) : (
                        <span className="text-[#555555]">-</span>
                      )}
                    </td>

                    <td className="max-w-[140px] truncate px-3 py-2.5 text-[12px] text-[#888888]" title={lead.cidade || ''}>
                      {lead.cidade || '-'}
                      <div className="text-[10px] text-[#777777]">{lead.pais || '-'}</div>
                    </td>

                    <td className="px-3 py-2.5">
                      <ScoreBar score={lead.score || 0} />
                    </td>

                    <td className="px-3 py-2.5">
                      <input
                        type="number"
                        min={0}
                        defaultValue={lead.ticket_estimado || 0}
                        onBlur={(e) => onPatch(lead.id, { ticket_estimado: Number(e.target.value) || 0 })}
                        className="w-28 rounded border border-white/[0.12] bg-black px-2 py-1 text-[12px] text-[#cccccc]"
                      />
                      <p className="mt-1 text-[10px] text-[#999999]">{formatCurrency(lead.ticket_estimado || 0)}</p>
                    </td>

                    <td className="px-3 py-2.5">
                      <ChanceIndicator
                        value={lead.chance_fechamento || 0}
                        onChange={(v) => onPatch(lead.id, { chance_fechamento: v })}
                      />
                    </td>

                    <td className="px-3 py-2.5">
                      <input
                        type="datetime-local"
                        defaultValue={toDateTimeLocal(lead.proximo_follow_up)}
                        onBlur={(e) => onPatch(lead.id, { proximo_follow_up: e.target.value || null })}
                        className="w-40 rounded border border-white/[0.12] bg-black px-2 py-1 text-[12px] text-[#cccccc]"
                      />
                    </td>

                    <td className="px-3 py-2.5">
                      <input
                        type="datetime-local"
                        defaultValue={toDateTimeLocal(lead.ultimo_contato)}
                        onBlur={(e) => onPatch(lead.id, { ultimo_contato: e.target.value || null })}
                        className="w-40 rounded border border-white/[0.12] bg-black px-2 py-1 text-[12px] text-[#cccccc]"
                      />
                    </td>

                    <td className="px-3 py-2.5">
                      <textarea
                        defaultValue={lead.observacoes || ''}
                        onBlur={(e) => onPatch(lead.id, { observacoes: e.target.value })}
                        className="h-14 w-52 resize-none rounded border border-white/[0.12] bg-black px-2 py-1 text-[12px] text-[#cccccc]"
                      />
                    </td>

                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Excluir este lead?')) onDelete(lead.id)
                        }}
                        className="text-[#555555] opacity-0 transition group-hover:opacity-100 hover:text-nexus-red"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function toDateTimeLocal(value?: string | null): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

import { CalendarClock, CircleDollarSign, Globe, Mail, MapPin, MessageCircle, Phone, Percent, User, X } from 'lucide-react'
import Badge from '../ui/Badge'
import { formatCurrency, formatDate, formatPhone } from '../../utils/format'

interface Props {
  lead: Record<string, unknown> | null
  onClose: () => void
}

function Row({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  href?: string
}) {
  if (!value) return null

  return (
    <div className="flex items-start gap-3 border-b border-white/[0.06] py-3">
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#777777]" />
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#999999]">{label}</p>
        {href ? (
          <a href={href} target="_blank" rel="noreferrer" className="break-all text-[13px] text-white transition hover:text-[#cccccc]">
            {value}
          </a>
        ) : (
          <p className="break-all text-[13px] text-white">{value}</p>
        )}
      </div>
    </div>
  )
}

function asText(value: unknown): string {
  if (value == null) return ''
  return String(value)
}

function scoreColor(score: number): string {
  if (score >= 70) return '#22c55e'
  if (score >= 40) return '#eab308'
  return '#dc2626'
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h4 className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#999999] first:mt-0">
      {children}
    </h4>
  )
}

export default function LeadDetailModal({ lead, onClose }: Props) {
  if (!lead) return null

  const phone = asText(lead.telefone)
  const cleanPhone = formatPhone(phone)
  const score = Number(lead.score || 0)
  const color = scoreColor(score)

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div
        className="relative max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-xl border border-white/[0.10] bg-[#0a0a0a] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-white/[0.10] p-6">
          <div>
            <h3 className="text-lg font-semibold text-white">{asText(lead.empresa) || 'Lead'}</h3>
            <div className="mt-2 flex items-center gap-2">
              <Badge status={asText(lead.status) || 'novos'} />
              <span className="text-[12px] text-[#999999]">{formatDate(asText(lead.created_at))}</span>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-[#999999] transition hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Score bar */}
        <div className="border-b border-white/[0.06] px-6 py-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#999999]">Score</span>
            <span className="text-[14px] font-semibold tabular-nums" style={{ color }}>{score}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.08]">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(score, 100)}%`, backgroundColor: color }}
            />
          </div>
        </div>

        <div className="p-6">
          <SectionTitle>Contato</SectionTitle>
          <Row icon={Phone} label="Telefone" value={phone} href={cleanPhone ? `tel:${cleanPhone}` : undefined} />
          {cleanPhone ? <Row icon={MessageCircle} label="WhatsApp" value={phone} href={`https://wa.me/${cleanPhone.replace('+', '')}`} /> : null}
          <Row icon={Mail} label="Email" value={asText(lead.email)} href={asText(lead.email) ? `mailto:${asText(lead.email)}` : undefined} />
          <Row icon={Globe} label="Site" value={asText(lead.site)} href={asText(lead.site)} />

          <SectionTitle>Localização</SectionTitle>
          <Row icon={User} label="Empresa" value={asText(lead.empresa)} />
          <Row icon={MapPin} label="Cidade" value={asText(lead.cidade)} />
          <Row icon={Globe} label="País" value={asText(lead.pais)} />
          <Row icon={Globe} label="Nicho" value={asText(lead.nicho)} />

          <SectionTitle>Comercial</SectionTitle>
          <Row icon={CircleDollarSign} label="Ticket estimado" value={formatCurrency(Number(lead.ticket_estimado || 0))} />
          <Row icon={Percent} label="Chance de fechamento" value={`${Number(lead.chance_fechamento || 0)}%`} />
          <Row icon={CalendarClock} label="Follow-up" value={formatDate(asText(lead.proximo_follow_up))} />
          <Row icon={CalendarClock} label="Último contato" value={formatDate(asText(lead.ultimo_contato))} />
        </div>

        {asText(lead.observacoes) ? (
          <div className="px-6 pb-6">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.1em] text-[#999999]">Observações</p>
            <p className="rounded-lg border border-white/[0.10] bg-white/[0.04] px-3 py-2.5 text-[13px] text-[#cccccc]">
              {asText(lead.observacoes)}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

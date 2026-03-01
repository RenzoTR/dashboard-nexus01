import { PhoneCall, Trash2, Trophy, XCircle } from 'lucide-react'

interface Props {
  count: number
  onMark: (status: string) => void
  onDelete: () => void
}

export default function BulkActions({ count, onMark, onDelete }: Props) {
  if (count === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-xl border border-white/[0.12] bg-[#0a0a0a]/90 px-5 py-3 shadow-2xl backdrop-blur-lg">
        <span className="mr-1 text-[13px] font-medium text-white">{count} selecionados</span>
        <ActionBtn onClick={() => onMark('contatados')} icon={PhoneCall} label="Contatado" />
        <ActionBtn onClick={() => onMark('fechados')} icon={Trophy} label="Fechado" />
        <ActionBtn onClick={() => onMark('perdidos')} icon={XCircle} label="Perdido" />
        <div className="mx-1 h-5 w-px bg-white/[0.10]" />
        <ActionBtn onClick={onDelete} icon={Trash2} label="Excluir" danger />
      </div>
    </div>
  )
}

function ActionBtn({
  onClick,
  icon: Icon,
  label,
  danger,
}: {
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  label: string
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-md border border-white/[0.12] px-2.5 py-1.5 text-[12px] font-medium transition hover:border-white/[0.20] ${
        danger ? 'text-nexus-red hover:text-red-400' : 'text-[#999999] hover:text-white'
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  )
}

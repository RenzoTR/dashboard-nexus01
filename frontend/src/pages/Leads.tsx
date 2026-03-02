import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCcw,
  Search,
} from 'lucide-react'
import LeadsTable from '../components/leads/LeadsTable'
import BulkActions from '../components/leads/BulkActions'
import LeadDetailModal from '../components/leads/LeadDetailModal'
import { useLeads } from '../hooks/useLeads'
import { useToast } from '../components/ui/Toast'
import { api, getToken } from '../services/api'
import { useSearchParams } from 'react-router-dom'

const RAW_API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || '').trim()
const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, '')

const statusPills = [
  { value: 'todos', label: 'Todos' },
  { value: 'novos', label: 'Novos' },
  { value: 'contatados', label: 'Contatados' },
  { value: 'proposta', label: 'Proposta' },
  { value: 'fechados', label: 'Fechados' },
  { value: 'perdidos', label: 'Perdidos' },
]

export default function Leads() {
  const {
    leads,
    countries,
    total,
    pages,
    loading,
    error,
    filters,
    setFilter,
    resetFilters,
    toggleSort,
    reload,
  } = useLeads()
  const toast = useToast()
  const [searchParams] = useSearchParams()

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [busyAction, setBusyAction] = useState(false)
  const searchTimerRef = useRef<number | null>(null)

  useEffect(() => {
    const statusParam = searchParams.get('status')
    if (statusParam && statusParam !== filters.status) {
      setFilter('status', statusParam)
    }
  }, [searchParams])

  useEffect(() => {
    setSearchInput(filters.search)
  }, [filters.search])

  useEffect(() => {
    setSelected((prev) => {
      const validIds = new Set(leads.map((lead) => lead.id))
      return new Set([...prev].filter((id) => validIds.has(id)))
    })
  }, [leads])

  useEffect(() => {
    if (searchTimerRef.current !== null) window.clearTimeout(searchTimerRef.current)
    searchTimerRef.current = window.setTimeout(() => {
      setFilter('search', searchInput)
    }, 350)
    return () => {
      if (searchTimerRef.current !== null) window.clearTimeout(searchTimerRef.current)
    }
  }, [searchInput, setFilter])

  const patchLead = async (id: string, payload: Record<string, unknown>) => {
    try {
      await api(`/api/leads/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
      await reload()
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Falha ao atualizar lead', 'error')
    }
  }

  const bulkMark = async (status: string) => {
    const leadIds = [...selected]
    if (!leadIds.length) return
    try {
      setBusyAction(true)
      await api('/api/leads/bulk/status', {
        method: 'POST',
        body: JSON.stringify({ lead_ids: leadIds, status }),
      })
      toast(`${leadIds.length} leads atualizados`, 'ok')
      setSelected(new Set())
      await reload()
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Falha ao atualizar leads', 'error')
    } finally {
      setBusyAction(false)
    }
  }

  const deleteOne = async (id: string) => {
    try {
      setBusyAction(true)
      await api(`/api/leads/${id}`, { method: 'DELETE' })
      toast('Lead removido', 'ok')
      await reload()
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Falha ao remover lead', 'error')
    } finally {
      setBusyAction(false)
    }
  }

  const bulkDelete = async () => {
    const leadIds = [...selected]
    if (!leadIds.length) return
    if (!window.confirm(`Excluir ${leadIds.length} leads permanentemente?`)) return
    try {
      setBusyAction(true)
      await Promise.all(leadIds.map((id) => api(`/api/leads/${id}`, { method: 'DELETE' })))
      toast(`${leadIds.length} leads removidos`, 'ok')
      setSelected(new Set())
      await reload()
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Falha ao excluir leads', 'error')
    } finally {
      setBusyAction(false)
    }
  }

  const openDetail = async (id: string) => {
    try {
      const lead = await api<Record<string, unknown>>(`/api/leads/${id}`)
      setDetail(lead)
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Falha ao carregar detalhes', 'error')
    }
  }

  const exportCsv = async () => {
    try {
      const token = getToken()
      const exportUrl = API_BASE_URL ? `${API_BASE_URL}/api/leads/export/csv` : '/api/leads/export/csv'
      const response = await fetch(exportUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include',
      })
      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || 'Falha ao exportar CSV')
      }
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'leads.csv'
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      toast('CSV exportado com sucesso', 'ok')
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Falha ao exportar CSV', 'error')
    }
  }

  const paginationPages = buildPageNumbers(filters.page, pages)

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" style={{ color: 'var(--t-text)' }}>Leads</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--t-muted2)' }}>{total} leads encontrados</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => { void reload() }}
            className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] font-medium transition hover:opacity-80"
            style={{ border: '1px solid var(--t-input-border)', background: 'var(--t-input-bg)', color: 'var(--t-muted2)' }}
          >
            <RefreshCcw className={`h-4 w-4 ${loading || busyAction ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          <button
            type="button"
            onClick={() => { void exportCsv() }}
            className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] font-medium transition hover:opacity-80"
            style={{ border: '1px solid var(--t-input-border)', background: 'var(--t-input-bg)', color: 'var(--t-muted2)' }}
          >
            <Download className="h-4 w-4" />
            CSV
          </button>
        </div>
      </div>

      {/* Status pill filters */}
      <div className="flex flex-wrap items-center gap-2">
        {statusPills.map((pill) => (
          <button
            key={pill.value}
            type="button"
            onClick={() => setFilter('status', pill.value)}
            className="rounded-full px-4 py-1.5 text-[13px] font-medium transition"
            style={
              filters.status === pill.value
                ? { background: 'var(--t-pill-active-bg)', color: 'var(--t-pill-active-text)' }
                : { border: '1px solid var(--t-input-border)', color: 'var(--t-muted2)' }
            }
          >
            {pill.label}
          </button>
        ))}
      </div>

      <div
        className="rounded-xl p-5 transition-colors duration-300"
        style={{ background: 'var(--t-surface)', border: '1px solid var(--t-input-border)' }}
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-[0.12em]" style={{ color: 'var(--t-muted2)' }}>
            Filtros
          </span>
          <button
            type="button"
            onClick={() => {
              resetFilters()
              setSearchInput('')
            }}
            className="text-[12px] transition hover:opacity-80"
            style={{ color: 'var(--t-muted2)' }}
          >
            Limpar
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <Field label="País">
            <select value={filters.pais} onChange={(e) => setFilter('pais', e.target.value)} className="input-base">
              <option value="">Todos</option>
              {countries.map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </Field>
          <Field label="Cidade">
            <input value={filters.cidade} onChange={(e) => setFilter('cidade', e.target.value)} className="input-base" placeholder="Cidade" />
          </Field>
          <Field label="Nicho">
            <input value={filters.nicho} onChange={(e) => setFilter('nicho', e.target.value)} className="input-base" placeholder="Nicho" />
          </Field>
        </div>

        <div className="mt-3">
          <label className="block text-[11px] font-medium uppercase tracking-[0.12em]" style={{ color: 'var(--t-muted2)' }}>
            Busca
            <span
              className="mt-1.5 flex items-center gap-2 rounded-lg px-3 py-2.5"
              style={{ border: '1px solid var(--t-input-border)', background: 'var(--t-input-bg)' }}
            >
              <Search className="h-4 w-4" style={{ color: 'var(--t-muted3)' }} />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-transparent text-sm"
                style={{ color: 'var(--t-text)' }}
                placeholder="Empresa, email, telefone, cidade..."
              />
            </span>
          </label>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-nexus-red/20 bg-nexus-red/5 px-4 py-3 text-sm text-nexus-red">
          {error}
        </div>
      ) : null}

      <div className="space-y-3">
        <p className="text-[11px]" style={{ color: 'var(--t-muted3)' }}>Deslize horizontalmente para ver todos os campos</p>
        <LeadsTable
          leads={leads}
          loading={loading}
          selected={selected}
          onSelect={(id) => {
            setSelected((prev) => {
              const next = new Set(prev)
              if (next.has(id)) next.delete(id)
              else next.add(id)
              return next
            })
          }}
          onSelectAll={() => {
            setSelected((prev) => (prev.size === leads.length ? new Set() : new Set(leads.map((lead) => lead.id))))
          }}
          onPatch={patchLead}
          onDelete={deleteOne}
          onDetail={openDetail}
          sortBy={filters.sort_by}
          sortDir={filters.sort_dir}
          onSort={toggleSort}
        />

        <div className="flex items-center justify-center gap-4 pt-2">
          {pages > 1 ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setFilter('page', Math.max(1, filters.page - 1))}
                disabled={filters.page <= 1}
                className="inline-flex items-center justify-center rounded-lg px-2.5 py-1.5 text-[13px] transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-30"
                style={{ border: '1px solid var(--t-input-border)', color: 'var(--t-muted)' }}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {paginationPages.map((p, i) =>
                p === '...' ? (
                  <span key={`ellipsis-${i}`} className="px-2 text-[13px]" style={{ color: 'var(--t-muted3)' }}>...</span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFilter('page', p as number)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[13px] font-medium tabular-nums transition"
                    style={
                      filters.page === p
                        ? { background: 'var(--t-pill-active-bg)', color: 'var(--t-pill-active-text)' }
                        : { border: '1px solid var(--t-input-border)', color: 'var(--t-muted)' }
                    }
                  >
                    {p}
                  </button>
                )
              )}
              <button
                type="button"
                onClick={() => setFilter('page', Math.min(pages, filters.page + 1))}
                disabled={filters.page >= pages}
                className="inline-flex items-center justify-center rounded-lg px-2.5 py-1.5 text-[13px] transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-30"
                style={{ border: '1px solid var(--t-input-border)', color: 'var(--t-muted)' }}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}
          <div className="flex items-center gap-2">
            <span className="text-[12px]" style={{ color: 'var(--t-muted2)' }}>Por página:</span>
            <select
              value={filters.per_page}
              onChange={(e) => setFilter('per_page', Number(e.target.value))}
              className="rounded-lg px-2 py-1.5 text-[13px]"
              style={{ border: '1px solid var(--t-input-border)', background: 'var(--t-bg)', color: 'var(--t-text-secondary)' }}
            >
              {[25, 50, 100, 200].map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <BulkActions count={selected.size} onMark={bulkMark} onDelete={bulkDelete} />
      <LeadDetailModal lead={detail} onClose={() => setDetail(null)} />
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-[11px] font-medium uppercase tracking-[0.12em]" style={{ color: 'var(--t-muted2)' }}>
      {label}
      <span className="mt-1.5 block">{children}</span>
    </label>
  )
}

function buildPageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | string)[] = []
  pages.push(1)
  if (current > 3) pages.push('...')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i)
  }
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
}

import { NavLink } from 'react-router-dom'
import { LayoutDashboard, LogOut, Users, UserCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

const links = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/leads', icon: Users, label: 'Leads' },
  { to: '/app/conta', icon: UserCircle, label: 'Conta' },
]

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { logout } = useAuth()

  return (
    <>
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/80 lg:hidden"
          onClick={onClose}
          aria-label="Fechar menu"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[220px] flex-col transition-all duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'var(--t-sidebar)',
          borderRight: '1px solid var(--t-border)',
        }}
      >
        <div className="flex h-16 flex-col justify-center px-6">
          <span className="text-base font-bold tracking-tight" style={{ color: 'var(--t-text)' }}>LeadManager</span>
          <span className="text-[9px] font-medium tracking-wider" style={{ color: 'var(--t-muted2)' }}>Powered by NexusCoding</span>
        </div>

        <nav className="flex-1 px-3 pt-2">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors ${
                  isActive
                    ? 'text-white'
                    : 'hover:opacity-90'
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? 'var(--t-text)' : 'var(--t-muted2)',
                background: isActive ? 'var(--t-hover-bg)' : undefined,
              })}
            >
              <Icon className="h-[18px] w-[18px]" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3" style={{ borderTop: '1px solid var(--t-border)' }}>
          <button
            type="button"
            onClick={() => {
              void logout()
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors hover:text-nexus-red"
            style={{ color: 'var(--t-muted2)' }}
          >
            <LogOut className="h-[18px] w-[18px]" />
            Sair
          </button>
        </div>
      </aside>
    </>
  )
}

import { Menu } from 'lucide-react'

interface HeaderProps {
  title: string
  onOpenSidebar: () => void
}

export default function Header({ onOpenSidebar }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-30 backdrop-blur-sm transition-colors duration-300"
      style={{ background: 'var(--t-header-bg)', borderBottom: '1px solid var(--t-border)' }}
    >
      <div className="flex h-14 items-center px-6 lg:px-10">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="mr-4 inline-flex h-8 w-8 items-center justify-center rounded-md transition hover:opacity-80 lg:hidden"
          style={{ color: 'var(--t-muted2)' }}
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}

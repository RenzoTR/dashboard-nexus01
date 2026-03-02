import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type ThemePalette = 'dark' | 'light' | 'dracula'

const THEME_LABELS: Record<ThemePalette, string> = {
  dark: 'Dark',
  light: 'Light',
  dracula: 'Dracula',
}

const THEME_VARS: Record<ThemePalette, Record<string, string>> = {
  dark: {
    '--t-bg': '#000000',
    '--t-surface': '#0a0a0a',
    '--t-card': '#111111',
    '--t-border': 'rgba(255,255,255,0.06)',
    '--t-sidebar': '#050505',
    '--t-text': '#ffffff',
    '--t-text-secondary': '#cccccc',
    '--t-muted': '#888888',
    '--t-muted2': '#999999',
    '--t-muted3': '#777777',
    '--t-muted4': '#666666',
    '--t-muted5': '#555555',
    '--t-input-bg': 'rgba(255,255,255,0.02)',
    '--t-input-border': 'rgba(255,255,255,0.08)',
    '--t-input-border-focus': 'rgba(255,255,255,0.25)',
    '--t-hover-bg': 'rgba(255,255,255,0.04)',
    '--t-hover-border': 'rgba(255,255,255,0.15)',
    '--t-bubble-user': 'rgba(255,255,255,0.06)',
    '--t-bubble-bot': 'rgba(255,255,255,0.03)',
    '--t-pill-active-bg': '#ffffff',
    '--t-pill-active-text': '#000000',
    '--t-header-bg': 'rgba(0,0,0,0.9)',
    '--t-select-option-bg': '#1a1a1a',
  },
  light: {
    '--t-bg': '#f0f2f5',
    '--t-surface': '#ffffff',
    '--t-card': '#ffffff',
    '--t-border': 'rgba(0,0,0,0.10)',
    '--t-sidebar': '#f8f9fa',
    '--t-text': '#1a1a2e',
    '--t-text-secondary': '#333333',
    '--t-muted': '#6b7280',
    '--t-muted2': '#6b7280',
    '--t-muted3': '#9ca3af',
    '--t-muted4': '#6b7280',
    '--t-muted5': '#6b7280',
    '--t-input-bg': '#ffffff',
    '--t-input-border': 'rgba(0,0,0,0.15)',
    '--t-input-border-focus': 'rgba(0,0,0,0.35)',
    '--t-hover-bg': 'rgba(0,0,0,0.04)',
    '--t-hover-border': 'rgba(0,0,0,0.20)',
    '--t-bubble-user': '#e8f4fd',
    '--t-bubble-bot': '#f3f4f6',
    '--t-pill-active-bg': '#1a1a2e',
    '--t-pill-active-text': '#ffffff',
    '--t-header-bg': 'rgba(240,242,245,0.92)',
    '--t-select-option-bg': '#ffffff',
  },
  dracula: {
    '--t-bg': '#282a36',
    '--t-surface': '#383a4a',
    '--t-card': '#44475a',
    '--t-border': 'rgba(98,114,164,0.35)',
    '--t-sidebar': '#21222c',
    '--t-text': '#f8f8f2',
    '--t-text-secondary': '#e0e0e0',
    '--t-muted': '#6272a4',
    '--t-muted2': '#8892b0',
    '--t-muted3': '#6272a4',
    '--t-muted4': '#6272a4',
    '--t-muted5': '#6272a4',
    '--t-input-bg': '#44475a',
    '--t-input-border': 'rgba(98,114,164,0.40)',
    '--t-input-border-focus': 'rgba(139,233,253,0.50)',
    '--t-hover-bg': 'rgba(255,255,255,0.06)',
    '--t-hover-border': 'rgba(98,114,164,0.60)',
    '--t-bubble-user': '#44475a',
    '--t-bubble-bot': '#383a4a',
    '--t-pill-active-bg': '#bd93f9',
    '--t-pill-active-text': '#282a36',
    '--t-header-bg': 'rgba(40,42,54,0.92)',
    '--t-select-option-bg': '#44475a',
  },
}

interface ThemeState {
  theme: ThemePalette
  setTheme: (t: ThemePalette) => void
  cycleTheme: () => ThemePalette
}

const ThemeContext = createContext<ThemeState>({
  theme: 'dark',
  setTheme: () => {},
  cycleTheme: () => 'dark',
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemePalette>(() => {
    const saved = localStorage.getItem('nexus-theme')
    if (saved === 'light' || saved === 'dracula') return saved
    return 'dark'
  })

  const applyVars = (t: ThemePalette) => {
    const vars = THEME_VARS[t]
    const root = document.documentElement
    for (const [key, val] of Object.entries(vars)) {
      root.style.setProperty(key, val)
    }
  }

  useEffect(() => {
    applyVars(theme)
  }, [theme])

  const setTheme = (t: ThemePalette) => {
    setThemeState(t)
    localStorage.setItem('nexus-theme', t)
  }

  const cycleTheme = (): ThemePalette => {
    const next: ThemePalette = theme === 'dark' ? 'light' : theme === 'light' ? 'dracula' : 'dark'
    setTheme(next)
    return next
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
export { THEME_LABELS }

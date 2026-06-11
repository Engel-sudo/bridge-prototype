import { useState } from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'bridge-theme'

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
}

/** Call once before render so the first paint uses the saved theme. */
export function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEY)
  applyTheme(saved === 'dark' ? 'dark' : 'light')
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(
    () => (document.documentElement.dataset.theme as Theme) || 'light'
  )
  function toggleTheme() {
    const next: Theme = theme === 'light' ? 'dark' : 'light'
    applyTheme(next)
    localStorage.setItem(STORAGE_KEY, next)
    setTheme(next)
  }
  return { theme, toggleTheme }
}

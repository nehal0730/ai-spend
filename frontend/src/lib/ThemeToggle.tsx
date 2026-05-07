import React from 'react'
import { useTheme } from './theme'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()

  return (
    <button
      aria-label="Toggle theme"
      onClick={toggle}
      className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
    >
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  )
}

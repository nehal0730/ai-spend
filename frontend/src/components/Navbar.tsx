import React from 'react'
import { Link } from 'react-router-dom'
import ThemeToggle from '../lib/ThemeToggle'

export default function Navbar() {
  return (
    <header className="border-b border-slate-200 dark:border-slate-800">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="text-lg font-semibold">
          AI Spend
        </Link>
        <div className="flex items-center gap-3">
          <nav className="hidden md:flex gap-4">
            <Link to="/">Dashboard</Link>
            <Link to="/audits">Audits</Link>
            <Link to="/team">Team</Link>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

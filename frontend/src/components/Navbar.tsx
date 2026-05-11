import React from 'react'
import { Link } from 'react-router-dom'
import ThemeToggle from '../lib/theme/ThemeToggle'
import { ChevronRight } from 'lucide-react'

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:bg-slate-900/80 dark:shadow-[0_8px_30px_rgba(2,6,23,0.35)]">
      <div className="container px-4 md:px-0 flex items-center justify-between h-16">
        <Link to="/" className="text-lg font-semibold hover:opacity-80 transition-opacity">
          AI Spend
        </Link>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-8 text-sm">
            <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">How it works</a>
            <a href="#faq" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <button className="hidden sm:flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-cyan-700 transition-colors hover:bg-cyan-50 dark:text-cyan-300 dark:hover:bg-cyan-900/20">
              Sign in
            </button>
            <Link to="/audit" className="hidden sm:flex items-center gap-1 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:from-cyan-600 hover:to-indigo-600">
              Get Started
              <ChevronRight size={16} />
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}

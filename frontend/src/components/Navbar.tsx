import React from 'react'
import { Link } from 'react-router-dom'
import ThemeToggle from '../lib/theme/ThemeToggle'
import { ChevronRight } from 'lucide-react'

export default function Navbar() {
  return (
    <header className="border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
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
            <button className="hidden sm:flex items-center gap-1 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
              Sign in
            </button>
            <Link to="/audit" className="hidden sm:flex items-center gap-1 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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

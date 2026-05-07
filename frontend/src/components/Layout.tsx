import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

export default function Layout() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Navbar />
      <div className="py-6">
        <div className="container">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

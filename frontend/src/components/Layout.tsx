import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './landing/Footer'

export default function Layout() {
  const location = useLocation()

  React.useEffect(() => {
    const scrollToHashTarget = () => {
      if (location.hash) {
        const targetId = decodeURIComponent(location.hash.slice(1))
        const targetElement = document.getElementById(targetId)

        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
          return
        }
      }

      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const frame = window.requestAnimationFrame(scrollToHashTarget)
    return () => window.cancelAnimationFrame(frame)
  }, [location.pathname, location.hash])

  return (
    <div className="flex min-h-screen flex-col bg-app text-primary">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}

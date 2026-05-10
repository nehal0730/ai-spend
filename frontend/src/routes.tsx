import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import AuditPage from './pages/audit/AuditPage'
import AuditResultsPage from './pages/audit/results/AuditResultsPage'
import Layout from './components/Layout'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="audit" element={<AuditPage />} />
        <Route path="audit/results" element={<AuditResultsPage />} />
        {/* future routes: /audits, /audits/:id, /team, /share/:token */}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

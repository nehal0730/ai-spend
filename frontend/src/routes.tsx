import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import AuditPage from './pages/audit/AuditPage'
import AuditResultsPage from './pages/audit/results/AuditResultsPage'
import ShareReportPage from './pages/share/ShareReportPage'
import ContactPage from './pages/ContactPage'
import SignInPage from './pages/SignInPage'
import Layout from './components/Layout'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="audit" element={<AuditPage />} />
        <Route path="audit/results" element={<AuditResultsPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="sign-in" element={<SignInPage />} />
      </Route>
      <Route path="share/:shareId" element={<ShareReportPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

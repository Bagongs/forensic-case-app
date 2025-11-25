import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'

import LoginPage from './pages/LoginPage.jsx'
import CaseListPage from './pages/CaseListPage'
import EvidenceListPage from './pages/EvidenceListPage'
import SuspectListPage from './pages/SuspectListPage'
import CaseDetailPage from './pages/CaseDetailPage.jsx'
import EvidenceDetailPage from './pages/EvidenceDetailPage.jsx'
import SuspectDetailPage from './pages/SuspectDetailPage.jsx'
import UserManagement from './pages/UserManagement.jsx'

import RequireAuth from './RequireAuth.jsx'
import RequireAdmin from './RequireAdmin.jsx'
import { Toaster } from 'react-hot-toast'

export default function App() {
  return (
    <HashRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#172133',
            color: '#E7E9EE',
            border: '1px solid #394F6F',
            fontFamily: 'Noto Sans'
          },
          success: { iconTheme: { primary: '#EDC702', secondary: '#172133' } },
          error: { iconTheme: { primary: '#E55353', secondary: '#172133' } }
        }}
      />
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes (must be authed) */}
        <Route
          element={
            <RequireAuth>
              <Outlet />
            </RequireAuth>
          }
        >
          {/* default after login */}
          <Route path="/" element={<Navigate to="/cases" replace />} />

          {/* main pages */}
          <Route path="/cases" element={<CaseListPage />} />
          <Route path="/cases/:id" element={<CaseDetailPage />} />

          <Route path="/evidence" element={<EvidenceListPage />} />
          <Route path="/evidence/:evidenceId" element={<EvidenceDetailPage />} />

          <Route path="/suspects" element={<SuspectListPage />} />
          <Route path="/suspects/:suspectId" element={<SuspectDetailPage />} />

          {/* admin only */}
          <Route
            path="/user-management"
            element={
              <RequireAdmin>
                <UserManagement />
              </RequireAdmin>
            }
          />
        </Route>

        {/* catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}

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

export default function App() {
  return (
    <HashRouter>
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

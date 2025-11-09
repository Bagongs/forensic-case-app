import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'

import LoginPage from './pages/LoginPage.jsx'
import CaseListPage from './pages/CaseListPage'
import EvidenceListPage from './pages/EvidenceListPage'
import SuspectListPage from './pages/SuspectListPage'
import CaseDetailPage from './pages/CaseDetailPage.jsx'
import EvidenceDetailPage from './pages/EvidenceDetailPage.jsx'
import SuspectDetailPage from './pages/SuspectDetailPage.jsx'
import UserManagement from './pages/UserManagement.jsx'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/cases" replace />} />
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="/cases" element={<CaseListPage />} />
        <Route path="/cases/:id" element={<CaseDetailPage />} />
        <Route path="/evidence" element={<EvidenceListPage />} />
        <Route path="/evidence/:evidenceId" element={<EvidenceDetailPage />} />
        <Route path="/suspects" element={<SuspectListPage />} />
        <Route path="/suspects/:suspectId" element={<SuspectDetailPage />} />
      </Routes>
    </HashRouter>
  )
}

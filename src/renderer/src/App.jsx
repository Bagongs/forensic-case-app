import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'

import LoginPage from './pages/LoginPage.jsx'
import CaseListPage from './pages/cases/CaseListPage'
import EvidenceListPage from './pages/cases/EvidenceListPage'
import SuspectListPage from './pages/cases/SuspectListPage'
import CaseDetailPage from './pages/cases/CaseDetailPage.jsx'
import EvidenceDetailPage from './pages/cases/EvidenceDetailPage.jsx'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/cases" replace />} />
        <Route path="/cases" element={<CaseListPage />} />
        <Route path="/cases/:id" element={<CaseDetailPage />} />
        <Route path="/cases/evidence" element={<EvidenceListPage />} />
        <Route path="/evidence/:evidenceId" element={<EvidenceDetailPage />} />
        <Route path="/cases/suspects" element={<SuspectListPage />} />
      </Routes>
    </HashRouter>
  )
}

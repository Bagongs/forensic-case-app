// src/renderer/src/pages/case/SuspectListPage.jsx
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CaseLayout from './CaseLayout'
import StatsCard from '../../components/StatsCard'
import MiniButton from '../../components/MiniButton'
import AddPersonModal from '../../components/AddPersonModal'
import { useCases } from '../../store/cases'

export default function SuspectListPage() {
  const nav = useNavigate()
  const cases = useCases((s) => s.cases)
  const addPersonToCase = useCases((s) => s.addPersonToCase)

  const [q, setQ] = useState('')
  const [modal, setModal] = useState(false)

  // Flatten persons dari semua kasus → baris tabel
  const rows = useMemo(() => {
    const out = []
    for (const c of cases ?? []) {
      const persons = c.persons ?? []
      for (const p of persons) {
        out.push({
          id: p.id,
          name: p.name,
          status: p.status || 'Suspect',
          caseId: c.id,
          caseName: c.name,
          investigator: c.investigator || '-',
          evidencesCount: (p.evidences ?? []).length
        })
      }
    }
    return out
  }, [cases])

  // Stats aman
  const stats = useMemo(() => {
    const totalPerson = rows.length
    const totalEvidence = rows.reduce((sum, r) => sum + r.evidencesCount, 0)
    return { totalPerson, totalEvidence }
  }, [rows])

  // Pencarian
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return rows
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(term) ||
        r.caseName.toLowerCase().includes(term) ||
        r.status.toLowerCase().includes(term) ||
        r.investigator.toLowerCase().includes(term)
    )
  }, [rows, q])

  // Options kasus untuk modal
  const caseOptions = useMemo(
    () => (cases ?? []).map((c) => ({ value: c.id, label: c.name })),
    [cases]
  )

  // Submit dari modal (harus mengembalikan minimal caseId + data person)
  const handleSavePerson = (payload) => {
    // Ekspektasi payload: { caseId, name, status, evidence? ... }
    if (!payload?.caseId) {
      console.warn('[AddPersonModal] Missing caseId in payload')
      setModal(false)
      return
    }
    addPersonToCase(payload.caseId, {
      name: payload.name,
      status: payload.status,
      evidence: payload.evidence // jika modal juga mengunggah evidence pertama
    })
    setModal(false)
  }

  return (
    <CaseLayout title="Suspect Management">
      {/* stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatsCard value={stats.totalPerson} label="Total person" />
        <StatsCard value={stats.totalEvidence} label="Total Evidence" />
      </div>

      {/* search + actions */}
      <div className="flex items-center gap-3 mb-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search person / case / status / investigator"
          className="px-3 py-2 rounded-lg border bg-transparent flex-1"
          style={{ borderColor: 'var(--border)' }}
        />
        <MiniButton onClick={() => setQ((s) => s.trim())}>Search</MiniButton>
        <MiniButton /* onClick={() => ...} */>Filter</MiniButton>
        <MiniButton onClick={() => setModal(true)} className="ml-auto">
          Add Person
        </MiniButton>
      </div>

      {/* table */}
      <div className="overflow-hidden border rounded-xl" style={{ borderColor: 'var(--border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left" style={{ background: 'var(--panel)' }}>
              {['Name', 'Case Name', 'Investigator', 'Status', 'Action'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 border-b"
                  style={{ borderColor: 'var(--border)', color: 'var(--dim)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={row.id ?? `${row.caseId}-${i}`} className="hover:bg-white/5">
                <td className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                  {row.name}
                </td>
                <td className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                  {row.caseName}
                </td>
                <td className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                  {row.investigator}
                </td>
                <td className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                  <div className="space-y-1">
                    <div>{row.status}</div>
                    <div className="opacity-70 text-xs">Suspect</div>
                    <div className="opacity-70 text-xs">Reported person</div>
                  </div>
                </td>
                <td className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                  <MiniButton onClick={() => nav(`/cases/${row.caseId}`)}>Detail</MiniButton>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center" style={{ color: 'var(--dim)' }}>
                  {rows.length === 0 ? 'No person' : 'No result for your search'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* modal tambah person */}
      <AddPersonModal
        open={modal}
        onClose={() => setModal(false)}
        onSave={handleSavePerson}
        caseOptions={caseOptions}
      />
    </CaseLayout>
  )
}

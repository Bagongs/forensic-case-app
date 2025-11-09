// src/renderer/src/pages/case/SuspectListPage.jsx
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CaseLayout from './CaseLayout'
import StatsCard from '../components/StatsCard'
import MiniButton, { MiniButtonContent } from '../components/MiniButton'
import AddPersonModal from '../components/AddPersonModal'
import { useCases } from '../store/cases'
import bgPerson from '../assets/image/stats/person.png'
import bgEvidance from '../assets/image/stats/evidance.png'
import iconFilter from '../assets/icons/icon-filter.svg'
import iconSearch from '../assets/icons/icon-search.svg'
import bgButton from '../assets/image/bg-button.svg'

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
      <div className="flex justify-start mb-6 -space-x-28">
        <StatsCard value={stats.totalPerson} label="Total person" bg={bgPerson} />
        <StatsCard value={stats.totalEvidence} label="Total Evidence" bg={bgEvidance} />
      </div>

      {/* search + actions */}
      <div className="flex justify-between items-center gap-3 mb-3 w-full ">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative w-[427px]">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search person / case / status / investigator"
              className="w-full pl-3 pr-3 py-1 border border-[#C3CFE0] bg-transparent"
            />
            <img
              src={iconSearch}
              alt="search"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-70"
            />
          </div>
          <MiniButton
            onClick={() => {
              /* TODO: open filter drawer */
            }}
          >
            <div className="flex items-center gap-1">
              <img src={iconFilter} width={15} height={15} /> Filter
            </div>
          </MiniButton>
        </div>
        <MiniButton onClick={() => setModal(true)} className="ml-auto">
          <MiniButtonContent bg={bgButton} text="+ Add Person" textColor="text-black" />
        </MiniButton>
      </div>

      {/* table */}
      <div className="overflow-hidden border " style={{ borderColor: 'var(--border)' }}>
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
                  <MiniButton onClick={() => nav(`/suspects/${row.caseId}`)}>Detail</MiniButton>
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

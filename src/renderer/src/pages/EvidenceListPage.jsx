/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CaseLayout from './CaseLayout'
import StatsCard from '../components/StatsCard'
import MiniButton, { MiniButtonContent } from '../components/MiniButton'
import AddEvidenceModal from '../components/AddEvidenceModal'
import { useCases } from '../store/cases'
import bgCase from '../assets/image/stats/case.png'
import bgEvidance from '../assets/image/stats/evidance.png'
import iconSearch from '../assets/icons/icon-search.svg'
import bgButton from '../assets/image/bg-button.svg'
import Pagination from '../components/Pagination'

/* ====== CONSTANTS ====== */
const COLORS = {
  tableBody: '#111720',
  theadBg: 'var(--panel)',
  border: 'var(--border)',
  dim: 'var(--dim-yellow)',
  detailBtn: '#2A3A51',
  pageActive: '#273549',
  gold: '#EDC702',
  status: {
    Open: '#42D200',
    'Re-Open': '#FFC720',
    Closed: '#FF0221'
  }
}
const PAGE_SIZES = [5, 10, 15]
/* ====== MAIN COMPONENT ====== */
export default function EvidenceListPage() {
  const nav = useNavigate()

  // ambil data & actions dari store
  const cases = useCases((s) => s.cases) ?? []
  const addEvidence = useCases((s) => s.addEvidenceToPerson)
  const addPersonToCase = useCases((s) => s.addPersonToCase)
  const evidences =
    cases.flatMap((c) =>
      c.persons.flatMap((p) =>
        (p.evidences || []).map((ev) => ({
          ...ev,
          caseId: c.id,
          caseName: c.name,
          investigator: c.investigator,
          agency: c.agency,
          date: new Date(c.createdAt).toLocaleDateString(),
          personId: p.id,
          personName: p.name
        }))
      )
    ) || []

  const [q, setQ] = useState('')
  const [modal, setModal] = useState(false)

  // pagination states
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0])
  const [page, setPage] = useState(1)

  // --- Stats ---
  const stats = useMemo(() => {
    const totalCase = new Set((evidences || []).map((e) => e.caseId)).size
    const totalEvidence = (evidences || []).length
    return { totalCase, totalEvidence }
  }, [evidences])

  // --- Filtered data ---
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return evidences
    return evidences.filter(
      (e) =>
        e.caseName.toLowerCase().includes(term) ||
        e.personName.toLowerCase().includes(term) ||
        e.id.toLowerCase().includes(term)
    )
  }, [q, evidences])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * pageSize
  const currentRows = filtered.slice(start, start + pageSize)

  useEffect(() => setPage(1), [q, pageSize])

  const caseOptions = cases.map((c) => ({ value: c.id, label: c.name }))

  // --- Submit handler dari Modal ---
  const handleSaveEvidence = (payload = {}) => {
    const {
      caseId,
      personId: pidFromModal,
      personOfInterest,
      fileMime,
      previewDataUrl,
      previewUrl,
      ...rest
    } = payload
    console.log('PAYLOAD ADD EVIDENCE : ', payload)
    if (!caseId) {
      console.error('Missing caseId/personId from AddEvidenceModal payload')
      return
    }

    let personId = pidFromModal
    if (!personId) {
      const selectedCase = cases.find((x) => x.id === caseId)
      const nameToFind = (personOfInterest || '').trim()
      const existing = nameToFind
        ? (selectedCase?.persons || []).find((p) => p.name === nameToFind)
        : null

      if (existing) personId = existing.id
      else
        personId = addPersonToCase(caseId, {
          name: nameToFind || 'Unknown',
          status: payload.status
        })
    }

    const ev = {
      ...rest,
      mime: fileMime || rest.mime,
      previewDataUrl: previewDataUrl || previewUrl || null
    }

    const evidenceId = addEvidence(caseId, personId, ev)
    setModal(false)
    if (evidenceId) nav(`/evidence/${evidenceId}`)
  }

  return (
    <CaseLayout title="Evidence Management">
      {/* --- Stats --- */}
      <div className="flex justify-start mb-6 -space-x-28">
        <StatsCard value={stats.totalCase} label="Total Case" bg={bgCase} />
        <StatsCard value={stats.totalEvidence} label="Total Evidence" bg={bgEvidance} />
      </div>

      {/* --- Search bar --- */}
      <div className="flex justify-between items-center gap-3 mb-3 w-full ">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative w-[427px]">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search case / person / id"
              className="w-full pl-3 pr-3 py-1 border border-[#C3CFE0] bg-transparent"
            />
            <img
              src={iconSearch}
              alt="search"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-70"
            />
          </div>
        </div>
        <MiniButton onClick={() => setModal(true)} className="ml-auto">
          <MiniButtonContent bg={bgButton} text="+ Add Evidence" textColor="text-black" />
        </MiniButton>
      </div>

      {/* --- Table --- */}
      <div
        className="relative border rounded-sm overflow-hidden"
        style={{ borderColor: COLORS.border, background: COLORS.tableBody }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left" style={{ background: COLORS.theadBg }}>
              {['Evidence ID', 'Case Name', 'Agency', 'Investigator', 'Date Created', 'Action'].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 border-b"
                    style={{ borderColor: COLORS.border, color: COLORS.dim }}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {currentRows.map((row) => (
              <tr key={row.id} className="hover:bg-white/5">
                <td className="px-4 py-3 border-b" style={{ borderColor: COLORS.border }}>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block w-1.5 h-4 rounded ${
                        row.source === 'generated' ? 'bg-indigo-300' : 'bg-pink-300'
                      }`}
                    />
                    {row.id}
                  </div>
                </td>
                <td className="px-4 py-3 border-b" style={{ borderColor: COLORS.border }}>
                  {row.caseName}
                </td>
                <td className="px-4 py-3 border-b" style={{ borderColor: COLORS.border }}>
                  {row.agency || '-'}
                </td>
                <td className="px-4 py-3 border-b" style={{ borderColor: COLORS.border }}>
                  {row.investigator || '-'}
                </td>
                <td className="px-4 py-3 border-b" style={{ borderColor: COLORS.border }}>
                  {row.date}
                </td>
                <td className="px-4 py-3 border-b" style={{ borderColor: COLORS.border }}>
                  <button
                    onClick={() => nav(`/evidence/${row.id}`)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded"
                    style={{ background: COLORS.detailBtn }}
                  >
                    <img src={iconSearch} className="w-4 h-4 opacity-90" />
                    <span>Detail</span>
                  </button>
                </td>
              </tr>
            ))}
            {currentRows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center" style={{ color: COLORS.dim }}>
                  No evidence
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div
          className="flex items-center justify-between px-4 py-3 border-t"
          style={{ borderColor: COLORS.border }}
        >
          <div>
            <div className="flex items-center gap-6 text-xs opacity-70">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-4 rounded bg-indigo-300 inline-block" /> generated case id
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-4 rounded bg-pink-300 inline-block" /> Manual case id
              </div>
            </div>
          </div>
          <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>

      <AddEvidenceModal
        open={modal}
        onClose={() => setModal(false)}
        onSave={handleSaveEvidence}
        caseOptions={caseOptions}
        cases={cases}
      />
    </CaseLayout>
  )
}

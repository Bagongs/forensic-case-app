/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CaseLayout from './CaseLayout'
import StatsCard from '../components/StatsCard'
import MiniButton, { MiniButtonContent } from '../components/common/MiniButton'
import AddEvidenceModal from '../components/modals/evidence/AddEvidenceModal'
import bgCase from '../assets/image/stats/case.png'
import bgEvidance from '../assets/image/stats/evidance.png'
import iconSearch from '../assets/icons/icon-search.svg'
import bgButton from '../assets/image/bg-button.svg'
import Pagination from '../components/common/Pagination'

import { useEvidences } from '../store/evidences'
import { useCases } from '../store/cases' // buat dropdown Case di modal

/* ====== CONSTANTS ====== */
const COLORS = {
  tableBody: '#111720',
  theadBg: 'var(--panel)',
  border: 'var(--border)',
  dim: 'var(--dim-yellow)',
  detailBtn: '#2A3A51',
  pageActive: '#273549',
  gold: '#EDC702'
}
const PAGE_SIZES = [5, 10, 15]

export default function EvidenceListPage() {
  const nav = useNavigate()

  const { evidences, summary, pagination, loading, error, fetchEvidences, fetchEvidenceSummary } =
    useEvidences()

  const cases = useCases((s) => s.cases)
  const fetchCases = useCases((s) => s.fetchCases)

  const [q, setQ] = useState('')
  const [modal, setModal] = useState(false)

  const [pageSize, setPageSize] = useState(PAGE_SIZES[0])
  const [page, setPage] = useState(1)

  // load summary (kalau endpoint ada)
  useEffect(() => {
    fetchEvidenceSummary().catch(() => {})
  }, [])

  // ensure cases loaded for modal
  useEffect(() => {
    if (!cases || cases.length === 0) {
      fetchCases?.({ skip: 0, limit: 1000 }).catch(() => {})
    }
  }, [])

  // reset page ketika search/pageSize berubah
  useEffect(() => setPage(1), [q, pageSize])

  // fetch list evidence dari BE (server-side pagination + search)
  useEffect(() => {
    const params = {
      skip: (page - 1) * pageSize,
      limit: pageSize
    }
    if (q.trim()) params.search = q.trim()

    fetchEvidences(params).catch(() => {})
  }, [q, page, pageSize])

  const rows = evidences || []

  // Stats: pakai summary kalau ada, fallback lokal
  const stats = useMemo(() => {
    if (summary) {
      return {
        totalCase:
          summary.total_case ?? summary.totalCase ?? new Set(rows.map((e) => e.caseId)).size,
        totalEvidence:
          summary.total_evidence ?? summary.totalEvidence ?? pagination?.total ?? rows.length
      }
    }
    return {
      totalCase: new Set(rows.map((e) => e.caseId)).size,
      totalEvidence: pagination?.total ?? rows.length
    }
  }, [summary, rows, pagination])

  const totalEvidence = pagination?.total ?? rows.length
  const totalPages = Math.max(1, Math.ceil(totalEvidence / pageSize))
  const safePage = Math.min(page, totalPages)

  const caseOptions = useMemo(
    () => (cases ?? []).map((c) => ({ value: c.id, label: c.name })),
    [cases]
  )

  // ✅ AddEvidenceModal sudah POST evidence sendiri.
  // Jadi di sini hanya:
  // - close modal
  // - refresh list & summary
  // - navigate ke detail evidence baru
  const handleSaveEvidence = async (payload = {}) => {
    try {
      const res = payload?.apiResponse
      const newId =
        res?.data?.id ?? res?.data?.evidence_id ?? res?.data?.evidence?.id ?? res?.id ?? payload?.id

      setModal(false)

      await fetchEvidences({ skip: 0, limit: pageSize })
      await fetchEvidenceSummary().catch(() => {})

      if (newId) nav(`/evidence/${newId}`)
    } catch (err) {
      console.error('[EvidenceListPage] after create failed:', err)
      setModal(false)
    }
  }

  const fmtDate = (iso) => {
    if (!iso) return '-'
    try {
      return new Date(iso).toLocaleDateString('id-ID')
    } catch {
      return iso
    }
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
        {/* loader overlay */}
        {loading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 text-sm">
            Loading evidences…
          </div>
        )}

        {error && (
          <div
            className="px-4 py-2 text-xs text-red-400 border-b"
            style={{ borderColor: COLORS.border }}
          >
            {String(error)}
          </div>
        )}

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
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-white/5">
                <td className="px-4 py-3 border-b" style={{ borderColor: COLORS.border }}>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block w-1.5 h-4 rounded ${
                        row.source === 'generated' ? 'bg-indigo-300' : 'bg-pink-300'
                      }`}
                    />
                    {row.evidenceNumber || row.id}
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
                  {fmtDate(row.createdAt)}
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

            {rows.length === 0 && !loading && (
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
          <div className="flex items-center gap-6 text-xs opacity-70">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 rounded bg-indigo-300 inline-block" /> generated case id
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 rounded bg-pink-300 inline-block" /> Manual case id
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

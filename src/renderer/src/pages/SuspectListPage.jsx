/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useMemo, useState, useEffect, useRef, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import CaseLayout from './CaseLayout'
import StatsCard from '../components/StatsCard'
import MiniButton, { MiniButtonContent } from '../components/common/MiniButton'
import AddPersonModal from '../components/modals/suspect/AddPersonModal'
import bgPerson from '../assets/image/stats/person.png'
import bgEvidance from '../assets/image/stats/evidance.png'
import iconFilter from '../assets/icons/icon-filter.svg'
import iconSearch from '../assets/icons/icon-search.svg'
import bgButton from '../assets/image/bg-button.svg'
import Pagination from '../components/common/Pagination'

import { useSuspects } from '../store/suspects'
import { useCases } from '../store/cases'
import { useScreenMode } from '../hooks/useScreenMode'
import truncateText from '../lib/truncateText'

/* ====== CONSTANTS ====== */
const COLORS = {
  tableBody: '#111720',
  theadBg: 'var(--panel)',
  border: 'var(--border)',
  dim: 'var(--dim-yellow)',
  detailBtn: '#2A3A51',
  pageActive: '#273549'
}

const STATUS_OPTIONS = [
  { name: 'Witness', color: '#004166', border: '#9FDCFF', text: '#9FDCFF' },
  { name: 'Reported', color: '#332E00', border: '#D2BA00', text: '#D2BA00' },
  { name: 'Suspected', color: '#332400', border: '#FF7402', text: '#FF7402' },
  { name: 'Suspect', color: '#511600', border: '#FF6551', text: '#FF6551' },
  { name: 'Defendant', color: '#330006', border: '#FF0221', text: '#FF0221' }
]

const PAGE_SIZES = [5, 10, 15]

export default function SuspectListPage() {
  const nav = useNavigate()
  const mode = useScreenMode()
  const truncateTextSize = mode === 'default' ? 20 : 30
  const { suspects, summary, pagination, loading, error, fetchSuspects, fetchSuspectSummary } =
    useSuspects()

  const [q, setQ] = useState('')
  const [modal, setModal] = useState(false)
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0])
  const [page, setPage] = useState(1)

  // Filter dropdown
  const [filterOpen, setFilterOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState([])
  const filterBtnRef = useRef(null)

  // Fetch summary once
  useEffect(() => {
    fetchSuspectSummary().catch(() => {})
  }, [])

  // Fetch suspects when search/filter/pagination changes
  useEffect(() => {
    const params = {
      skip: (page - 1) * pageSize,
      limit: pageSize
    }

    // search
    if (q.trim()) params.search = q.trim()

    // FIX: kirim status sebagai string: "Suspect,Reported"
    if (statusFilter.length > 0) {
      params.status = statusFilter.join(',')
    }

    fetchSuspects(params).catch(() => {})
  }, [q, page, pageSize, statusFilter])

  // Reset page when filter/search changes
  useEffect(() => setPage(1), [q, pageSize, statusFilter])

  const rows = suspects

  // Stats summary or fallback
  const stats = useMemo(() => {
    if (summary) {
      return {
        totalPerson:
          summary.total_person ?? summary.total_suspects ?? summary.totalPerson ?? rows.length,
        totalEvidence: summary.total_evidence ?? summary.totalEvidence ?? 0
      }
    }
    return { totalPerson: rows.length, totalEvidence: 0 }
  }, [summary, rows])

  const totalSuspects = pagination?.total ?? rows.length
  const totalPages = Math.max(1, Math.ceil(totalSuspects / pageSize))
  const safePage = Math.min(page, totalPages)

  // case options
  const cases = useCases((s) => s.cases)
  const fetchCases = useCases((s) => s.fetchCases)
  useEffect(() => {
    fetchCases().catch(() => {})
  }, [fetchCases])

  const caseOptions = useMemo(
    () => (cases ?? []).map((c) => ({ value: c.id, label: c.name })),
    [cases]
  )

  // menerima hasil modal
  const handleSavePerson = async (payload) => {
    try {
      setModal(false)
      await fetchSuspects({ skip: 0, limit: pageSize })

      const newId =
        payload?.apiResponse?.data?.id ||
        payload?.apiResponse?.data?.suspect_id ||
        payload?.apiResponse?.data?.suspect?.id

      if (newId) nav(`/suspects/${newId}`)
    } catch (err) {
      console.error('[SuspectListPage] handleSavePerson failed:', err)
      setModal(false)
    }
  }

  const badgeStatus = (status = 'Unknown') => {
    const s = STATUS_OPTIONS.find((opt) => opt.name.toLowerCase() === status.toLowerCase())
    if (!s || status.toLowerCase() === 'unknown') return null
    return (
      <div
        className="px-4 py-1 text-[13px] font-semibold text-center rounded-full"
        style={{
          background: s.color,
          color: s.text,
          border: `2px solid ${s.border}`,
          width: 'fit-content',
          minWidth: 120
        }}
      >
        {s.name}
      </div>
    )
  }

  return (
    <CaseLayout title="Suspect Management">
      {/* Stats */}
      <div className="flex justify-start mb-6 -space-x-28">
        <StatsCard value={stats.totalPerson} label="Total Person" bg={bgPerson} />
        <StatsCard value={stats.totalEvidence} label="Total Evidence" bg={bgEvidance} />
      </div>

      {/* Search + Actions */}
      <div className="flex justify-between items-center gap-3 mb-3 w-full ">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative w-[427px]">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search person / case / investigator"
              className="w-full pl-3 pr-3 py-1 border border-[#C3CFE0] bg-transparent"
            />
            <img
              src={iconSearch}
              alt="search"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-70"
            />
          </div>

          <MiniButton ref={filterBtnRef} onClick={() => setFilterOpen((s) => !s)}>
            <div className="flex items-center gap-1">
              <img src={iconFilter} width={15} height={15} /> Filter
            </div>
          </MiniButton>
        </div>

        <MiniButton onClick={() => setModal(true)} className="ml-auto">
          <MiniButtonContent bg={bgButton} text="+ Add Suspect" textColor="text-black" />
        </MiniButton>
      </div>

      {/* Filter Dropdown */}
      <FilterDropdown
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        selected={statusFilter}
        onChange={setStatusFilter}
        anchorRef={filterBtnRef}
      />

      {/* Table */}
      <div
        className="relative border rounded-sm overflow-hidden"
        style={{ borderColor: COLORS.border, background: COLORS.tableBody }}
      >
        {loading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 text-sm">
            Loading suspects…
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
              {['Name', 'Case Name', 'Main Investigator', 'Status', 'Action'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 border-b"
                  style={{ borderColor: COLORS.border, color: COLORS.dim }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.id ?? `${row.caseId}-${i}`} className="hover:bg-white/5">
                <td className="px-4 py-3 border-b" style={{ borderColor: COLORS.border }}>
                  {truncateText(row.name, truncateTextSize)}
                </td>
                <td className="px-4 py-3 border-b" style={{ borderColor: COLORS.border }}>
                  {truncateText(row.caseName, truncateTextSize)}
                </td>
                <td className="px-4 py-3 border-b" style={{ borderColor: COLORS.border }}>
                  {truncateText(row.investigator, truncateTextSize)}
                </td>
                <td className="px-4 py-3 border-b" style={{ borderColor: COLORS.border }}>
                  {row.status ? badgeStatus(row.status) : ''}
                </td>
                <td className="px-4 py-3 border-b" style={{ borderColor: COLORS.border }}>
                  <button
                    onClick={() => nav(`/suspects/${row.id}`)}
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
                <td colSpan={5} className="px-4 py-6 text-center" style={{ color: COLORS.dim }}>
                  No person found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div
          className="flex items-center justify-end px-4 py-3 border-t"
          style={{ borderColor: COLORS.border }}
        >
          <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>

      <AddPersonModal
        open={modal}
        onClose={() => setModal(false)}
        onSave={handleSavePerson}
        caseOptions={caseOptions}
      />
    </CaseLayout>
  )
}

/* ====== Filter Dropdown ====== */
function FilterDropdown({ open, onClose, selected, onChange, anchorRef }) {
  const menuRef = useRef(null)
  const [pos, setPos] = useState({ top: 0, left: 0 })

  useLayoutEffect(() => {
    if (open && anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect()
      setPos({ top: rect.bottom + 8, left: rect.left })
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e) => {
      if (menuRef.current?.contains(e.target) || anchorRef.current?.contains(e.target)) return
      onClose()
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      ref={menuRef}
      className="fixed z-2000 border rounded-sm shadow-lg"
      style={{
        top: pos.top,
        left: pos.left,
        width: 240,
        background: '#0C121C',
        border: 'none',
        color: '#fff'
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ background: '#162337', borderBottom: '0.1px solid #E8C902' }}
      >
        <span className="font-semibold text-[14px] tracking-wide">FILTER STATUS</span>
        <button onClick={onClose} className="text-lg leading-none opacity-80 hover:opacity-100">
          ×
        </button>
      </div>

      <div className="flex flex-col gap-3 px-4 py-4">
        {STATUS_OPTIONS.map((opt) => {
          const isChecked = selected.includes(opt.name)
          return (
            <div
              key={opt.name}
              onClick={() => {
                if (isChecked) onChange(selected.filter((s) => s !== opt.name))
                else onChange([...selected, opt.name])
              }}
              className="flex items-center gap-3 cursor-pointer select-none"
            >
              <div
                className="w-5 h-5 flex items-center justify-center border"
                style={{
                  borderColor: '#C3CFE0',
                  background: isChecked ? '#2E5B9F' : 'transparent'
                }}
              >
                {isChecked && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>

              <div
                className="px-2 text-[14px] font-semibold text-center rounded-full min-w-[120px]"
                style={{
                  background: opt.color,
                  color: opt.text,
                  border: `2px solid ${opt.border}`
                }}
              >
                {opt.name}
              </div>
            </div>
          )
        })}
      </div>
    </div>,
    document.body
  )
}

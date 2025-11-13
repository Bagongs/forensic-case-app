import { useMemo, useState, useEffect, useRef, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
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
import Pagination from '../components/Pagination'

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
  const cases = useCases((s) => s.cases)
  const addPersonToCase = useCases((s) => s.addPersonToCase)

  const [q, setQ] = useState('')
  const [modal, setModal] = useState(false)
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0])
  const [page, setPage] = useState(1)

  // Filter dropdown
  const [filterOpen, setFilterOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState([])
  const filterBtnRef = useRef(null)

  // Flatten persons
  const rows = useMemo(() => {
    const out = []
    for (const c of cases ?? []) {
      const persons = c.persons ?? []
      for (const p of persons) {
        out.push({
          id: p.id,
          name: p.name,
          status: p.status,
          caseId: c.id,
          caseName: c.name,
          investigator: c.investigator || '-',
          evidencesCount: (p.evidences ?? []).length
        })
      }
    }
    return out
  }, [cases])

  // Stats
  const stats = useMemo(() => {
    const totalPerson = rows.length
    const totalEvidence = rows.reduce((sum, r) => sum + r.evidencesCount, 0)
    return { totalPerson, totalEvidence }
  }, [rows])

  // Filter pencarian + status
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    let arr = rows

    // filter by status
    if (statusFilter.length > 0) {
      arr = arr.filter((r) => statusFilter.includes(r.status))
    }

    // search
    if (term) {
      arr = arr.filter(
        (r) =>
          r.name.toLowerCase().includes(term) ||
          r.caseName.toLowerCase().includes(term) ||
          r.status.toLowerCase().includes(term) ||
          r.investigator.toLowerCase().includes(term)
      )
    }

    return arr
  }, [rows, q, statusFilter])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * pageSize
  const currentRows = filtered.slice(start, start + pageSize)
  useEffect(() => setPage(1), [q, pageSize, statusFilter])

  // case options
  const caseOptions = useMemo(
    () => (cases ?? []).map((c) => ({ value: c.id, label: c.name })),
    [cases]
  )

  const handleSavePerson = (payload) => {
    if (!payload?.caseId) {
      console.warn('[AddPersonModal] Missing caseId in payload')
      setModal(false)
      return
    }

    const newId = addPersonToCase(payload.caseId, {
      name: payload.name,
      status: payload.status,
      evidence: payload.evidence
    })

    setModal(false)
    if (newId) setTimeout(() => nav(`/suspects/${newId}`), 150)
  }

  const badgeStatus = (status = 'Unknown') => {
    status = status ?? 'Unknown'
    const s = STATUS_OPTIONS.find((opt) => opt.name.toLowerCase() === status.toLowerCase())

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
              placeholder="Search person / case / status / investigator"
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
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left" style={{ background: COLORS.theadBg }}>
              {['Name', 'Case Name', 'Investigator', 'Status', 'Action'].map((h) => (
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
            {currentRows.map((row, i) => (
              <tr key={row.id ?? `${row.caseId}-${i}`} className="hover:bg-white/5">
                <td className="px-4 py-3 border-b" style={{ borderColor: COLORS.border }}>
                  {row.name}
                </td>
                <td className="px-4 py-3 border-b" style={{ borderColor: COLORS.border }}>
                  {row.caseName}
                </td>
                <td className="px-4 py-3 border-b" style={{ borderColor: COLORS.border }}>
                  {row.investigator}
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
            {currentRows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center" style={{ color: COLORS.dim }}>
                  {rows.length === 0 ? 'No person' : 'No result for your search'}
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
// eslint-disable-next-line react/prop-types
function FilterDropdown({ open, onClose, selected, onChange, anchorRef }) {
  const menuRef = useRef(null)
  const [pos, setPos] = useState({ top: 0, left: 0 })

  useLayoutEffect(() => {
    // eslint-disable-next-line react/prop-types
    if (open && anchorRef?.current) {
      // eslint-disable-next-line react/prop-types
      const rect = anchorRef.current.getBoundingClientRect()
      setPos({ top: rect.bottom + 8, left: rect.left })
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e) => {
      // eslint-disable-next-line react/prop-types
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
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ background: '#162337', borderBottom: '0.1px solid #E8C902' }}
      >
        <span className="font-semibold text-[14px] tracking-wide">FILTER STATUS</span>
        <button onClick={onClose} className="text-lg leading-none opacity-80 hover:opacity-100">
          ×
        </button>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-3 px-4 py-4">
        {STATUS_OPTIONS.map((opt) => {
          // eslint-disable-next-line react/prop-types
          const isChecked = selected.includes(opt.name)
          return (
            <div
              key={opt.name}
              onClick={() => {
                // eslint-disable-next-line react/prop-types
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

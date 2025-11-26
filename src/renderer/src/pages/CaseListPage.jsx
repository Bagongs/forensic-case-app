/* eslint-disable react/prop-types */
import { useMemo, useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { PiArrowsDownUpBold } from 'react-icons/pi'

import CaseLayout from './CaseLayout'
import StatsCard from '../components/StatsCard'
import MiniButton, { MiniButtonContent } from '../components/common/MiniButton'
import AddCaseModal from '../components/modals/case/AddCaseModal'
import { useCases } from '../store/cases'

import bgOpen from '../assets/image/stats/open.png'
import bgClose from '../assets/image/stats/close.png'
import bgReopen from '../assets/image/stats/reopen.png'

import iconFilter from '../assets/icons/icon-filter.svg'
import iconSearch from '../assets/icons/icon-search.svg'
import bgButton from '../assets/image/bg-button.svg'
import dropdownIcon from '../assets/icons/dropdown-icon.svg'
import Pagination from '../components/common/Pagination'

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

/* ====== HELPERS ====== */
const fmt = (val) => {
  if (!val) return '-'
  if (typeof val === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
    return val // sudah format DD/MM/YYYY dari backend
  }
  const d = new Date(val)
  if (Number.isNaN(d.getTime())) return String(val)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = String(d.getFullYear())
  return `${dd}/${mm}/${yyyy}`
}

function StatusCell({ value = 'Open' }) {
  const color =
    COLORS.status[value] ??
    (String(value).toLowerCase().includes('open')
      ? COLORS.status.Open
      : String(value).toLowerCase().includes('re')
        ? COLORS.status['Re-Open']
        : COLORS.status.Closed)

  return (
    <div className="inline-flex items-center gap-2">
      <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span>{value}</span>
    </div>
  )
}

/* ====== MAIN COMPONENT ====== */
export default function CaseListPage() {
  const nav = useNavigate()

  // ✅ selector biar rerender lebih ringan
  const cases = useCases((s) => s.cases)
  const summary = useCases((s) => s.summary)
  const pagination = useCases((s) => s.pagination)
  const loading = useCases((s) => s.loading)
  const error = useCases((s) => s.error)
  const fetchSummary = useCases((s) => s.fetchSummary)
  const fetchCases = useCases((s) => s.fetchCases)
  const createCaseRemote = useCases((s) => s.createCaseRemote)

  const [q, setQ] = useState('')
  const [modal, setModal] = useState(false)

  const [pageSize, setPageSize] = useState(PAGE_SIZES[0])
  const [page, setPage] = useState(1)
  const [sortOrder, setSortOrder] = useState(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState([])
  const filterBtnRef = useRef(null)

  // summary sekali saat mount
  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  // fetch list case saat query/paging/sort/filter berubah
  useEffect(() => {
    const params = {
      skip: (page - 1) * pageSize,
      limit: pageSize
    }

    if (q.trim()) params.search = q.trim()

    // Contract API: status single value
    if (statusFilter.length === 1) {
      params.status = statusFilter[0]
    }

    if (sortOrder) {
      params.sort_by = 'created_at'
      params.sort_order = sortOrder
    }

    fetchCases(params)
  }, [q, page, pageSize, sortOrder, statusFilter, fetchCases])

  const stats = useMemo(() => {
    if (summary) {
      return {
        open: summary.open_cases ?? 0,
        closed: summary.closed_cases ?? 0,
        reopen: summary.reopened_cases ?? 0
      }
    }
    // fallback lokal
    const open = cases.filter((c) => (c.status || c.case_status) === 'Open').length
    const closed = cases.filter((c) => (c.status || c.case_status) === 'Closed').length
    const reopen = cases.filter((c) => (c.status || c.case_status) === 'Re-Open').length
    return { open, closed, reopen }
  }, [summary, cases])

  const totalCases = pagination?.total ?? cases.length ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCases / pageSize))
  const safePage = Math.min(page, totalPages)

  // ✅ clamp kalau totalPages turun
  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const handleSaveCase = async (payload) => {
    console.log('[Renderer Payload] =>', payload)
    try {
      const created = await createCaseRemote(payload)
      setModal(false)
      if (created?.id) {
        nav(`/cases/${created.id}`)
      }
    } catch (err) {
      console.error('Failed to create case', err)
    }
  }

  // ✅ reset page di handler, bukan effect
  const onSearchChange = (e) => {
    setQ(e.target.value)
    setPage(1)
  }

  const toggleSort = () => {
    setSortOrder((prev) => {
      let next = null
      if (prev === null) next = 'desc'
      else if (prev === 'desc') next = 'asc'
      else next = null
      return next
    })
    setPage(1)
  }

  const onChangeStatusFilter = useCallback((next) => {
    setStatusFilter(next)
    setPage(1)
  }, [])

  const onChangePageSize = (v) => {
    setPageSize(v)
    setPage(1)
  }

  return (
    <CaseLayout title="Case Management">
      {/* === Stats Section === */}
      <div className="flex justify-start mb-6 -space-x-28">
        <StatsCard value={stats.open} label="Case Open" bg={bgOpen} />
        <StatsCard value={stats.closed} label="Case Closed" bg={bgClose} />
        <StatsCard value={stats.reopen} label="Case Re-Open" bg={bgReopen} />
      </div>

      {/* === Search + Actions === */}
      <div className="flex justify-between items-center gap-3 mb-3 w-full">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative w-[427px]">
            <input
              value={q}
              onChange={onSearchChange}
              placeholder="Search case"
              className="w-full pl-3 pr-3 py-1 border border-[#C3CFE0] bg-transparent"
              style={{
                border: '1px solid #C3CFE0',
                background: 'transparent',
                color: 'var(--text)'
              }}
            />
            <img
              src={iconSearch}
              alt="search"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-70 pointer-events-none"
            />
          </div>
          <MiniButton ref={filterBtnRef} onClick={() => setFilterOpen((s) => !s)}>
            <div className="flex items-center gap-1">
              <img src={iconFilter} width={15} height={15} /> Filter
            </div>
          </MiniButton>
        </div>

        <MiniButton onClick={() => setModal(true)} className="ml-auto">
          <MiniButtonContent bg={bgButton} text="+ Add Case" textColor="text-black" />
        </MiniButton>
      </div>

      {/* === Filter Dropdown === */}
      <FilterDropdown
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        selected={statusFilter}
        onChange={onChangeStatusFilter}
        anchorRef={filterBtnRef}
      />

      {/* === Table Container === */}
      <div
        className="relative border rounded-sm overflow-hidden"
        style={{ borderColor: COLORS.border, background: COLORS.tableBody }}
      >
        {loading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 text-sm">
            Loading cases…
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
              {[
                'Case ID',
                'Case Name',
                'Main Investigator',
                'Agency',
                'Date Created',
                'Status',
                'Action'
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 border-b select-none"
                  style={{ borderColor: COLORS.border, color: COLORS.dim }}
                >
                  {h === 'Date Created' ? (
                    <button className="inline-flex items-center gap-1">
                      <span>Date Created</span>
                    </button>
                  ) : (
                    h
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {cases.map((row, idx) => {
              // ✅ sesuai response API
              const id = row.id ?? row.case_id
              const safeKey = id ? `case-${id}` : `case-temp-${idx}`

              const name = row.title ?? row.case_name ?? row.name ?? row.title
              const investigator =
                row.main_investigator ?? row.investigator ?? row.investigator_name ?? '-'
              const agency = row.agency_name ?? row.agency ?? row.agency_name ?? '-'
              const createdAt = row.created_at ?? row.createdAt ?? row.date_created
              const status = row.status ?? row.case_status ?? 'Open'

              return (
                <tr key={safeKey} className="hover:bg-white/5">
                  <td className="px-4 py-3 border-b" style={{ borderColor: COLORS.border }}>
                    {row.caseNumber || id}
                  </td>

                  <td className="px-4 py-3 border-b" style={{ borderColor: COLORS.border }}>
                    {name}
                  </td>

                  <td className="px-4 py-3 border-b" style={{ borderColor: COLORS.border }}>
                    {investigator}
                  </td>

                  <td className="px-4 py-3 border-b" style={{ borderColor: COLORS.border }}>
                    {agency}
                  </td>

                  <td className="px-4 py-3 border-b" style={{ borderColor: COLORS.border }}>
                    {fmt(createdAt)}
                  </td>

                  <td className="px-4 py-3 border-b" style={{ borderColor: COLORS.border }}>
                    <StatusCell value={status} />
                  </td>

                  <td className="px-4 py-3 border-b" style={{ borderColor: COLORS.border }}>
                    <button
                      onClick={() => nav(`/cases/${id}`)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded"
                      style={{ background: COLORS.detailBtn }}
                    >
                      <img src={iconSearch} className="w-4 h-4 opacity-90" />
                      <span>Detail</span>
                    </button>
                  </td>
                </tr>
              )
            })}

            {cases.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center" style={{ color: COLORS.dim }}>
                  No cases
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* === Footer Controls === */}
        <div
          className="flex items-center justify-between px-4 py-3 border-t"
          style={{ borderColor: COLORS.border }}
        >
          <div className="flex items-center gap-3">
            <PageSizeDropdown value={pageSize} onChange={onChangePageSize} icon={dropdownIcon} />
            <TotalCaseCard total={totalCases} />
          </div>
          <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>

      <AddCaseModal open={modal} onClose={() => setModal(false)} onSave={handleSaveCase} />
    </CaseLayout>
  )
}

/* ====== PageSizeDropdown (Portal) ====== */
function PageSizeDropdown({ value, onChange, icon }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ left: 0, top: 0, width: 0 })
  const btnRef = useRef(null)
  const menuRef = useRef(null)

  const computePos = () => {
    if (!btnRef.current) return
    const r = btnRef.current.getBoundingClientRect()
    setPos({ left: r.left, top: r.bottom + 6, width: r.width })
  }

  useLayoutEffect(() => {
    if (open) computePos()
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = () => computePos()
    window.addEventListener('scroll', handler, true)
    window.addEventListener('resize', handler)
    return () => {
      window.removeEventListener('scroll', handler, true)
      window.removeEventListener('resize', handler)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (btnRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen((s) => !s)}
        className="inline-flex items-center justify-between gap-2 px-4 py-2 rounded-sm min-w-[72px]"
        style={{ background: '#111720', border: '1.5px solid #C3CFE0' }}
      >
        <span className="font-medium">{value}</span>
        <img src={icon} className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed rounded-sm overflow-hidden shadow-lg"
            style={{
              left: pos.left,
              top: pos.top,
              width: pos.width,
              background: '#111720',
              border: '1.5px solid #C3CFE0',
              zIndex: 1000
            }}
          >
            {PAGE_SIZES.map((s) => (
              <div
                key={s}
                onClick={() => {
                  onChange(s)
                  setOpen(false)
                }}
                className={`px-4 py-2 cursor-pointer hover:bg-white/5 ${
                  s === value ? 'opacity-100' : 'opacity-90'
                }`}
              >
                {s}
              </div>
            ))}
          </div>,
          document.body
        )}
    </>
  )
}

/* ====== TotalCaseCard ====== */
function TotalCaseCard({ total = 0 }) {
  return (
    <div
      className="px-4 py-2 rounded-sm flex items-center gap-2"
      style={{ background: '#111720', border: '1.5px solid #C3CFE0' }}
    >
      <span className="font-semibold">{total}</span>
      <span className="opacity-90">Total Case</span>
    </div>
  )
}

function FilterDropdown({ open, onClose, selected, onChange, anchorRef }) {
  const menuRef = useRef(null)
  const [pos, setPos] = useState({ top: 0, left: 0 })

  useLayoutEffect(() => {
    if (open && anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect()
      setPos({
        top: rect.bottom + 8,
        left: rect.left
      })
    }
  }, [open, anchorRef])

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e) => {
      if (menuRef.current?.contains(e.target) || anchorRef.current?.contains(e.target)) return
      onClose()
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, onClose, anchorRef])

  const OPTIONS = ['Open', 'Closed', 'Re-Open']
  if (!open) return null

  return createPortal(
    <div
      ref={menuRef}
      className="fixed border rounded-sm shadow-lg"
      style={{
        top: pos.top,
        left: pos.left,
        width: 240,
        background: '#0C121C',
        border: 'none',
        color: '#fff',
        zIndex: 2000
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ background: '#162337', borderBottom: '0.1px solid #E8C902' }}
      >
        <span className="font-semibold text-[14px] tracking-wide">FILTER METHOD</span>
        <button onClick={onClose} className="text-lg leading-none opacity-80 hover:opacity-100">
          ×
        </button>
      </div>

      <div className="flex flex-col gap-3 px-4 py-4">
        {OPTIONS.map((opt) => {
          const isChecked = selected.includes(opt)
          return (
            <div
              key={opt}
              onClick={() => {
                if (isChecked) {
                  onChange([])
                } else {
                  onChange([opt])
                }
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
              <span className="text-[15px]">{opt}</span>
            </div>
          )
        })}
      </div>
    </div>,
    document.body
  )
}

/* eslint-disable react/prop-types */
import { useMemo, useState, useRef, useEffect, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { PiArrowsDownUpBold } from 'react-icons/pi'

import CaseLayout from './CaseLayout'
import StatsCard from '../components/StatsCard'
import MiniButton, { MiniButtonContent } from '../components/MiniButton'
import AddCaseModal from '../components/AddCaseModal'
import { useCases } from '../store/cases'

import bgOpen from '../assets/image/stats/open.png'
import bgClose from '../assets/image/stats/close.png'
import bgReopen from '../assets/image/stats/reopen.png'

import iconFilter from '../assets/icons/icon-filter.svg'
import iconSearch from '../assets/icons/icon-search.svg'
import bgButton from '../assets/image/bg-button.svg'
import dropdownIcon from '../assets/icons/dropdown-icon.svg'

/* ====== CONSTANTS ====== */
const COLORS = {
  tableBody: '#111720',
  theadBg: 'var(--panel)',
  border: 'var(--border)',
  dim: 'var(--dim)',
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
const fmt = (iso) => {
  if (!iso) return '-'
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = String(d.getFullYear())
  return `${mm}/${dd}/${yyyy}`
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

function IconChevron({ dir = 'left' }) {
  const rotate = dir === 'right' ? 'rotate-180' : ''
  return (
    <svg
      className={`w-4 h-4 ${rotate}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M15 19l-7-7 7-7" />
    </svg>
  )
}

/* ====== MAIN COMPONENT ====== */
export default function CaseListPage() {
  const nav = useNavigate()
  const { cases, addCase } = useCases()
  const [q, setQ] = useState('')
  const [modal, setModal] = useState(false)

  const [pageSize, setPageSize] = useState(PAGE_SIZES[0])
  const [page, setPage] = useState(1)
  const [sortOrder, setSortOrder] = useState(null) // null | 'asc' | 'desc'

  const stats = useMemo(() => {
    const open = cases.filter((c) => c.status === 'Open').length
    const closed = cases.filter((c) => c.status === 'Closed').length
    const reopen = cases.filter((c) => c.status === 'Re-Open').length
    return { open, closed, reopen }
  }, [cases])

  // filter
  const filtered = useMemo(() => {
    let arr = cases.filter(
      (c) =>
        c.name.toLowerCase().includes(q.toLowerCase()) ||
        String(c.id).toLowerCase().includes(q.toLowerCase())
    )

    if (sortOrder) {
      arr = [...arr].sort((a, b) => {
        const da = new Date(a.createdAt).getTime()
        const db = new Date(b.createdAt).getTime()
        return sortOrder === 'asc' ? da - db : db - da
      })
    }

    return arr
  }, [cases, q, sortOrder])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * pageSize
  const currentRows = filtered.slice(start, start + pageSize)

  useEffect(() => setPage(1), [q, pageSize, sortOrder])

  const handleSaveCase = (payload) => {
    const id = addCase(payload)
    setModal(false)
    nav(`/cases/${id}`)
  }

  // fungsi toggle sort
  const toggleSort = () => {
    setSortOrder((prev) => {
      if (prev === null) return 'desc'
      if (prev === 'desc') return 'asc'
      return null
    })
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
        <div className="flex items-center gap-3">
          <div className="relative w-[427px]">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search case"
              className="w-full pl-3 pr-9 py-2 rounded-sm outline-none"
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
          <MiniButton>
            <div className="flex items-center gap-1">
              <img src={iconFilter} width={15} height={15} /> Filter
            </div>
          </MiniButton>
        </div>

        <MiniButton onClick={() => setModal(true)} className="ml-auto">
          <MiniButtonContent bg={bgButton} text="+ Add Case" textColor="text-black" />
        </MiniButton>
      </div>

      {/* === Table Container === */}
      <div
        className="relative border rounded-sm overflow-hidden"
        style={{ borderColor: COLORS.border, background: COLORS.tableBody }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left" style={{ background: COLORS.theadBg }}>
              {[
                'Case ID',
                'Case Name',
                'Investigator',
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
                    <button onClick={toggleSort} className="inline-flex items-center gap-1">
                      <span>Date Created</span>
                      <PiArrowsDownUpBold
                        size={16}
                        style={{
                          color: '#FFFFFF',
                          opacity: sortOrder ? 1 : 0.6,
                          transition: 'opacity 0.2s'
                        }}
                      />
                    </button>
                  ) : (
                    h
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentRows.map((row) => (
              <tr key={row.id} className="hover:bg-white/5">
                <td className="px-4 py-3 border-b" style={{ borderColor: COLORS.border }}>
                  {row.id}
                </td>
                <td className="px-4 py-3 border-b" style={{ borderColor: COLORS.border }}>
                  {row.name}
                </td>
                <td className="px-4 py-3 border-b" style={{ borderColor: COLORS.border }}>
                  {row.investigator || '-'}
                </td>
                <td className="px-4 py-3 border-b" style={{ borderColor: COLORS.border }}>
                  {row.agency || '-'}
                </td>
                <td className="px-4 py-3 border-b" style={{ borderColor: COLORS.border }}>
                  {fmt(row.createdAt)}
                </td>
                <td className="px-4 py-3 border-b" style={{ borderColor: COLORS.border }}>
                  <StatusCell value={row.status || 'Open'} />
                </td>
                <td className="px-4 py-3 border-b" style={{ borderColor: COLORS.border }}>
                  <button
                    onClick={() => nav(`/cases/${row.id}`)}
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
                <td colSpan={7} className="px-4 py-6 text-center" style={{ color: COLORS.dim }}>
                  No cases
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* === Footer Controls (inside same card) === */}
        <div
          className="flex items-center justify-between px-4 py-3 border-t"
          style={{ borderColor: COLORS.border }}
        >
          <div className="flex items-center gap-3">
            <PageSizeDropdown
              value={pageSize}
              onChange={(v) => setPageSize(v)}
              icon={dropdownIcon}
            />
            <TotalCaseCard total={cases.length} />
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
            className="fixed z-[1000] rounded-sm overflow-hidden shadow-lg"
            style={{
              left: pos.left,
              top: pos.top,
              width: pos.width,
              background: '#111720',
              border: '1.5px solid #C3CFE0'
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

/* ====== Pagination ====== */
function Pagination({ page, totalPages, onChange }) {
  const go = (p) => onChange(Math.max(1, Math.min(totalPages, p)))
  const nums = []
  if (totalPages <= 6) {
    for (let i = 1; i <= totalPages; i++) nums.push(i)
  } else {
    nums.push(1, 2, 3, '...', totalPages)
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => go(page - 1)}
        disabled={page === 1}
        className="p-2 disabled:opacity-40"
      >
        <IconChevron dir="left" />
      </button>

      {nums.map((n, idx) =>
        n === '...' ? (
          <span key={`dots-${idx}`} className="px-3">
            …
          </span>
        ) : (
          <button
            key={n}
            onClick={() => go(n)}
            className="min-w-10 h-10 px-3 rounded-sm"
            style={{
              background: n === page ? COLORS.pageActive : 'transparent',
              border: '1px solid transparent'
            }}
          >
            {n}
          </button>
        )
      )}

      <button
        onClick={() => go(page + 1)}
        disabled={page === totalPages}
        className="p-2 disabled:opacity-40"
      >
        <IconChevron dir="right" />
      </button>
    </div>
  )
}

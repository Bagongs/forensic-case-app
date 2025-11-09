// src/renderer/src/pages/user/UserManagement.jsx
/* eslint-disable react/prop-types */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'

import CaseLayout from './CaseLayout'
import MiniButton, { MiniButtonContent } from '../components/MiniButton'
import { useUsers } from '../store/users'
import bgButton from '../assets/image/bg-button.svg'
import iconSearch from '../assets/icons/icon-search.svg'
import dropdownIcon from '../assets/icons/dropdown-icon.svg'

import { LuPencil, LuTrash2 } from 'react-icons/lu'
import { IoChevronForwardSharp, IoChevronBackSharp } from 'react-icons/io5'
import { IoMdArrowRoundBack } from 'react-icons/io'

/* ===== Tokens & Const ===== */
const COLORS = {
  border: 'var(--border)',
  dim: 'var(--dim)',
  theadBg: 'var(--panel)',
  tableBodyBg: 'transparent',

  pageActiveBg: '#273549',
  pageActiveBorder: '#C3CFE0',
  pageInactiveBorder: '#344865',
  arrowGold: '#EDC702',

  pageSizeBg: '#111720',
  pageSizeBorder: '#C3CFE0',
  totalCardBg: '#111720',

  editBg: '#2A3A51',
  editBorder: '#C3CFE0',
  delBg: '#59120C',
  delBorder: '#9D120F'
}
const PAGE_SIZES = [5, 10, 15]

/* ===== Page ===== */
export default function UserManagement() {
  const nav = useNavigate()
  const { users, addUser, editUser, removeUser } = useUsers()
  const [q, setQ] = useState('')
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0])
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const s = q.toLowerCase()
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(s) ||
        u.email?.toLowerCase().includes(s) ||
        String(u.tag || '')
          .toLowerCase()
          .includes(s)
    )
  }, [users, q])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * pageSize
  const rows = filtered.slice(start, start + pageSize)

  useEffect(() => setPage(1), [q, pageSize])

  const handleAddUser = () => {
    // TODO: ganti ke modal Add User milikmu
    const id = addUser?.({ name: 'New User', email: 'new@user.com', tag: 'Investigator' })
    if (id) nav(`/users/${id}`)
  }
  const onEdit = (u) => {
    // TODO: buka modal edit user
    editUser?.(u.id, { name: u.name })
  }
  const onDelete = (u) => {
    // TODO: konfirmasi sebelum hapus
    removeUser?.(u.id)
  }

  return (
    // Kosongkan title bawaan CaseLayout (kita render header custom agar ada ikon Back di sebelah judul)
    <CaseLayout title="">
      {/* Header dengan ikon Back + judul */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => nav(-1)}
          className="inline-flex items-center justify-center w-8 h-8 rounded"
          title="Back"
        >
          <IoMdArrowRoundBack size={22} color={COLORS.arrowGold} />
        </button>
        <h1 className="text-xl font-semibold tracking-wide">USER MANAGEMENT</h1>
      </div>

      {/* Search + Add User */}
      <div className="flex items-center justify-between mb-4">
        <div className="relative w-[427px]">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search User"
            className="w-full pl-3 pr-9 py-2 rounded-sm outline-none"
            style={{ border: '1px solid #C3CFE0', background: 'transparent', color: 'var(--text)' }}
          />
          <img
            src={iconSearch}
            alt="search"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-70 pointer-events-none"
          />
        </div>

        <MiniButton onClick={handleAddUser}>
          <MiniButtonContent bg={bgButton} text="+ Add User" textColor="text-black" />
        </MiniButton>
      </div>

      {/* Tabel */}
      <div
        className="relative border rounded-sm overflow-hidden"
        style={{ borderColor: COLORS.border, background: COLORS.tableBodyBg }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left" style={{ background: COLORS.theadBg }}>
              {['Name', 'Email', 'Tag', 'Action'].map((h) => (
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
            {rows.map((u) => (
              <tr key={u.id || `${u.email}-${u.name}`} className="hover:bg-white/5">
                <td className="px-4 py-3 border-b" style={{ borderColor: COLORS.border }}>
                  {u.name}
                </td>
                <td className="px-4 py-3 border-b" style={{ borderColor: COLORS.border }}>
                  {u.email}
                </td>
                <td className="px-4 py-3 border-b" style={{ borderColor: COLORS.border }}>
                  {u.tag || '-'}
                </td>
                <td className="px-4 py-3 border-b" style={{ borderColor: COLORS.border }}>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(u)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded"
                      title="Edit"
                      style={{
                        background: COLORS.editBg,
                        border: `1.18px solid ${COLORS.editBorder}`
                      }}
                    >
                      <LuPencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(u)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded"
                      title="Delete"
                      style={{
                        background: COLORS.delBg,
                        border: `1.18px solid ${COLORS.delBorder}`
                      }}
                    >
                      <LuTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center" style={{ color: COLORS.dim }}>
                  No users
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Footer controls di dalam card */}
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
            <TotalCard label="Total User" total={users.length} />
          </div>
          <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>
    </CaseLayout>
  )
}

/* ===== PageSize (Portal) ===== */
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
        style={{ background: COLORS.pageSizeBg, border: `1.5px solid ${COLORS.pageSizeBorder}` }}
      >
        <span className="font-medium">{value}</span>
        <img src={icon} className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-1000 rounded-sm overflow-hidden shadow-lg"
            style={{
              left: pos.left,
              top: pos.top,
              width: pos.width,
              background: COLORS.pageSizeBg,
              border: `1.5px solid ${COLORS.pageSizeBorder}`
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

/* ===== Total Card ===== */
function TotalCard({ total = 0, label = 'Total' }) {
  return (
    <div
      className="px-4 py-2 rounded-sm flex items-center gap-2"
      style={{ background: COLORS.totalCardBg, border: `1.5px solid ${COLORS.pageSizeBorder}` }}
    >
      <span className="font-semibold">{total}</span>
      <span className="opacity-90">{label}</span>
    </div>
  )
}

/* ===== Pagination ===== */
function Pagination({ page, totalPages, onChange }) {
  const go = (p) => onChange(Math.max(1, Math.min(totalPages, p)))

  const nums = []
  if (totalPages <= 6) for (let i = 1; i <= totalPages; i++) nums.push(i)
  else nums.push(1, 2, 3, '...', totalPages)

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => go(page - 1)}
        disabled={page === 1}
        className="p-2 disabled:opacity-40"
        title="Previous"
      >
        <IoChevronBackSharp size={18} color={COLORS.arrowGold} />
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
              background: n === page ? COLORS.pageActiveBg : 'transparent',
              border:
                n === page
                  ? `1px solid ${COLORS.pageActiveBorder}`
                  : `1.5px solid ${COLORS.pageInactiveBorder}`
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
        title="Next"
      >
        <IoChevronForwardSharp size={18} color={COLORS.arrowGold} />
      </button>
    </div>
  )
}

// src/renderer/src/pages/case/CaseListPage.jsx
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

const fmt = (iso) => {
  if (!iso) return '-'
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yy = String(d.getFullYear()).slice(-2)
  return `${dd}/${mm}/${yy}`
}

export default function CaseListPage() {
  const nav = useNavigate()
  const { cases, addCase } = useCases()
  const [q, setQ] = useState('')
  const [modal, setModal] = useState(false)

  const stats = useMemo(() => {
    const open = cases.filter((c) => c.status === 'Open').length
    const closed = cases.filter((c) => c.status === 'Closed').length
    const reopen = cases.filter((c) => c.status === 'Re-Open').length
    return { open, closed, reopen }
  }, [cases])

  const filtered = cases.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()))

  // ⬇️ submit AddCaseModal → tambah case → goto detail
  const handleSaveCase = (payload) => {
    const id = addCase(payload) // addCase (di store) me-return id baru
    setModal(false)
    nav(`/cases/${id}`) // langsung ke halaman detail case
  }

  return (
    <CaseLayout title="Case Management">
      {/* stats */}
      <div className="flex justify-start mb-6 -space-x-28">
        <StatsCard value={stats.open} label="Case Open" bg={bgOpen} />
        <StatsCard value={stats.closed} label="Case Closed" bg={bgClose} />
        <StatsCard value={stats.reopen} label="Case Re-Open" bg={bgReopen} />
      </div>

      {/* search + actions */}
      <div className="flex justify-between items-center gap-3 mb-3 w-full ">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative w-[427px]">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search case"
              className="w-full pl-3 pr-3 py-1 border border-[#C3CFE0] bg-transparent"
            />
            <img
              src={iconSearch}
              alt="search"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-70"
            />
          </div>
          {/* <MiniButton
            onClick={() => {
            }}
          >
            Search
          </MiniButton> */}
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
          <MiniButtonContent bg={bgButton} text="+ Add Case" textColor="text-black" />
        </MiniButton>
      </div>

      {/* table */}
      <div className="overflow-hidden border " style={{ borderColor: 'var(--border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left" style={{ background: 'var(--panel)' }}>
              {['Case Name', 'Investigator', 'Agency', 'Date Created', 'Status', 'Action'].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 border-b"
                    style={{ borderColor: 'var(--border)', color: 'var(--dim)' }}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id} className="hover:bg-white/5">
                <td className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                  <div>{row.name}</div>
                  <div className="text-xs opacity-70">ID: {row.id}</div>
                </td>
                <td className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                  {row.investigator || '-'}
                </td>
                <td className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                  {row.agency || '-'}
                </td>
                <td className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                  {fmt(row.createdAt)}
                </td>
                <td className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                  {row.status || 'Open'}
                </td>
                <td className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                  <MiniButton onClick={() => nav(`/cases/${row.id}`)}>Detail</MiniButton>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center" style={{ color: 'var(--dim)' }}>
                  No cases
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* modal tambah case */}
      <AddCaseModal open={modal} onClose={() => setModal(false)} onSave={handleSaveCase} />
    </CaseLayout>
  )
}

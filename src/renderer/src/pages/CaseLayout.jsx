/* eslint-disable react/prop-types */
import { Link, useNavigate, useLocation } from 'react-router-dom'

export default function CaseLayout({ title, right, children }) {
  const { pathname } = useLocation()
  const nav = useNavigate()
  const tab = (to, label) => (
    <Link
      to={to}
      className={`px-4 py-2 rounded-lg border text-sm ${pathname === to ? 'bg-white/10' : 'hover:bg-white/5'}`}
      style={{ borderColor: 'var(--border)' }}
    >
      {label}
    </Link>
  )

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => nav('/dashboard')}
          className="px-3 py-1.5 text-sm rounded-lg border hover:bg-white/10 transition"
          style={{ borderColor: 'var(--border)' }}
        >
          ← Back
        </button>
        {tab('/cases', 'Case management')}
        {tab('/cases/evidence', 'Evidence Management')}
        {tab('/cases/suspects', 'Suspect Management')}
        <div className="ml-auto">
          {right ?? (
            <button
              className="px-3 py-1.5 rounded-lg border text-sm"
              style={{ borderColor: 'var(--border)' }}
            >
              OTA
            </button>
          )}
        </div>
      </div>

      <h1 className="text-5xl font-bold opacity-20 tracking-tight mb-6">{title}</h1>
      {children}
    </div>
  )
}

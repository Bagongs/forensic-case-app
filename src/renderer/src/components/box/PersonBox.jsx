/* eslint-disable react/prop-types */
import { FaEdit } from 'react-icons/fa'
import iconAddEvidance from '../../assets/icons/icon-add-evidance.svg'
// import iconExpand from '../assets/icons/icon-expand.svg' // kalau mau pakai di Add Evidence

export function PersonBox({ name, roleLabel, children, onEdit, onAddEvidence, actionBgImage }) {
  const badgeStatus = (status = 'Unknown') => {
    if (!status || status == 'Unknown') return
    const s = status.toLowerCase()
    let bg = '#222',
      color = '#fff',
      border = '#fff'

    if (s === 'witness') {
      bg = '#004166'
      border = '#9FDCFF'
      color = '#9FDCFF'
    } else if (s === 'reported') {
      bg = '#332E00'
      border = '#D2BA00'
      color = '#D2BA00'
    } else if (s === 'suspected') {
      bg = '#332400'
      border = '#FF7402'
      color = '#FF7402'
    } else if (s === 'suspect') {
      bg = '#511600'
      border = '#FF6551'
      color = '#FF6551'
    } else if (s === 'defendant') {
      bg = '#330006'
      border = '#FF0221'
      color = '#FF0221'
    }

    return (
      <div
        className="py-1 text-[13px] font-semibold text-center rounded-full"
        style={{
          background: bg,
          color,
          border: `2px solid ${border}`,
          width: 'fit-content',
          minWidth: 120
        }}
      >
        {status}
      </div>
    )
  }

  return (
    <div className="px-5 py-6 border" style={{ border: 'none', background: '#151D28' }}>
      {/* header row */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="font-[Aldrich] text-[20px] text-[#F4F6F8]">{name}</div>
          {badgeStatus(roleLabel)}
        </div>

        <div className="flex gap-3">
          {/* tombol EDIT – outline gold */}
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-5 py-1.5 text-[13px] font-[Aldrich] transition hover:brightness-110"
              style={{
                border: '1.5px solid #D1B24A',
                color: '#FFFFFF',
                background: 'transparent'
              }}
            >
              <FaEdit />
              Edit
            </button>
          )}

          {onAddEvidence && (
            <button
              onClick={onAddEvidence}
              className="flex items-center justify-center gap-2 px-5 py-1.5 text-[13px] font-[Aldrich] text-black transition-all active:scale-[0.98]"
              style={{
                background:
                  'radial-gradient(circle at center, rgba(237,199,2,1) 0%, rgba(237,199,2,0.7) 100%)',
                borderTop: '1.5px solid #EDC702B2',
                borderBottom: '1.5px solid #EDC702B2',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.25)'
              }}
            >
              <img src={iconAddEvidance} alt="" className="w-4 h-4 opacity-90" />
              Add Evidence
            </button>
          )}
        </div>
      </div>

      {/* grid evidences */}
      <div className="grid md:grid-cols-2 gap-6">{children}</div>
    </div>
  )
}

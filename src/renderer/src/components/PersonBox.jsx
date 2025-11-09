/* eslint-disable react/prop-types */
import { FaEdit } from 'react-icons/fa'
import iconAddEvidance from '../assets/icons/icon-add-evidance.svg'
// import iconExpand from '../assets/icons/icon-expand.svg' // kalau mau pakai di Add Evidence

export function PersonBox({
  name,
  roleLabel,
  roleColor = '#E0A200',
  children,
  onEdit,
  onAddEvidence,
  actionBgImage
}) {
  return (
    <div className="px-5 py-6 border" style={{ border: 'none', background: '#151D28' }}>
      {/* header row */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="font-[Aldrich] text-[20px] text-[#F4F6F8]">{name}</div>
          {roleLabel && (
            <span
              className="px-3 py-0.5 text-[12px] font-[Noto Sans] rounded-full"
              style={{
                backgroundColor: '#223142',
                color: '#DDE9F7',
                border: '1px solid #3F526B'
              }}
            >
              {roleLabel}
            </span>
          )}
        </div>

        <div className="flex gap-3">
          {/* tombol EDIT – outline gold */}
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-6 py-2 text-[13px] font-[Aldrich] transition hover:brightness-110"
              style={{
                border: '1px solid #D1B24A',
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
              className="flex items-center justify-center gap-2 px-6 py-2 text-[13px] font-[Aldrich] text-black transition-all active:scale-[0.98]"
              style={{
                background:
                  'radial-gradient(circle at center, rgba(237,199,2,1) 0%, rgba(237,199,2,0.7) 100%)',
                borderTop: '1px solid #EDC702B2',
                borderBottom: '1px solid #EDC702B2',
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

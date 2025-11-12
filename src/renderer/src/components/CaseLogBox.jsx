/* eslint-disable react/prop-types */
import { BoxAllSide } from './BaseBox'

export default function CaseLogBox({
  title = 'Case Log',
  logs = [],
  onAction,
  actionLabel = 'Change',
  bg = 'linear-gradient(180deg, #1C2737 -94.25%, #1B2533 100%)',
  borderColor = '#4C607D',
  borderW = 1.5,
  cut = 18
}) {
  return (
    <BoxAllSide className="w-full" cut={cut} borderColor={borderColor} borderW={borderW} bg={bg}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="font-[Aldrich] text-[16px] text-[#F4F6F8]">{title}</div>

        {onAction && (
          <button
            onClick={onAction}
            className="relative overflow-hidden font-[Aldrich] text-[14px] flex items-center justify-center gap-2 hover:brightness-110 transition"
            style={{
              background: 'linear-gradient(180deg, #263449 0%, #2B3C54 100%)',
              borderTop: '1px solid #C3CFE0',
              borderBottom: '1px solid #C3CFE0',
              borderLeft: 'none',
              borderRight: 'none',
              padding: '2px 18px'
            }}
          >
            <span className="relative z-10">{actionLabel}</span>
          </button>
        )}
      </div>

      {/* Timeline */}
      <div className="relative pl-6 border-l border-dashed border-[#6A7A94]">
        {logs.map((log, i) => (
          <div key={i} className="relative mb-6">
            {/* Circle */}
            <div className="absolute -left-[34px] top-1 w-5 h-5 rounded-full border border-[#B9C3D3] bg-[#0F1927]" />

            {/* Content */}
            <div className="text-[#E7E9EE] text-[14px] font-[Noto Sans] leading-relaxed">
              <div className="font-semibold">{log.status}</div>
              {log.by && <div>By: {log.by}</div>}
              {log.date && <div>{log.date}</div>}
              {log.change && (
                <div>
                  Change:
                  <br />
                  {log.change}
                </div>
              )}
              {log.hasNotes && (
                <button
                  className="mt-1 bg-[#1E2A3C] text-[13px]"
                  style={{
                    background: 'linear-gradient(180deg, #222E41 0%, #111720 100%)',
                    borderTop: '1px solid #C3CFE0',
                    borderBottom: '1px solid #C3CFE0',
                    borderLeft: 'none',
                    borderRight: 'none',
                    padding: '2px 18px'
                  }}
                >
                  Notes
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </BoxAllSide>
  )
}

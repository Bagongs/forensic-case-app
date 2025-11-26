/* eslint-disable react/prop-types */
export function EvidenceCard({ image, code, summary, onClick, expandIcon }) {
  // image sudah berisi URL final dari store (previewUrl/image/previewDataUrl)
  return (
    <div
      className="border flex flex-col cursor-pointer hover:brightness-105 transition"
      style={{ borderColor: '#6A7A94', background: '#121A24' }}
      onClick={onClick}
    >
      {/* image */}
      <div
        className="relative w-full h-[210px] overflow-hidden border-b flex items-center justify-center"
        style={{ borderColor: '#6A7A94' }}
      >
        {image ? (
          <>
            <img
              src={image}
              alt=""
              className="w-full h-full object-contain"
              draggable="false"
              onError={(e) => {
                // fallback kalau file_path kosong / 404
                e.currentTarget.style.display = 'none'
              }}
            />
            {expandIcon && <div className="absolute bottom-2 right-2 opacity-90">{expandIcon}</div>}
          </>
        ) : (
          <span className="text-xs opacity-60">No Preview</span>
        )}
      </div>

      {/* text */}
      <div className="p-4 text-[#E7E9EE] font-[Noto Sans] leading-relaxed">
        <div className="text-[#F1CC49] font-semibold text-[15px]">{code || '-'}</div>
        <div className="text-[13px] opacity-80">Evidence Summary</div>
        <p title={summary} className="text-[13.5px] leading-snug mt-1 break-all">
          {(summary?.length > 100 ? summary.slice(0, 100) + '...' : summary) || '-'}
        </p>{' '}
      </div>
    </div>
  )
}

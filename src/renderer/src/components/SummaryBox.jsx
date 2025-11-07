/* eslint-disable react/prop-types */
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

export default function SummaryBox({
  title = 'Summary',
  value = '',
  onChange,
  placeholder = 'Click Add to write summary',
  actionLabel = 'Add',
  onAction,
  actionIcon = null,
  actionBgImage = null,
  actionSize = { w: 132, h: 58.4 },
  actionOffset = { top: 22, right: 24 },
  editable = true,
  rowsMin = 3,

  // style params
  gradient = 'linear-gradient(180deg, #1C2737 -94.25%, #1B2533 100%)',
  borderColor = '#4C607D',
  borderW = 1.5, // sedikit >1px biar tajam di HiDPI
  cut = 18 // besar potongan (px)
}) {
  const textRef = useRef(null)
  const boxRef = useRef(null)

  // autosize textarea
  // useEffect(() => {
  //   if (!textRef.current) return
  //   const el = textRef.current
  //   el.style.height = 'auto'
  //   el.style.height = `${el.scrollHeight}px`
  // }, [value])

  // autofocus saat masuk edit
  // useEffect(() => {
  //   if (editable && textRef.current) textRef.current.focus()
  // }, [editable])

  // ukur container untuk SVG path
  const [size, setSize] = useState({ w: 0, h: 0 })
  useLayoutEffect(() => {
    if (!boxRef.current) return
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0].contentRect
      setSize({ w: cr.width, h: cr.height })
    })
    ro.observe(boxRef.current)
    return () => ro.disconnect()
  }, [])

  // path polygon: cut di kiri-atas & kanan-bawah
  const d = getPathD(size.w, size.h, cut)

  // clipPath untuk konten (inner, dishrink 1px supaya stroke tidak ketutup)
  const innerClip = `polygon(
    ${Math.max(0, cut - borderW)}px ${borderW}px,
    calc(100% - ${borderW}px) ${borderW}px,
    calc(100% - ${borderW}px) calc(100% - ${Math.max(0, cut - borderW)}px),
    calc(100% - ${Math.max(0, cut - borderW)}px) calc(100% - ${borderW}px),
    ${borderW}px calc(100% - ${borderW}px),
    ${borderW}px ${Math.max(0, cut - borderW)}px
  )`

  return (
    <div className="relative w-full" ref={boxRef}>
      {/* SVG border di belakang — tidak kena clip */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width="100%"
        height="100%"
        viewBox={`0 0 ${Math.max(size.w, 1)} ${Math.max(size.h, 1)}`}
        preserveAspectRatio="none"
      >
        <path
          d={d}
          fill="none"
          stroke={borderColor}
          strokeWidth={borderW}
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="miter"
          strokeMiterlimit="2"
        />
      </svg>

      {/* Layer konten (di-clip) */}
      <div
        className="relative p-4"
        style={{
          background: gradient,
          clipPath: innerClip,
          paddingRight: onAction ? `${actionSize.w + 24}px` : undefined
        }}
      >
        {/* Header */}
        <div className="font-[Aldrich] text-[16px] mb-2 text-[#F4F6F8]">{title}</div>

        {/* Body */}
        {editable ? (
          <textarea
            ref={textRef}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            rows={rowsMin}
            tabIndex={-1} // cegah auto focus
            autoFocus={false} // pastikan tidak fokus otomatis
            inputMode="none" // cegah keyboard muncul otomatis di mobile
            className="w-full resize-none bg-transparent outline-none font-[Noto Sans] text-[14px] text-[#E7E9EE] placeholder-[#9AA3B2]"
            style={{
              lineHeight: 1.5,
              overflow: 'hidden',
              minHeight: 36
            }}
          />
        ) : (
          <p className="font-[Noto Sans] text-[14px] text-[#E7E9EE] whitespace-pre-wrap">
            {value || placeholder}
          </p>
        )}

        {/* Tombol kanan-atas */}
        {onAction && (
          <button
            type="button"
            onClick={onAction}
            className="absolute overflow-hidden font-[Aldrich] text-[14px] flex items-center justify-center gap-2 hover:brightness-110 transition"
            style={{
              top: actionOffset.top,
              right: actionOffset.right,
              width: actionSize.w,
              height: actionSize.h,
              background: 'transparent',
              border: 'none'
            }}
          >
            {actionBgImage && (
              <img
                src={actionBgImage}
                alt=""
                className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
                draggable="false"
              />
            )}
            {actionIcon ? <span className="relative z-10">{actionIcon}</span> : null}
            <span className="relative z-10">{actionLabel}</span>
          </button>
        )}
      </div>
    </div>
  )
}

/** Buat path polygon cut-corner untuk ukuran dinamis (px) */
function getPathD(w, h, c) {
  // fallback saat pertama render
  if (!w || !h) return `M0,0 H1 V1 H0 Z`
  const cut = Math.max(0, c)
  return [
    `M ${cut} 0`,
    `H ${w}`, // garis atas
    `V ${h - cut}`, // kanan
    `L ${w - cut} ${h}`, // potong kanan-bawah
    `H 0`, // bawah
    `V ${cut}`, // kiri
    `Z`
  ].join(' ')
}

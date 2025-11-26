/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'

/**
 * NotesBox
 * Disamakan perilakunya dengan SummaryBox:
 * - Ukuran box konsisten antara edit & view
 * - Punya maxBodyHeight + autoGrow
 * - Action button bisa pakai clamp() seperti di SummaryBox
 */
export default function NotesBox({
  title = 'Notes',
  value = '',
  onChange,
  placeholder = 'Click Add to write summary',
  actionLabel = 'Add',
  onAction,
  actionIcon = null,
  actionBgImage = null,

  // default responsif target Figma (sama seperti SummaryBox)
  actionSize = {
    w: 'clamp(70px, 5.2vw, 93.6227px)',
    h: 'clamp(30px, 3vw, 41.5319px)'
  },

  actionOffset = { top: 22, right: 24 },
  editable = true,
  rowsMin = 3,

  // tinggi maksimal area teks
  maxBodyHeight = 240,

  // kontrol perilaku tinggi
  autoGrow = true,

  // styling eksternal wrapper
  className = '',

  // style params
  gradient = 'linear-gradient(180deg, #1C2737 -94.25%, #1B2533 100%)',
  borderColor = '#4C607D',
  borderW = 1.5,
  cut = 18,

  // warna efek glow
  glowColor = '#FFFFFF', // putih utama
  glowShadowAlpha = 0.7,
  glowAuraAlpha = 0.5 // disiapkan kalau nanti mau aura radial
}) {
  const textRef = useRef(null)
  const boxRef = useRef(null)

  // autofocus saat masuk edit
  useEffect(() => {
    if (editable && textRef.current) textRef.current.focus()
  }, [editable])

  // ========== AUTOGROW TINGGI TEXTAREA (BERLAKU DI EDIT & VIEW) ==========
  useEffect(() => {
    if (!autoGrow) return
    if (!textRef.current) return
    const el = textRef.current

    // reset dulu supaya scrollHeight akurat
    el.style.height = 'auto'
    const next = Math.min(el.scrollHeight, maxBodyHeight)
    el.style.height = `${next}px`
  }, [value, editable, autoGrow, maxBodyHeight])

  // ========== UKUR CONTAINER UNTUK SVG BORDER ==========
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

  const d = getPathD(size.w, size.h, cut)

  const innerClip = `polygon(
    ${Math.max(0, cut - borderW)}px ${borderW}px,
    calc(100% - ${borderW}px) ${borderW}px,
    calc(100% - ${borderW}px) calc(100% - ${Math.max(0, cut - borderW)}px),
    calc(100% - ${Math.max(0, cut - borderW)}px) calc(100% - ${borderW}px),
    ${borderW}px calc(100% - ${borderW}px),
    ${borderW}px ${Math.max(0, cut - borderW)}px
  )`

  // ====== SAFE NUMERIC WIDTH FOR PADDING RIGHT ======
  const FALLBACK_W = 93.6227
  const actionWNum = typeof actionSize?.w === 'number' ? actionSize.w : FALLBACK_W
  const paddingRight = onAction ? `${actionWNum + 24}px` : undefined

  const glowShadow = `0 0 14px ${hexToRgba(glowColor, glowShadowAlpha)}`

  // style dasar area teks
  const bodyStyle = {
    lineHeight: 1.5,
    minHeight: 80,
    maxHeight: maxBodyHeight,
    overflowY: autoGrow ? 'hidden' : 'auto', // kalau autoGrow, tinggi diatur JS & hide scrollbar
    paddingRight: 4
  }
  const MAX_CHARS = 2800

  const handleChange = (e) => {
    if (!editable) return

    let text = e.target.value

    if (text.length > MAX_CHARS) {
      text = text.slice(0, MAX_CHARS)
      toast.error('Maximum allowed length exceeded.')
    }

    onChange?.(text)
  }

  return (
    <div ref={boxRef} className={['relative', 'w-full', className].filter(Boolean).join(' ')}>
      {/* SVG border di belakang */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width="100%"
        height="100%"
        viewBox={`0 0 ${Math.max(size.w, 1)} ${Math.max(size.h, 1)}`}
        preserveAspectRatio="none"
        aria-hidden
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

      {/* konten */}
      <div
        className="relative p-4"
        style={{
          background: gradient,
          clipPath: innerClip,
          paddingRight,
          boxShadow: glowShadow
        }}
      >
        {/* Header */}
        <div className="font-[Aldrich] text-[16px] mb-2 text-[#F4F6F8]">{title}</div>

        {/* Body (selalu textarea, supaya ukuran konsisten) */}
        <textarea
          ref={textRef}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          rows={rowsMin}
          readOnly={!editable}
          className={[
            'w-full resize-none bg-transparent outline-none mt-3',
            'font-[Noto Sans] text-[14px] text-[#E7E9EE]',
            'placeholder-[#9AA3B2] custom-scroll'
          ].join(' ')}
          style={bodyStyle}
        />

        {/* Tombol kanan-atas */}
        {onAction && (
          <button
            type="button"
            onClick={onAction}
            title={actionLabel}
            className={[
              'group absolute z-10 overflow-hidden font-[Aldrich] text-[14px]',
              'flex items-center justify-center gap-2',
              'transition-all duration-200 ease-out',
              'hover:brightness-110',
              'focus:outline-none focus:ring-0 rounded'
            ].join(' ')}
            style={{
              top: actionOffset.top,
              right: actionOffset.right,
              width: actionSize.w, // bisa number(px) atau string(clamp)
              height: actionSize.h, // bisa number(px) atau string(clamp)
              border: 'none'
            }}
          >
            {/* background image */}
            {actionBgImage && (
              <img
                src={actionBgImage}
                alt=""
                className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                draggable="false"
              />
            )}

            {/* konten tombol */}
            {actionIcon ? <span className="relative z-10">{actionIcon}</span> : null}
            <span className="relative z-10">{actionLabel}</span>
          </button>
        )}
      </div>
    </div>
  )
}

/** Path polygon cut-corner */
function getPathD(w, h, c) {
  if (!w || !h) return `M0,0 H1 V1 H0 Z`
  const cut = Math.max(0, c)
  return [`M ${cut} 0`, `H ${w}`, `V ${h - cut}`, `L ${w - cut} ${h}`, `H 0`, `V ${cut}`, `Z`].join(
    ' '
  )
}

/** Konversi HEX → RGBA */
function hexToRgba(hex, alpha = 1) {
  const h = hex.replace('#', '')
  const bigint = parseInt(
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h,
    16
  )
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

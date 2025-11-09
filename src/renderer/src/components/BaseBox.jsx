/* eslint-disable react/prop-types */
import { useLayoutEffect, useRef, useState } from 'react'

function BaseCutBox({
  children,
  cut = 16,
  borderColor = '#C3CFE0',
  borderW = 1.5,
  bg = '#111720',
  type = 'none',
  className = '',
  // params untuk notch chamfered
  notchWidth = 180,
  notchDepth = 26,
  notchOffset = 'center', // number px atau 'center'
  notchChamfer = 14,      // panjang sisi miring pada bibir notch
  // padding isi
  contentPadding = 24,
  contentPaddingTop // default = contentPadding
}) {
  const ref = useRef(null)
  const [size, setSize] = useState({ w: 0, h: 0 })

  useLayoutEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ w: width, h: height })
    })
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])

  const path = getPathByType(size.w, size.h, cut, type, {
    notchWidth, notchDepth, notchOffset, notchChamfer
  })
  const clipPath = getInnerClipPath(size.w, size.h, cut, type, borderW, {
    notchWidth, notchDepth, notchOffset, notchChamfer
  })

  const padTop = contentPaddingTop ?? contentPadding

  return (
    <div ref={ref} className={`relative w-full ${className}`}>
      {/* BORDER (SVG) */}
      <svg
        className="absolute inset-0 pointer-events-none z-10"
        width="100%"
        height="100%"
        viewBox={`0 0 ${Math.max(size.w, 1)} ${Math.max(size.h, 1)}`}
        preserveAspectRatio="none"
        shapeRendering="crispEdges"
        aria-hidden
      >
        <path
          d={path}
          fill="none"
          stroke={borderColor}
          strokeWidth={borderW}
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="miter"
          strokeMiterlimit={2}
        />
      </svg>

      {/* CONTENT (clip-path dikompensasi borderW) */}
      <div
        className="relative"
        style={{
          background: bg,
          clipPath,
          padding: `${padTop}px ${contentPadding}px ${contentPadding}px ${contentPadding}px`
        }}
      >
        {children}
      </div>
    </div>
  )
}

/* ================= BORDER PATH ================= */
function getPathByType(w, h, c, type, extra = {}) {
  if (!w || !h) return 'M0,0 H1 V1 H0 Z'
  const o = 0.6 // offset kecil untuk chamfer sudut luar agar anti-alias halus
  const cut = Math.max(0, c)

  const withTopNotchChamfered = () => {
    const {
      notchWidth = 180,
      notchDepth = 26,
      notchOffset = 'center',
      notchChamfer = 14
    } = extra

    const nW = Math.max(2 * notchChamfer + 2, Math.min(notchWidth, w - 2 * cut - 4))
    const nD = Math.max(2, Math.min(notchDepth, h - cut - 2))
    const nC = Math.max(2, Math.min(notchChamfer, Math.floor(nW / 2) - 1))

    const startX =
      notchOffset === 'center'
        ? Math.max(cut, (w - nW) / 2)
        : Math.max(cut, Math.min(w - cut - nW, Number(notchOffset)))

    const L = startX
    const R = startX + nW

    // urutan: top-left chamfer → top ke L → serong turun (nC) → dasar notch →
    // serong naik (nC) → top ke kanan → chamfer kanan → sisi lain → tutup
    return [
      `M ${cut + o} 0`,
      `H ${L}`,                 // ke awal notch
      `L ${L + nC} ${nD}`,     // serong turun
      `H ${R - nC}`,           // dasar notch
      `L ${R} 0`,              // serong naik
      `H ${w - cut - o}`,      // lanjut top kanan
      `L ${w} ${cut}`,         // chamfer kanan-atas
      `V ${h - cut}`,          // sisi kanan
      `L ${w - cut} ${h}`,     // chamfer kanan-bawah
      `H ${cut}`,              // sisi bawah
      `L 0 ${h - cut}`,        // chamfer kiri-bawah
      `V ${cut}`,              // sisi kiri
      'Z'
    ].join(' ')
  }

  switch (type) {
    case 'allSideWithTopNotchChamfered':
      return withTopNotchChamfered()

    // tipe-tipe lain yang sudah ada
    case 'topRight':
      return [
        `M ${o} ${o}`, `H ${w - cut - o}`, `L ${w - o} ${cut + o}`,
        `V ${h - o}`, `H ${o}`, 'Z'
      ].join(' ')
    case 'bottomRight':
      return [
        `M ${o} ${o}`, `H ${w - o}`, `V ${h - cut - o}`,
        `L ${w - cut - o} ${h - o}`, `H ${o}`, 'Z'
      ].join(' ')
    case 'topLeft':
      return [
        `M ${cut + o} ${o}`, `H ${w - o}`, `V ${h - o}`,
        `H ${o}`, `V ${cut + o}`, 'Z'
      ].join(' ')
    case 'topLeftBottomRight':
      return [
        `M ${cut + o} ${o}`, `H ${w - o}`, `V ${h - cut - o}`,
        `L ${w - cut - o} ${h - o}`, `H ${o}`, `V ${cut + o}`, 'Z'
      ].join(' ')
    case 'allSide':
      return [
        `M ${cut + o} ${o}`, `H ${w - cut - o}`, `L ${w - o} ${cut + o}`,
        `V ${h - cut - o}`, `L ${w - cut - o} ${h - o}`, `H ${cut + o}`,
        `L ${o} ${h - cut - o}`, `V ${cut + o}`, 'Z'
      ].join(' ')
    default:
      return `M${o},${o} H${w - o} V${h - o} H${o} Z`
  }
}

/* ================= CLIP-PATH (ISI) ================= */
function getInnerClipPath(w, h, c, type, borderW, extra = {}) {
  if (!w || !h) return 'none'
  const x0 = borderW, y0 = borderW
  const x1 = w - borderW, y1 = h - borderW
  const c2 = Math.max(0, c - borderW)
  const pct = (x, y) => `${(x / w) * 100}% ${(y / h) * 100}%`

  if (type === 'allSideWithTopNotchChamfered') {
    const {
      notchWidth = 180,
      notchDepth = 26,
      notchOffset = 'center',
      notchChamfer = 14
    } = extra

    const nW = Math.max(2, Math.min(notchWidth - 2 * borderW, w - 2 * c2 - 4))
    const nD = Math.max(1, Math.min(notchDepth - borderW, h - c2 - 2))
    const nC = Math.max(1, Math.min(notchChamfer - borderW, Math.floor(nW / 2) - 1))

    const startX =
      notchOffset === 'center'
        ? Math.max(c2 + x0, (w - nW) / 2)
        : Math.max(c2 + x0, Math.min(w - c2 - x0 - nW, Number(notchOffset)))

    const L = startX
    const R = startX + nW

    const pts = [
      [x0 + c2, y0],       // top-left inner setelah chamfer
      [L, y0],             // ke awal notch
      [L + nC, y0 + nD],   // serong turun
      [R - nC, y0 + nD],   // dasar notch
      [R, y0],             // serong naik
      [x1 - c2, y0],       // top ke kanan
      [x1, y0 + c2],       // chamfer kanan-atas (inner)
      [x1, y1 - c2],
      [x1 - c2, y1],
      [x0 + c2, y1],
      [x0, y1 - c2],
      [x0, y0 + c2]
    ]

    return `polygon(${pts.map(([x, y]) => pct(x, y)).join(', ')})`
  }

  const make = (pts) => `polygon(${pts.map(([x, y]) => pct(x, y)).join(', ')})`

  switch (type) {
    case 'topRight':
      return make([[x0,y0],[x1 - c2,y0],[x1,y0 + c2],[x1,y1],[x0,y1]])
    case 'bottomRight':
      return make([[x0,y0],[x1,y0],[x1,y1 - c2],[x1 - c2,y1],[x0,y1]])
    case 'topLeft':
      return make([[x0 + c2,y0],[x1,y0],[x1,y1],[x0,y1],[x0,y0 + c2]])
    case 'topLeftBottomRight':
      return make([[x0 + c2,y0],[x1,y0],[x1,y1 - c2],[x1 - c2,y1],[x0,y1],[x0,y0 + c2]])
    case 'allSide':
      return make([
        [x0 + c2,y0],[x1 - c2,y0],[x1,y0 + c2],
        [x1,y1 - c2],[x1 - c2,y1],[x0 + c2,y1],
        [x0,y1 - c2],[x0,y0 + c2]
      ])
    default:
      return make([[x0,y0],[x1,y0],[x1,y1],[x0,y1]])
  }
}

/* ================= EXPORT WRAPPERS ================= */
export const BoxAllSideWithTopNotchChamfered = (props) => (
  <BaseCutBox {...props} type="allSideWithTopNotchChamfered" />
)
export const BoxAllSide = (props) => <BaseCutBox {...props} type="allSide" />
export const BoxTopLeftBottomRight = (props) => <BaseCutBox {...props} type="topLeftBottomRight" />
export const BoxTopRight = (props) => <BaseCutBox {...props} type="topRight" />
export const BoxBottomRight = (props) => <BaseCutBox {...props} type="bottomRight" />
export const BoxTopLeft = (props) => <BaseCutBox {...props} type="topLeft" />
export const BoxNone = (props) => <BaseCutBox {...props} type="none" />
export default BaseCutBox

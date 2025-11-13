/* eslint-disable react/prop-types */
import { useId, useLayoutEffect, useRef, useState } from 'react'
import upperCard from '../../assets/image/upper-card.svg'

// koordinat asli dari PATH_D (basis 1291 x 319)
const DEFAULTS = {
  baseW: 1291,
  baseH: 319,

  topY: 0.75,
  notchStartX: 368.22,
  notchL1X: 429.666,
  notchL1Y: 56.8008,
  notchL2X: 429.881,
  notchL2Y: 56.9961,
  rightInnerX: 1276.12,
  rightOuterX: 1290.25,
  rightChamferTopY: 70.9805,
  rightChamferBottomY: 304.737,
  bottomY: 318.25,
  innerLeftX: 14.875,
  outerLeftX: 0.75,
  leftChamferBottomY: 304.265,
  leftChamferTopY: 14.7344
}

export default function ExactSvgCutBox({
  children,
  viewBoxW = DEFAULTS.baseW,
  viewBoxH = DEFAULTS.baseH, // sama dengan baseH
  fill = '#111720',
  stroke = '#C3CFE0',
  strokeWidth = 1.5,
  className = '',

  // 🔹 padding internal (pakai px fix)
  paddingX = 40, // kiri
  paddingRight = 36, // kanan
  paddingBottom = 47, // bawah
  titlePaddingTop = 41,
  contentSpacing = 20,
  titleFontSize = 30,

  // overlay asset atas
  showUpperAsset = true,
  upperAsset = upperCard,
  upperAssetHeight = 23,
  upperAssetOffset = 25,

  coords = DEFAULTS
}) {
  const clipId = useId()
  const wrapRef = useRef(null)
  const measureRef = useRef(null)
  const [extraV, setExtraV] = useState(0)

  const C = { ...DEFAULTS, ...coords }
  const { baseH } = C

  useLayoutEffect(() => {
    if (!wrapRef.current || !measureRef.current) return

    let raf = 0
    const recalc = () => {
      const wrap = wrapRef.current
      const meas = measureRef.current
      const wrapRect = wrap.getBoundingClientRect()
      const wrapWpx = Math.max(1, wrapRect.width)

      const pxPerUnit = wrapWpx / viewBoxW

      // 🔹 tinggi konten aktual (SUDAH termasuk padding top & bottom) dalam px
      const contentPx = meas.scrollHeight

      // 🔹 kita ingin tinggi kartu persis mengikuti tinggi konten + padding,
      // jadi hitung tinggi viewBox yang dibutuhkan dalam "unit" SVG
      const desiredUnits = contentPx / pxPerUnit

      // ekstra tinggi (bisa positif = tambah, bisa negatif = dipendekkan)
      const extraUnits = desiredUnits - baseH

      const rounded = Math.round(extraUnits * 100) / 100
      setExtraV(rounded)
    }

    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(recalc)
    })

    ro.observe(wrapRef.current)
    ro.observe(measureRef.current)

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        cancelAnimationFrame(raf)
        raf = requestAnimationFrame(recalc)
      })
    }

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [viewBoxW, baseH])

  const dynViewH = viewBoxH + extraV

  // padding konten: top right bottom left (murni px)
  const paddingStyle = {
    paddingTop: `${titlePaddingTop}px`,
    paddingRight: `${paddingRight}px`,
    paddingBottom: `${paddingBottom}px`,
    paddingLeft: `${paddingX}px`
  }

  const titleSizePx = `${titleFontSize}px`
  const gapPx = `${contentSpacing}px`

  const finalPathD = buildPathD(C, extraV)

  return (
    <div ref={wrapRef} className={`relative w-full ${className}`} style={{ isolation: 'isolate' }}>
      {/* overlay asset atas */}
      {showUpperAsset && (
        <img
          src={upperAsset}
          alt=""
          draggable="false"
          className="absolute left-1/2 -translate-x-1/2 select-none pointer-events-none"
          style={{
            top: upperAssetOffset,
            height: upperAssetHeight,
            objectFit: 'contain',
            zIndex: 0
          }}
        />
      )}

      {/* measurer (tak terlihat) untuk hitung tinggi konten */}
      <div
        ref={measureRef}
        className="invisible absolute -z-10 left-0 top-0 w-full"
        style={{
          boxSizing: 'border-box',
          ...paddingStyle,
          color: '#E7E9EE',
          fontFamily: 'Noto Sans, sans-serif',
          lineHeight: 1.5
        }}
      >
        {typeof children === 'function'
          ? children({ titleFontSize: titleSizePx, contentSpacing: gapPx })
          : children}
      </div>

      {/* SVG bentuk kartu */}
      <svg
        className="block w-full"
        viewBox={`0 0 ${viewBoxW} ${dynViewH}`}
        preserveAspectRatio="xMidYMid meet"
        shapeRendering="crispEdges"
        aria-hidden={false}
        style={{
          position: 'relative',
          zIndex: 1,
          height: 'auto'
        }}
      >
        {/* background */}
        <path d={finalPathD} fill={fill} />

        {/* border */}
        <path
          d={finalPathD}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="miter"
          strokeMiterlimit={2}
        />

        {/* clip path untuk konten */}
        <clipPath id={clipId}>
          <path d={finalPathD} />
        </clipPath>

        {/* konten HTML di dalam kartu */}
        <foreignObject x="0" y="0" width={viewBoxW} height={dynViewH} clipPath={`url(#${clipId})`}>
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            style={{
              width: '100%',
              height: '100%',
              boxSizing: 'border-box',
              ...paddingStyle,
              color: '#E7E9EE',
              fontFamily: 'Noto Sans, sans-serif',
              lineHeight: 1.5
            }}
          >
            {typeof children === 'function'
              ? children({ titleFontSize: titleSizePx, contentSpacing: gapPx })
              : children}
          </div>
        </foreignObject>
      </svg>
    </div>
  )
}

/**
 * PATH_D asli (kartu) tapi titik-titik bawah digeser turun +extraV
 */
function buildPathD(c, extraV = 0) {
  const {
    topY,
    notchStartX,
    notchL1X,
    notchL1Y,
    notchL2X,
    notchL2Y,
    rightInnerX,
    rightOuterX,
    rightChamferTopY,
    rightChamferBottomY,
    bottomY,
    innerLeftX,
    outerLeftX,
    leftChamferBottomY,
    leftChamferTopY
  } = c

  const yRightChamferBottom = rightChamferBottomY + extraV
  const yBottom = bottomY + extraV
  const yLeftChamferBottom = leftChamferBottomY + extraV

  return [
    `M${notchStartX} ${topY}`,
    `L${notchL1X} ${notchL1Y}`,
    `L${notchL2X} ${notchL2Y}`,
    `H${rightInnerX}`,
    `L${rightOuterX} ${rightChamferTopY}`,
    `V${yRightChamferBottom}`,
    `L${rightInnerX} ${yBottom}`,
    `H${innerLeftX}`,
    `L${outerLeftX} ${yLeftChamferBottom}`,
    `V${leftChamferTopY}`,
    `L${innerLeftX} ${topY}`,
    `H${notchStartX}`,
    'Z'
  ].join(' ')
}

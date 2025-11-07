/* eslint-disable react/prop-types */
import { useLayoutEffect, useRef, useState } from 'react'

// ===== Base reusable box =====
function BaseCutBox({
  children,
  cut = 16,
  borderColor = '#4C607D',
  borderW = 1.4,
  bg = '#151D28',
  type = 'none',
  className = ''
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

  const path = getPathByType(size.w, size.h, cut, type)

  return (
    <div ref={ref} className={`relative w-full ${className}`}>
      {/* border */}
      <svg
        className="absolute inset-0 pointer-events-none z-10"
        width="100%"
        height="100%"
        viewBox={`0 0 ${Math.max(size.w, 1)} ${Math.max(size.h, 1)}`}
        preserveAspectRatio="none"
      >
        <path
          d={path}
          fill="none"
          stroke={borderColor}
          strokeWidth={borderW}
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* content */}
      <div
        className="relative p-6"
        style={{
          background: bg,
          clipPath: getClipPath(size.w, size.h, cut, type)
        }}
      >
        {children}
      </div>
    </div>
  )
}

// ===== Path Generator per tipe =====
function getPathByType(w, h, c, type) {
  if (!w || !h) return 'M0,0 H1 V1 H0 Z'
  const o = 0.6
  const cut = Math.max(0, c)

  switch (type) {
    case 'topRight':
      return [
        `M ${o} ${o}`,
        `H ${w - cut - o}`,
        `L ${w - o} ${cut + o}`,
        `V ${h - o}`,
        `H ${o}`,
        'Z'
      ].join(' ')

    case 'bottomRight':
      return [
        `M ${o} ${o}`,
        `H ${w - o}`,
        `V ${h - cut - o}`,
        `L ${w - cut - o} ${h - o}`,
        `H ${o}`,
        'Z'
      ].join(' ')

    case 'topLeft':
      return [
        `M ${cut + o} ${o}`,
        `H ${w - o}`,
        `V ${h - o}`,
        `H ${o}`,
        `V ${cut + o}`,
        'Z',
      ].join(' ')

    case 'topLeftBottomRight':
      return [
        `M ${cut + o} ${o}`,
        `H ${w - o}`,
        `V ${h - cut - o}`,
        `L ${w - cut - o} ${h - o}`,
        `H ${o}`,
        `V ${cut + o}`,
        'Z'
      ].join(' ')

    case 'allSide':
      return [
        `M ${cut + o} ${o}`,
        `H ${w - cut - o}`,
        `L ${w - o} ${cut + o}`,
        `V ${h - cut - o}`,
        `L ${w - cut - o} ${h - o}`,
        `H ${cut + o}`,
        `L ${o} ${h - cut - o}`,
        `V ${cut + o}`,
        'Z'
      ].join(' ')

    default:
      return `M${o},${o} H${w - o} V${h - o} H${o} Z`
  }
}

// ===== Clip path buat isi (biar match potongan border) =====
function getClipPath(w, h, c, type) {
  switch (type) {
    case 'topRight':
      return `polygon(
        0 0, calc(100% - ${c}px) 0, 100% ${c}px,
        100% 100%, 0 100%
      )`
    case 'bottomRight':
      return `polygon(
        0 0, 100% 0, 100% calc(100% - ${c}px),
        calc(100% - ${c}px) 100%, 0 100%
      )`
    case 'topLeft':
      return `polygon(
        ${c}px 0, 100% 0, 100% 100%, 0 100%, 0 ${c}px
      )`
    case 'topLeftBottomRight':
      return `polygon(
        ${c}px 0, 100% 0, 100% calc(100% - ${c}px),
        calc(100% - ${c}px) 100%, 0 100%, 0 ${c}px
      )`
    case 'allSide':
      return `polygon(
        ${c}px 0, calc(100% - ${c}px) 0, 100% ${c}px,
        100% calc(100% - ${c}px), calc(100% - ${c}px) 100%,
        ${c}px 100%, 0 calc(100% - ${c}px), 0 ${c}px
      )`
    default:
      return 'none'
  }
}

// ===== Export wrapper components =====
export const BoxTopRight = (props) => <BaseCutBox {...props} type="topRight" />
export const BoxNone = (props) => <BaseCutBox {...props} type="none" />
export const BoxTopLeftBottomRight = (props) => <BaseCutBox {...props} type="topLeftBottomRight" />
export const BoxAllSide = (props) => <BaseCutBox {...props} type="allSide" />

export default BaseCutBox

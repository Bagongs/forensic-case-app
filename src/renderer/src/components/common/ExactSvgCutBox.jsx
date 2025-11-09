/* eslint-disable react/prop-types */
import { useId } from 'react'
import upperCard from '../../assets/image/upper-card.svg'

export default function ExactSvgCutBox({
  children,
  viewBoxW = 1291,
  viewBoxH = 319,
  pathD,
  fill = '#111720',
  stroke = '#C3CFE0',
  strokeWidth = 1.5,
  className = '',
  height = 220,

  // spacing internal
  paddingX = 40,
  titlePaddingTop = 41,
  contentSpacing = 20,
  titleFontSize = 30,

  // overlay asset atas
  showUpperAsset = true,
  upperAsset = upperCard,
  upperAssetHeight = 23,
  upperAssetOffset = 25
}) {
  const clipId = useId()

  return (
    <div className={`relative w-full ${className}`} style={{ height }}>
      {/* Overlay asset atas */}
      {showUpperAsset && (
        <img
          src={upperAsset}
          alt=""
          draggable="false"
          className="absolute left-1/2 -translate-x-1/2 select-none pointer-events-none"
          style={{
            top: upperAssetOffset, // tidak diubah
            height: upperAssetHeight, // tidak diubah
            objectFit: 'contain'
          }}
        />
      )}

      {/* SVG utama */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}
        preserveAspectRatio="none"
        shapeRendering="crispEdges"
        aria-hidden={false}
      >
        {/* background */}
        <path d={pathD} fill={fill} />
        {/* border */}
        <path
          d={pathD}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="miter"
          strokeMiterlimit={2}
        />

        {/* definisi clipPath untuk konten */}
        <clipPath id={clipId}>
          <path d={pathD} />
        </clipPath>

        {/* konten di dalam clip */}
        <foreignObject x="0" y="0" width={viewBoxW} height={viewBoxH} clipPath={`url(#${clipId})`}>
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            style={{
              width: '100%',
              height: '100%',
              boxSizing: 'border-box',
              padding: `${titlePaddingTop}px ${paddingX}px ${paddingX}px ${paddingX}px`,
              color: '#E7E9EE',
              fontFamily: 'Noto Sans, sans-serif'
            }}
          >
            {typeof children === 'function'
              ? children({ titleFontSize, contentSpacing })
              : children}
          </div>
        </foreignObject>
      </svg>
    </div>
  )
}

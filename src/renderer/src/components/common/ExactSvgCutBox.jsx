/* eslint-disable react/prop-types */
import upperCard from '../../assets/image/upper-card.svg'

/**
 * 3-slice cut box:
 * - Top cap: SVG (punya notch & border atas)
 * - Body: HTML biasa (auto-height) dengan border kiri/kanan/bawah
 *   => konten bebas setinggi apapun tanpa foreignObject
 */
export default function ExactSvgCutBoxAuto({
  children,
  className = '',

  // warna & garis
  fill = '#111720',
  stroke = '#C3CFE0',
  strokeWidth = 1.5,

  // layout & spacing
  paddingX = 40,
  titlePaddingTop = 41,
  contentSpacing = 20,
  titleFontSize = 30,

  // ukuran top cap (tinggi harus cukup buat notch + border atas)
  capWidth = 1291,
  capHeight = 86,

  // ornamen atas
  showUpperAsset = true,
  upperAsset = upperCard,
  upperAssetHeight = 23,
  upperAssetOffset = 25,

  // path cap atas (notch). Kalau tidak butuh custom, biarkan default.
  pathD = `
M368.22 0.75
L429.666 56.8008
L429.881 56.9961
H1276.12
L1290.25 70.9805
V85.25
H14.875
L0.75 71.265
V14.7344
L14.875 0.75
H368.22
Z`.trim()
}) {
  // paddingTop efektif = jarak dari bagian bawah cap ke area judul
  const effectiveTopPadding = Math.max(0, titlePaddingTop - (capHeight - strokeWidth))

  return (
    <div className={`relative w-full ${className}`}>
      {/* ===== Top Cap (SVG) ===== */}
      <div className="relative" style={{ height: capHeight }}>
        {showUpperAsset && (
          <img
            src={upperAsset}
            alt=""
            draggable="false"
            className="absolute left-1/2 -translate-x-1/2 select-none pointer-events-none"
            style={{
              top: upperAssetOffset,
              height: upperAssetHeight,
              objectFit: 'contain'
            }}
          />
        )}

        <svg
          className="absolute inset-0 w-full h-full"
          viewBox={`0 0 ${capWidth} ${capHeight}`}
          preserveAspectRatio="none"
          shapeRendering="crispEdges"
          aria-hidden="true"
        >
          {/* background */}
          <path d={pathD} fill={fill} />
          {/* border top & sisi miring */}
          <path
            d={pathD}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="miter"
            strokeMiterlimit={2}
          />
        </svg>
      </div>

      {/* ===== Body (HTML auto-height) ===== */}
      <div
        className="border-x border-b"
        style={{
          backgroundColor: fill,
          borderColor: stroke,
          borderWidth: strokeWidth,
          padding: `${effectiveTopPadding}px ${paddingX}px ${paddingX}px ${paddingX}px`,
          color: '#E7E9EE',
          fontFamily: 'Noto Sans, sans-serif'
        }}
      >
        {typeof children === 'function' ? children({ titleFontSize, contentSpacing }) : children}
      </div>
    </div>
  )
}

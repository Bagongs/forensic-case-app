/* eslint-disable react/prop-types */
import { Link, useNavigate, useLocation } from 'react-router-dom'
import headerImg from '../assets/image/header.svg'
import ProfileCorner from '../components/ProfileCorner'
import { FaArrowLeft } from 'react-icons/fa'
import { useScreenMode } from '../hooks/useScreenMode'

export default function CaseLayout({ title, showBack = false, children }) {
  const { pathname } = useLocation()
  const nav = useNavigate()
  const mode = useScreenMode()

  const MODE = {
    default: {
      tabPx: 80,
      tabPxR: 70,
      tabPy: 12,
      tabFont: 13,
      tabShiftX: 0,
      tabTop: 0,
      maxWidth: '1280px'
    },
    wide: {
      tabPx: 100,
      tabPxR: 100,
      tabPy: 16,
      tabFont: 16,
      tabShiftX: 5,
      tabTop: 8,
      maxWidth: '1650px'
    },
    ultra: {
      tabPx: 130,
      tabPxR: 130,
      tabPy: 20,
      tabFont: 20,
      tabShiftX: -20,
      tabTop: 20,
      maxWidth: '2180px'
    }
  }

  const cfg = MODE[mode]

  // ---------- TAB ITEM -----------
  const tab = (to, label) => {
    const isActive = pathname === to || pathname.startsWith(`${to}/`)

    return (
      <Link
        to={to}
        className="relative transition-all font-semibold"
        style={{
          paddingLeft: cfg.tabPx,
          paddingRight: cfg.tabPxR,
          paddingTop: cfg.tabPy,
          paddingBottom: cfg.tabPy,
          fontSize: cfg.tabFont,
          background: isActive
            ? 'linear-gradient(to top, #022752 0%, #1D4987 100%)'
            : 'linear-gradient(to top, #001226 0%, #212D3E 100%)',
          clipPath: 'polygon(18% 0%, 100% 0%, 80% 100%, 0% 100%)',
          color: isActive ? '#FFD84C' : '#FFFFFF',
          border: '1px solid #2A3A51'
        }}
      >
        {label}
      </Link>
    )
  }

  return (
    <div className="relative overflow-x-hidden">
      {/* HEADER IMAGE */}
      <img
        src={headerImg}
        alt=""
        className="absolute top-0 left-0 w-screen h-auto object-cover -z-10"
      />

      <div
        className="relative mx-auto px-5 py-6"
        style={{
          maxWidth: cfg.maxWidth
        }}
      >
        <div
          className="flex justify-end items-center -space-x-9 mb-5"
          style={{
            marginTop: cfg.tabTop,
            transform: `translateX(${cfg.tabShiftX}px)`,
            transition: 'transform 0.25s ease'
          }}
        >
          {tab('/cases', 'Case Management')}
          {tab('/evidence', 'Evidence Management')}
          {tab('/suspects', 'Suspect Management')}
        </div>

        <h1 className="text-3xl font-bold mt-10 relative">
          {showBack && (
            <button
              onClick={() => nav(-1)}
              className="absolute -left-10 mt-2 text-sm mb-4 text-[#EDC702]"
            >
              <FaArrowLeft size={20} />
            </button>
          )}
          {title}
        </h1>

        {children}
      </div>

      <div className="absolute top-8 right-5">
        <ProfileCorner label="Admin" active={pathname.includes('/user-management')} />
      </div>
    </div>
  )
}

/* eslint-disable react/prop-types */
import { Link, useNavigate, useLocation } from 'react-router-dom'
import headerImg from '../assets/image/header.svg'
import iconBack from '../assets/icons/icon-back.svg'

export default function CaseLayout({ title, showBack = false ,children }) {
  const { pathname } = useLocation()
  const nav = useNavigate()
  const tab = (to, label) => {
    const isActive = pathname === to || pathname.startsWith(`${to}/`)
    return (
      <Link
        to={to}
        className="relative px-16 py-3 text-sm font-semibold transition-all duration-300"
        style={{
          background: isActive
            ? 'linear-gradient(to top, #022752 0%, #1D4987 100%)'
            : 'linear-gradient(to top, #001226 0%, #212D3E 100%)',
          clipPath: 'polygon(18% 0%, 100% 0%, 80% 100%, 0% 100%)',
          color: isActive ? '#FFD84C' : '#FFFFFF',
          border: '1px solid #2A3A51'
        }}
      >
        <h6 className="text-[13px]">{label}</h6>
      </Link>
    )
  }

  return (
    <div className="relative">
      <img
        src={headerImg}
        alt=""
        className="absolute top-0 left-0 w-screen h-auto object-cover -z-10"
      />
      <div className="relative max-w-7xl mx-auto px-5 py-6">
        <div className="absolute flex justify-end items-center -space-x-9 mb-5 right-16">
          {tab('/cases', 'Case Management')}
          {tab('/evidence', 'Evidence Management')}
          {tab('/suspects', 'Suspect Management')}
        </div>
        <h1 className="text-3xl font-bold mt-20 relative">
          {showBack && (
            <button 
            onClick={() => nav(-1)} 
            className="absolute -left-12 text-sm mb-4 text-[#EDC702]">
              <img width={35} height={35} src={iconBack} />
            </button>
          )}
          {title}
        </h1>
        {children}
      </div>
    </div>
  )
}

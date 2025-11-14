/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FaUsersCog,
  FaSignOutAlt,
  FaEye,
  FaChevronUp,
  FaChevronDown,
  FaUserCircle
} from 'react-icons/fa'

export default function ProfileCorner({ label = 'Admin', active = false }) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  // Klik di luar → tutup dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  const handleLogout = () => {
    setOpen(false)
    navigate('/login')
  }

  return (
    <div className="absolute mt-6 right-0 top-0 w-auto -mr-36" ref={dropdownRef}>
      {/* === Button utama === */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full px-16 py-3 text-sm relative flex items-center justify-center text-white font-[Aldrich] gap-2"
        style={{
          background: active
            ? 'linear-gradient(180deg, #022752 0%, #1D4987 100%)'
            : 'linear-gradient(90deg, #1D2939 0%, #52729F 100%)',
          clipPath: 'polygon(20% 0%, 100% 0%, 80% 100%, 0% 100%)',
          color: active ? '#FFD84C' : '#FFFFFF',
          border: '1px solid #2A3A51'
        }}
      >
        <FaUserCircle /> {label} {open ? <FaChevronUp /> : <FaChevronDown />}
      </button>

      {/* === Dropdown === */}
      {open && (
        <div
          className="absolute right-0 mt-3 w-64 mr-16 rounded-sm shadow-lg z-50 border border-[#2A3A51] font-[Noto Sans]"
          style={{
            backgroundColor: '#0F1722'
          }}
        >
          {/* user info */}
          <div className="p-4 border-b border-[#2A3A51]">
            <div className="text-white font-semibold text-sm">{label.toLowerCase()}</div>
            <div className="text-gray-400 text-xs">admin1@tech.com</div>
            <div className="flex items-center gap-2 text-gray-400 text-xs mt-2">
              <FaEye className="opacity-60" />
              <span>••••••••••••</span>
            </div>
          </div>

          {/* user management */}
          <Link
            to="/user-management"
            className="flex items-center gap-2 px-4 py-3 text-sm text-white border-b border-[#2A3A51] hover:bg-[#1A2638] transition"
            onClick={() => setOpen(false)}
          >
            <FaUsersCog className="text-[#A9CCFD]" />
            User management
          </Link>

          {/* logout */}
          <button
            className="flex items-center gap-2 px-4 py-3 text-sm text-white hover:bg-[#1A2638] w-full text-left transition"
            onClick={handleLogout}
          >
            <FaSignOutAlt className="text-[#A9CCFD]" />
            Log out
          </button>
        </div>
      )}
    </div>
  )
}

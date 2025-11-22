/* eslint-disable react/prop-types */
import { useState, useRef, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FaUsersCog,
  FaSignOutAlt,
  FaEye,
  FaEyeSlash,
  FaChevronUp,
  FaChevronDown,
  FaUserCircle
} from 'react-icons/fa'
import { useAuth } from '@renderer/store/auth'

export default function ProfileCorner({ active = false }) {
  const [open, setOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  const { user, logout } = useAuth()

  // safe user biar gak crash kalau null
  const safeUser = useMemo(
    () =>
      user || {
        fullname: 'User',
        email: '-',
        role: 'user',
        tag: '',
        password: null
      },
    [user]
  )

  const isAdmin = String(safeUser.role).toLowerCase() === 'admin'

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

  const handleLogout = async () => {
    setOpen(false)
    try {
      await logout()
    } finally {
      navigate('/login', { replace: true })
    }
  }

  const masked = '••••••••••••••••'
  const displayPassword = showPassword ? safeUser.password || masked : masked

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
        <FaUserCircle />
        {safeUser.fullname || safeUser.email || 'User'}
        {open ? <FaChevronUp /> : <FaChevronDown />}
      </button>

      {/* === Dropdown === */}
      {open && (
        <div
          className="absolute right-0 mt-3 w-64 mr-16 rounded-sm shadow-lg z-50 border border-[#2A3A51] font-[Noto Sans]"
          style={{ backgroundColor: '#0F1722' }}
        >
          {/* user info */}
          <div className="p-4 border-b border-[#2A3A51]">
            <div className="text-white font-semibold text-sm">
              {safeUser.fullname || safeUser.email}
            </div>
            <div className="text-gray-400 text-xs">{safeUser.email || '-'}</div>

            {/* show password (admin only) */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="flex items-center gap-2 text-gray-400 text-xs mt-3 hover:text-gray-200"
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
                <span className="tracking-[0.25em]">{displayPassword}</span>
              </button>
            )}
          </div>

          {/* user management (admin only) */}
          {isAdmin && (
            <Link
              to="/user-management"
              className="flex items-center gap-2 px-4 py-3 text-sm text-white border-b border-[#2A3A51] hover:bg-[#1A2638] transition"
              onClick={() => setOpen(false)}
            >
              <FaUsersCog className="text-[#A9CCFD]" />
              User management
            </Link>
          )}

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

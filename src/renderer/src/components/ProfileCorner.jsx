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
  FaUserCircle,
  FaInfoCircle
} from 'react-icons/fa'
import { useAuth } from '@renderer/store/auth'

// eslint-disable-next-line no-unused-vars
export default function ProfileCorner({ active = false }) {
  const [open, setOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  const { user, logout } = useAuth()

  // safe fallback user
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
    <div ref={dropdownRef} className="relative">
      {/* === Trigger Button === */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="text-sm flex items-center justify-center text-white font-[Aldrich] gap-2 2xl:mt-5 2xl:mr-5"
      >
        <FaUserCircle className="2xl:w-[50px] 2xl:h-[50px] w-[30px] h-[30px]" />
        {open ? <FaChevronUp /> : <FaChevronDown />}
      </button>

      {/* === Dropdown === */}
      {open && (
        <div
          className="absolute right-0 mt-3 w-64 rounded-sm 2xl:mr-5 shadow-lg z-50 border border-[#2A3A51] font-[Noto Sans]"
          style={{ backgroundColor: '#0F1722' }}
        >
          {/* User info */}
          <div className="p-4 border-b border-[#2A3A51]">
            <div className="text-white font-semibold text-sm">
              {safeUser.fullname || safeUser.email}
            </div>
            <div className="text-gray-400 text-xs">{safeUser.email || '-'}</div>

            {/* Show password (admin only) */}
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

          {/* User management */}
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
          <Link
            to="/about"
            className="flex items-center gap-2 px-4 py-3 text-sm text-white border-b border-[#2A3A51] hover:bg-[#1A2638] transition"
            onClick={() => setOpen(false)}
          >
            <FaInfoCircle className="text-[#A9CCFD]" />
            About
          </Link>

          {/* Logout */}
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

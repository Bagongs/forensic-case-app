/* eslint-disable react/prop-types */
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './store/auth'

export default function RequireAdmin({ children }) {
  const { authed, user } = useAuth()
  const location = useLocation()

  // kalau belum login, biarin RequireAuth yang handle, tapi ini fallback safety
  if (!authed) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const role = user?.role
  if (role !== 'admin') {
    // kalau bukan admin, lempar balik ke cases (atau halaman lain yang kamu mau)
    return <Navigate to="/cases" replace />
  }

  return children
}

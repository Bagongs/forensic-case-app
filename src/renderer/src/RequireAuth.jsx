/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@renderer/store/auth'

export default function RequireAuth({ children }) {
  const { authed, check } = useAuth()
  const [checking, setChecking] = useState(true)
  const location = useLocation()

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (authed) {
        mounted && setChecking(false)
        return
      }
      await check()
      mounted && setChecking(false)
    })()
    return () => {
      mounted = false
    }
  }, [authed, check])

  if (checking) {
    return (
      <div className="min-h-screen grid place-items-center" style={{ color: 'var(--text)' }}>
        Memeriksa sesi…
      </div>
    )
  }

  if (!authed) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

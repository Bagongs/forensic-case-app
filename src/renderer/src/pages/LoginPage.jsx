import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import iconApp from '@renderer/assets/icons/icon_app.svg'
import { useAuth } from '@renderer/store/auth'

function isValidEmail(value) {
  if (!value) return false
  // Regex simple untuk validasi UI (validasi kuat tetap di backend)
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(value)
}

export default function LoginPage() {
  const nav = useNavigate()
  const location = useLocation()
  const { login, busy: storeBusy, error: storeError } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // error global (misal login gagal dari backend)
  const [error, setError] = useState('')
  // error per field (untuk border merah + teks di bawah input)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const busy = storeBusy

  async function handleSubmit(e) {
    e.preventDefault()

    // reset error
    setError('')
    setEmailError('')
    setPasswordError('')

    let hasError = false

    // ===== VALIDASI EMAIL =====
    if (!email.trim()) {
      setEmailError('Email is required.')
      hasError = true
    } else if (!isValidEmail(email.trim())) {
      setEmailError('Please enter a valid email address.')
      hasError = true
    }

    // ===== VALIDASI PASSWORD =====
    if (!password.trim()) {
      setPasswordError('Password is required.')
      hasError = true
    }

    if (hasError) return

    // ===== CALL LOGIN STORE =====
    const { ok, error: errMsg } = await login({ email: email.trim(), password })
    if (!ok) {
      setError(errMsg || 'Login gagal. Periksa kembali email dan password Anda.')
      return
    }

    // default redirect ke /cases (sesuai app case-management)
    const to = location.state?.from?.pathname || '/cases'
    nav(to, { replace: true })
  }

  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center overflow-hidden px-4">
      {/* CARD UTAMA */}
      <div
        className="relative overflow-hidden"
        style={{
          width: 1120,
          height: 520,
          background: '#111720B2',
          border: '1px solid',
          borderImageSource: 'linear-gradient(115.65deg, #000000 32.14%, #666666 119.25%)',
          borderImageSlice: 1,
          display: 'grid',
          gridTemplateColumns: '560px 560px'
        }}
      >
        {/* BRAND PANEL */}
        <div
          className="h-full flex flex-col items-center justify-center gap-8"
          style={{ background: 'linear-gradient(180deg, #2A3A51 0%, #1A2432 100%)' }}
        >
          <img src={iconApp} alt="App Logo" className="w-44 h-44 object-contain select-none" />
          <h1
            className="text-4xl tracking-wider font-bold"
            style={{
              color: 'var(--dim-yellow)',
              fontFamily: 'Aldrich, sans-serif',
              letterSpacing: '.04em'
            }}
          >
            Case Analytics Platform
          </h1>
        </div>

        {/* FORM PANEL */}
        <div className="h-full flex flex-col items-center justify-center">
          <div className="w-[420px]">
            <h2 className="text-center text-xl font-semibold mb-8" style={{ color: 'var(--text)' }}>
              STAFF LOG IN
            </h2>

            {/* noValidate: matikan popup default browser */}
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              {/* EMAIL */}
              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--dim)' }}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => {
                    const val = e.target.value
                    setEmail(val)

                    // live-recheck kalau sebelumnya sudah ada error
                    if (emailError) {
                      if (!val.trim()) setEmailError('Email is required.')
                      else if (!isValidEmail(val.trim()))
                        setEmailError('Please enter a valid email address.')
                      else setEmailError('')
                    }
                  }}
                  className="w-full bg-transparent outline-none border-b pb-2 transition-colors"
                  style={{
                    borderColor: emailError ? '#ff6b6b' : '#394F6F',
                    color: 'var(--text)'
                  }}
                />
                {emailError && (
                  <p className="mt-1 text-xs" style={{ color: '#ff6b6b' }}>
                    {emailError}
                  </p>
                )}
              </div>

              {/* PASSWORD */}
              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--dim)' }}>
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => {
                    const val = e.target.value
                    setPassword(val)

                    if (passwordError) {
                      setPasswordError(val.trim() ? '' : 'Password is required.')
                    }
                  }}
                  className="w-full bg-transparent outline-none border-b pb-2 transition-colors"
                  style={{
                    borderColor: passwordError ? '#ff6b6b' : '#394F6F',
                    color: 'var(--text)'
                  }}
                />
                {passwordError && (
                  <p className="mt-1 text-xs" style={{ color: '#ff6b6b' }}>
                    {passwordError}
                  </p>
                )}
              </div>

              {/* ERROR GLOBAL (login gagal dari backend / store) */}
              {(error || storeError) && (
                <p className="text-sm text-center" style={{ color: '#ff6b6b' }}>
                  {error || storeError}
                </p>
              )}

              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="h-11 px-10 font-bold transition disabled:opacity-60"
                  style={{
                    background: '#1C2635',
                    color: 'var(--dim-yellow)',
                    borderStyle: 'solid',
                    borderColor: '#394F6F',
                    borderTopWidth: '1.5px',
                    borderBottomWidth: '1.5px',
                    borderLeftWidth: 0,
                    borderRightWidth: 0
                  }}
                >
                  <span className="tracking-wide" style={{ color: 'var(--gold)' }}>
                    {busy ? 'SIGNING IN…' : 'LOGIN'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../store/auth'

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' })
  const { login, loading, error } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()
  const from = loc.state?.from?.pathname || '/dashboard'

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const onSubmit = async (e) => {
    e.preventDefault()
    const ok = await login(form)
    if (ok) nav(from, { replace: true })
  }

  return (
    <div className="min-h-screen grid place-items-center">
      <form
        onSubmit={onSubmit}
        className="w-[360px] border border-[--border] bg-[--panel] rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,.35)]"
      >
        <div className="mb-6">
          <h1 className="text-xl font-semibold">Sign in</h1>
          <p className="text-sm" style={{ color: 'var(--dim)' }}>
            Digital Forensics & Analytics
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              name="username"
              autoComplete="username"
              required
              value={form.username}
              onChange={onChange}
              className="w-full rounded-lg bg-transparent border border-[--border] px-3 py-2 outline-none focus:ring-2 focus:ring-white/10"
            />
          </div>
          <div>
            <label className="block text-sm mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={onChange}
              className="w-full rounded-lg bg-transparent border border-[--border] px-3 py-2 outline-none focus:ring-2 focus:ring-white/10"
            />
          </div>
        </div>

        {error && (
          <div className="mt-3 text-sm" style={{ color: '#ef9a9a' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full border border-[--border] rounded-lg px-4 py-2 text-sm bg-transparent hover:bg-white/10 transition disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}

/* eslint-disable no-unused-vars */
import { create } from 'zustand'

export const useAuth = create((set, get) => ({
  user: null,
  authed: false,

  // state utama
  loading: false,
  busy: false,
  error: null,

  // helper kecil biar konsisten set loading/busy
  _setBusy(value) {
    set({ loading: value, busy: value })
  },

  async login({ email, password }) {
    // mulai proses
    set({ error: null })
    get()._setBusy(true)

    try {
      // 1) login dulu (set session + tokens di main)
      const sessionRes = await window.api.invoke('auth:login', { email, password })

      if (sessionRes?.error) {
        const msg = sessionRes?.message || 'Login gagal'
        set({ user: null, authed: false, error: msg })
        get()._setBusy(false)
        return { ok: false, error: msg }
      }

      // 2) ambil profile lengkap setelah login
      const profile = await window.api.invoke('auth:getProfile')

      if (profile?.error || !profile) {
        const msg = profile?.message || 'Gagal ambil profil user'
        set({ user: null, authed: false, error: msg })
        get()._setBusy(false)
        return { ok: false, error: msg }
      }

      set({
        user: profile,
        authed: true,
        error: null
      })
      get()._setBusy(false)

      return { ok: true }
    } catch (err) {
      const msg = err?.message || err?.response?.data?.message || 'Login gagal'
      set({ user: null, authed: false, error: msg })
      get()._setBusy(false)
      return { ok: false, error: msg }
    }
  },

  async logout() {
    // optional: bikin UI bisa disable tombol/menu saat logout
    set({ error: null })
    get()._setBusy(true)

    try {
      await window.api.invoke('auth:logout')
    } catch (err) {
      // kalau logout gagal pun, biasanya tetap kita reset state lokal
      // (biar tidak “nyangkut” sesi)
    } finally {
      set({ user: null, authed: false, error: null })
      get()._setBusy(false)
    }
  },

  async check() {
    set({ error: null })
    get()._setBusy(true)

    try {
      const session = await window.api.invoke('auth:getSession')

      if (session?.error || !session?.authed) {
        set({ user: null, authed: false })
        get()._setBusy(false)
        return { ok: false }
      }

      const profile = await window.api.invoke('auth:getProfile')

      if (profile?.error || !profile) {
        set({ user: null, authed: false })
        get()._setBusy(false)
        return { ok: false }
      }

      set({
        user: profile,
        authed: true,
        error: null
      })
      get()._setBusy(false)

      return { ok: true }
    } catch (err) {
      set({ user: null, authed: false })
      get()._setBusy(false)
      return { ok: false }
    }
  }
}))

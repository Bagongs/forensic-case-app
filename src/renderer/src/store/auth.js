/* eslint-disable no-unused-vars */
import { create } from 'zustand'

export const useAuth = create((set, get) => ({
  user: null,
  authed: false,
  loading: false,
  error: null,

  // Helper kecil supaya fleksibel sama bentuk response BE
  _unwrapProfile(res) {
    if (!res) return null
    // kalau bentuknya { status, message, data }
    if (typeof res === 'object' && res.data) return res.data
    return res
  },

  async login({ email, password }) {
    set({ loading: true, error: null })
    try {
      // 1) login dulu (buat set session + token di main)
      const result = await window.api.invoke('auth:login', { email, password })

      if (result?.error) {
        const msg = result.message || 'Login gagal'
        set({ loading: false, error: msg, authed: false, user: null })
        return { ok: false, error: msg }
      }

      // 2) ambil profile lengkap setelah login
      const profileRes = await window.api.invoke('auth:getProfile')

      if (profileRes?.error) {
        const msg = profileRes.message || 'Gagal ambil profil user'
        set({ loading: false, error: msg, authed: false, user: null })
        return { ok: false, error: msg }
      }

      const profile = get()._unwrapProfile(profileRes)

      set({
        user: profile,
        authed: true,
        loading: false,
        error: null
      })

      return { ok: true }
    } catch (err) {
      const msg = err?.message || err?.response?.data?.message || 'Login gagal'
      set({ loading: false, error: msg, authed: false, user: null })
      return { ok: false, error: msg }
    }
  },

  async logout() {
    try {
      await window.api.invoke('auth:logout')
    } finally {
      // bersihkan state renderer
      set({ user: null, authed: false, error: null, loading: false })
    }
  },

  async check() {
    set({ loading: true, error: null })
    try {
      // 1) cek session dulu
      const session = await window.api.invoke('auth:getSession')

      if (session?.error || !session?.authed) {
        set({ user: null, authed: false, loading: false })
        return { ok: false }
      }

      // 2) kalau ada session valid → tarik profil lengkap
      const profileRes = await window.api.invoke('auth:getProfile')

      if (profileRes?.error) {
        set({ user: null, authed: false, loading: false })
        return { ok: false }
      }

      const profile = get()._unwrapProfile(profileRes)

      set({
        user: profile,
        authed: true,
        loading: false
      })

      return { ok: true }
    } catch (err) {
      set({ user: null, authed: false, loading: false })
      return { ok: false }
    }
  }
}))

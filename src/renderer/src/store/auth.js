/* eslint-disable no-unused-vars */
import { create } from 'zustand'

export const useAuth = create((set, get) => ({
  user: null,
  authed: false,
  loading: false,
  error: null,

  async login({ email, password }) {
    set({ loading: true, error: null })
    try {
      // 1) login dulu (set session + tokens di main)
      const sessionRes = await window.api.invoke('auth:login', { email, password })

      if (sessionRes?.error) {
        const msg = sessionRes.message || 'Login gagal'
        set({ loading: false, error: msg, authed: false, user: null })
        return { ok: false, error: msg }
      }

      // 2) ambil profile lengkap setelah login
      const profile = await window.api.invoke('auth:getProfile')

      if (profile?.error || !profile) {
        const msg = profile?.message || 'Gagal ambil profil user'
        set({ loading: false, error: msg, authed: false, user: null })
        return { ok: false, error: msg }
      }

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
      set({ user: null, authed: false, error: null, loading: false })
    }
  },

  async check() {
    set({ loading: true, error: null })
    try {
      const session = await window.api.invoke('auth:getSession')

      if (session?.error || !session?.authed) {
        set({ user: null, authed: false, loading: false })
        return { ok: false }
      }

      const profile = await window.api.invoke('auth:getProfile')

      if (profile?.error || !profile) {
        set({ user: null, authed: false, loading: false })
        return { ok: false }
      }

      set({
        user: profile,
        authed: true,
        loading: false,
        error: null
      })

      return { ok: true }
    } catch (err) {
      set({ user: null, authed: false, loading: false })
      return { ok: false }
    }
  }
}))

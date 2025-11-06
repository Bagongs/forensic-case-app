/* eslint-disable no-empty */
// src/renderer/src/store/auth.js
import { create } from 'zustand'

const saved = (() => {
  try {
    return JSON.parse(localStorage.getItem('auth') || 'null')
  } catch {
    return null
  }
})()

export const useAuth = create((set) => ({
  token: saved?.token || null,
  user: saved?.user || null,
  loading: false,
  error: null,

  login: async (credentials) => {
    set({ loading: true, error: null })
    try {
      if (!window?.api?.auth?.login) throw new Error('IPC not available')
      const data = await window.api.auth.login(credentials) // handled by main.js
      set({ token: data.token, user: data.user, loading: false })
      localStorage.setItem('auth', JSON.stringify({ token: data.token, user: data.user }))
      return true
    } catch (e) {
      set({ loading: false, error: e.message || 'Login failed' })
      return false
    }
  },

  logout: async () => {
    try {
      await window.api.auth.logout()
    } catch {}
    set({ token: null, user: null })
    localStorage.removeItem('auth')
  }
}))

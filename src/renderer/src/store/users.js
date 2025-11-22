// src/renderer/src/store/users.js
import { create } from 'zustand'

/* =========================
   helpers
========================= */
const unwrap = (res) => {
  if (!res) return null
  if (typeof res === 'object' && 'data' in res) return res.data
  return res
}

const unwrapTotal = (res, fallback = 0) => {
  if (!res || typeof res !== 'object') return fallback
  return res.total ?? res.meta?.total ?? fallback
}

const mapApiUser = (u) => ({
  id: u.id ?? u.user_id,
  name: u.fullname ?? u.name ?? u.username ?? '',
  email: u.email ?? '',
  tag: u.tag ?? '-',
  role: u.role ?? 'user',
  password: u.password, // kalau BE memang return password (admin only)
  createdAt: u.created_at ?? u.created_date ?? u.createdAt
})

export const useUsers = create((set, get) => ({
  users: [],
  loading: false,
  error: null,

  pagination: {
    total: 0,
    skip: 0,
    limit: 10
  },

  lastQuery: {
    search: '',
    skip: 0,
    limit: 10
  },

  /* =========================
     LIST USERS
  ========================= */
  async fetchUsers(params = {}) {
    set({ loading: true, error: null })
    try {
      const res = await window.api.invoke('users:list', params)
      if (res?.error) throw new Error(res.message || 'Failed to fetch users')

      const list = unwrap(res) || []
      const mapped = list.map(mapApiUser)

      set({
        users: mapped,
        pagination: {
          total: unwrapTotal(res, mapped.length),
          skip: params.skip ?? 0,
          limit: params.limit ?? mapped.length
        },
        lastQuery: {
          search: params.search ?? '',
          skip: params.skip ?? 0,
          limit: params.limit ?? mapped.length
        },
        loading: false
      })

      return mapped
    } catch (err) {
      console.error(err)
      set({
        error: err?.message || 'Failed to fetch users',
        loading: false
      })
      throw err
    }
  },

  /* =========================
     CREATE USER
  ========================= */
  async createUserRemote(payload) {
    set({ loading: true, error: null })
    try {
      // mapping ke Contract API
      const apiPayload = {
        fullname: payload.fullname ?? payload.name ?? '',
        email: payload.email ?? '',
        password: payload.password ?? '',
        confirm_password:
          payload.confirm_password ?? payload.confirmPassword ?? payload.password ?? '',
        tag: payload.tag ?? ''
      }

      const res = await window.api.invoke('users:create', apiPayload)
      if (res?.error) throw new Error(res.message || 'Failed to create user')

      // refetch sesuai lastQuery supaya table langsung update
      const { lastQuery } = get()
      await get().fetchUsers(lastQuery)

      set({ loading: false })
      return unwrap(res)
    } catch (err) {
      console.error(err)
      set({
        error: err?.message || 'Failed to create user',
        loading: false
      })
      throw err
    }
  },

  /* =========================
     UPDATE USER
  ========================= */
  async updateUserRemote(userId, payload) {
    set({ loading: true, error: null })
    try {
      const apiPayload = {
        ...(payload.fullname !== undefined || payload.name !== undefined
          ? { fullname: payload.fullname ?? payload.name }
          : {}),
        ...(payload.email !== undefined ? { email: payload.email } : {}),
        ...(payload.tag !== undefined ? { tag: payload.tag } : {}),
        ...(payload.password ? { password: payload.password } : {}),
        ...(payload.confirm_password || payload.confirmPassword
          ? {
              confirm_password:
                payload.confirm_password ?? payload.confirmPassword ?? payload.password
            }
          : {})
      }

      const res = await window.api.invoke('users:update', {
        userId,
        payload: apiPayload
      })
      if (res?.error) throw new Error(res.message || 'Failed to update user')

      const { lastQuery } = get()
      await get().fetchUsers(lastQuery)

      set({ loading: false })
      return unwrap(res)
    } catch (err) {
      console.error(err)
      set({
        error: err?.message || 'Failed to update user',
        loading: false
      })
      throw err
    }
  },

  /* =========================
     DELETE USER
  ========================= */
  async deleteUserRemote(userId) {
    set({ loading: true, error: null })
    try {
      const res = await window.api.invoke('users:delete', userId)
      if (res?.error) throw new Error(res.message || 'Failed to delete user')

      const { lastQuery, pagination } = get()

      // jika page sekarang jadi kosong setelah delete, mundur 1 page
      const newTotal = Math.max(0, (pagination.total || 1) - 1)
      const maxPage = Math.max(1, Math.ceil(newTotal / (pagination.limit || 10)))
      const currentPage = Math.floor((lastQuery.skip || 0) / (lastQuery.limit || 10)) + 1
      const safePage = Math.min(currentPage, maxPage)

      const nextQuery = {
        ...lastQuery,
        skip: (safePage - 1) * (lastQuery.limit || 10)
      }

      await get().fetchUsers(nextQuery)

      set({ loading: false })
      return unwrap(res)
    } catch (err) {
      console.error(err)
      set({
        error: err?.message || 'Failed to delete user',
        loading: false
      })
      throw err
    }
  }
}))

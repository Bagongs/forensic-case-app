import { create } from 'zustand'

/* ===== util id sederhana ===== */
const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8)

/* ===== seed data ===== */
const SEED_USERS = []

const STORAGE_KEY = 'users_store_v1'

/* ===== helper persist ===== */
const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed?.users)) return null
    return parsed
  } catch {
    return null
  }
}

const saveToStorage = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ users: state.users }))
  } catch {
    /* noop */
  }
}

/* ===== Zustand store ===== */
export const useUsers = create((set, get) => {
  const hydrated = loadFromStorage()

  const initialState = {
    users: hydrated?.users ?? SEED_USERS
  }

  return {
    ...initialState,

    /* -------- CRUD -------- */
    addUser: ({ name, email, tag }) => {
      const s = get()

      // Cegah duplikat email
      const exists = s.users.some((u) => u.email.toLowerCase() === email.toLowerCase())
      if (exists) {
        alert('Email already exists!')
        return null
      }

      const newUser = {
        id: genId(),
        name: name?.trim() || 'Untitled',
        email: email?.trim() || '',
        tag: tag?.trim() || '-',
        createdAt: new Date().toISOString()
      }

      const next = {
        users: [newUser, ...s.users].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      }

      set(next)
      saveToStorage(next)
      return newUser.id
    },

    editUser: (id, patch) => {
      set((s) => {
        const users = s.users.map((u) => (u.id === id ? { ...u, ...patch } : u))
        const next = { users }
        saveToStorage(next)
        return next
      })
    },

    removeUser: (id) => {
      set((s) => {
        const users = s.users.filter((u) => u.id !== id)
        const next = { users }
        saveToStorage(next)
        return next
      })
    },

    /* -------- bulk ops -------- */
    importUsers: (arr = []) => {
      const normalized = arr.map((u) => ({
        id: u.id || genId(),
        name: u.name || 'Untitled',
        email: u.email || '',
        tag: u.tag || '-',
        createdAt: u.createdAt || new Date().toISOString()
      }))
      const next = { users: normalized }
      set(next)
      saveToStorage(next)
    },

    resetUsers: () => {
      const next = { users: SEED_USERS }
      set(next)
      saveToStorage(next)
    }
  }
})

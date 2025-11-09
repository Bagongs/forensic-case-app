/* eslint-disable no-unused-vars */
// src/renderer/src/store/users.js
import { create } from 'zustand'

/* ===== util id sederhana (tanpa dependency) ===== */
const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8)

/* ===== seed data (sesuai contoh screenshot) ===== */
const SEED_USERS = [
  {
    id: genId(),
    name: 'Agus Smith',
    email: 'smith18@tech.com',
    tag: 'Admin',
    createdAt: '2025-01-12T10:00:00Z'
  },
  {
    id: genId(),
    name: 'Jane Cooper',
    email: 'cooper77@tech.com',
    tag: 'Ahli Forensic',
    createdAt: '2025-01-12T10:05:00Z'
  },
  {
    id: genId(),
    name: 'Esther Howard',
    email: 'howard@tech.com',
    tag: 'Investigator',
    createdAt: '2025-01-12T10:10:00Z'
  },
  {
    id: genId(),
    name: 'Guy Hawkins',
    email: 'guyhawkins@tech.com',
    tag: 'Investigator',
    createdAt: '2025-01-12T10:15:00Z'
  },
  {
    id: genId(),
    name: 'Leslie Alexander',
    email: 'alexanderleslie@tech.com',
    tag: 'Ahli Forensic',
    createdAt: '2025-01-12T10:20:00Z'
  },
  {
    id: genId(),
    name: 'Robert Fox',
    email: 'foxrobert22@tech.com',
    tag: 'Investigator',
    createdAt: '2025-01-12T10:25:00Z'
  },
  {
    id: genId(),
    name: 'Jacob Jones',
    email: 'jacobjones@tech.com',
    tag: 'Investigator',
    createdAt: '2025-01-12T10:30:00Z'
  },
  {
    id: genId(),
    name: 'Robert Fox',
    email: 'foxrobert22@tech.com',
    tag: 'Investigator',
    createdAt: '2025-01-12T10:35:00Z'
  }
]

const STORAGE_KEY = 'users_store_v1'

/* ===== helper persist ===== */
function loadFromStorage() {
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
function saveToStorage(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ users: state.users }))
  } catch {
    /* noop */
  }
}

/* ===== Zustand store ===== */
export const useUsers = create((set, get) => {
  // hydrate initial
  const hydrated = loadFromStorage()

  const initialState = {
    users: hydrated?.users ?? SEED_USERS
  }

  return {
    ...initialState,

    /* -------- CRUD -------- */
    addUser: ({ name, email, tag }) => {
      const u = {
        id: genId(),
        name: name?.trim() || 'Untitled',
        email: email?.trim() || '',
        tag: tag || '-',
        createdAt: new Date().toISOString()
      }
      set((s) => {
        const next = { users: [u, ...s.users] }
        saveToStorage(next)
        return next
      })
      return u.id
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

    /* optional bulk ops */
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

import { create } from 'zustand'

const KEY = 'uploads'
const load = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}
const save = (list) => localStorage.setItem(KEY, JSON.stringify(list))

export const useUploads = create((set, get) => ({
  uploads: load(), // [{id,date,kind,fileName,notes,type,tools:[]}]
  addUpload: ({ kind, fileName, notes, type, tools }) => {
    const row = {
      id: crypto.randomUUID?.() ?? String(Date.now()),
      date: new Date().toISOString(),
      kind,
      fileName,
      notes,
      type,
      tools: tools?.length ? tools : []
    }
    const next = [row, ...get().uploads]
    save(next)
    set({ uploads: next })
    return row
  },
  removeUpload: (id) => {
    const next = get().uploads.filter((u) => u.id !== id)
    save(next)
    set({ uploads: next })
  }
}))

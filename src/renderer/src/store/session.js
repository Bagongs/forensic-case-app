import { create } from 'zustand'

const key = (method) => `session:${method}`

const load = (m) => {
  try {
    return JSON.parse(localStorage.getItem(key(m)) || 'null')
  } catch {
    return null
  }
}
const save = (m, data) => localStorage.setItem(key(m), JSON.stringify(data))

export const useSession = create((set, get) => ({
  method: null, // nama method aktif di memori (atau 'staging')
  devices: [], // [{id, owner, phone, sizeText, files:[...], file:{...}, uploadId?...}]
  uploading: null, // { percent, transferredText }

  // pilih snapshot berdasarkan method & muat dari localStorage
  setMethod: (m) => {
    const snap = load(m)
    set({ method: m, devices: snap?.devices || [], uploading: null })
  },

  // tambahkan device ke snapshot method tertentu (m)
  addDevice: (m, data) => {
    const d = {
      id: crypto.randomUUID?.() ?? String(Date.now()),
      sizeText: '67 gb',
      files: [],
      ...data
    }
    const devices = [...get().devices, d]
    set({ devices })
    save(m, { devices })
    return d.id
  },

  // opsional: tambahkan file kecil ke device tertentu
  addFileToDevice: (m, deviceId, file) => {
    const devices = get().devices.map((d) =>
      d.id === deviceId ? { ...d, files: [...d.files, file] } : d
    )
    set({ devices })
    save(m, { devices })
  },

  removeDevice: (id) => {
    const { method } = get()
    const devices = get().devices.filter((d) => d.id !== id)
    set({ devices })
    if (method) save(method, { devices })
  },

  hasUploadUsed: (uploadId) => get().devices.some((d) => d.uploadId === uploadId),

  setUploading: (val) => set({ uploading: val }),

  reset: (m) => {
    set({ devices: [], uploading: null })
    save(m, { devices: [] })
  },

  // 🚚 pindahkan snapshot saat ini (mis. 'staging') menjadi snapshot untuk method final
  finalizeToMethod: (newMethod) => {
    const { devices } = get()
    save(newMethod, { devices })
    set({ method: newMethod }) // tetap biarkan devices di memori
  }
}))

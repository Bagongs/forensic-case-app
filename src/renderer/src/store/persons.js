/* eslint-disable no-unused-vars */
// src/renderer/src/store/persons.js
import { create } from 'zustand'

/* ============================================================
   HELPERS
============================================================ */
const unwrap = (res) => {
  if (!res) return null
  if (res.error) throw new Error(res.message || 'IPC Error')
  if (typeof res === 'object' && 'data' in res) return res.data
  return res
}

export const usePersons = create((set, get) => ({
  loading: false,
  error: null,

  /* ============================================================
     CREATE PERSON (legacy POI)
     IPC: persons:create -> POST /persons/create-person
  ============================================================ */
  async createPersonRemote(payload, opts = {}) {
    set({ loading: true, error: null })
    try {
      const res = await window.api.invoke('persons:create', payload)
      const data = unwrap(res)

      // optional hooks
      if (opts?.afterCreate) {
        await opts.afterCreate(data, payload)
      }

      set({ loading: false })
      return data
    } catch (err) {
      set({ loading: false, error: err?.message || 'Failed to create person' })
      throw err
    }
  },

  /* ============================================================
     UPDATE PERSON
     IPC: persons:update -> PUT /persons/update-person/{id}
  ============================================================ */
  async updatePersonRemote(personId, payload, opts = {}) {
    set({ loading: true, error: null })
    try {
      const res = await window.api.invoke('persons:update', { personId, payload })
      const data = unwrap(res)

      if (opts?.afterUpdate) {
        await opts.afterUpdate(data, payload)
      }

      set({ loading: false })
      return data
    } catch (err) {
      set({ loading: false, error: err?.message || 'Failed to update person' })
      throw err
    }
  },

  /* ============================================================
     DELETE PERSON
     IPC: persons:delete -> DELETE /persons/delete-person/{id}
  ============================================================ */
  async deletePersonRemote(personId, opts = {}) {
    set({ loading: true, error: null })
    try {
      const res = await window.api.invoke('persons:delete', personId)
      const data = unwrap(res)

      if (opts?.afterDelete) {
        await opts.afterDelete(data, personId)
      }

      set({ loading: false })
      return data
    } catch (err) {
      set({ loading: false, error: err?.message || 'Failed to delete person' })
      throw err
    }
  },

  /* ============================================================
     NOTES
     IPC: persons:saveNotes / persons:editNotes
  ============================================================ */
  async saveNotesRemote(payload, opts = {}) {
    set({ loading: true, error: null })
    try {
      const res = await window.api.invoke('persons:saveNotes', payload)
      const data = unwrap(res)

      if (opts?.afterNotes) {
        await opts.afterNotes(data, payload)
      }

      set({ loading: false })
      return data
    } catch (err) {
      set({ loading: false, error: err?.message || 'Failed to save notes' })
      throw err
    }
  },

  async editNotesRemote(payload, opts = {}) {
    set({ loading: true, error: null })
    try {
      const res = await window.api.invoke('persons:editNotes', payload)
      const data = unwrap(res)

      if (opts?.afterNotes) {
        await opts.afterNotes(data, payload)
      }

      set({ loading: false })
      return data
    } catch (err) {
      set({ loading: false, error: err?.message || 'Failed to edit notes' })
      throw err
    }
  }
}))

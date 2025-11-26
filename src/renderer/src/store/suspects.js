// src/renderer/src/store/suspects.js
import { create } from 'zustand'

/* ============================================================
   UTILS
============================================================ */

const unwrap = (res) => {
  if (!res) return null
  if (res.error) throw new Error(res.message || 'IPC Error')
  if (typeof res === 'object' && 'data' in res) return res.data
  return res
}

const unwrapTotal = (res, fallback = 0) => {
  if (!res || typeof res !== 'object') return fallback
  return res.total ?? res.meta?.total ?? fallback
}

/* ============================================================
   MAPPING: Suspect List Item (untuk SuspectListPage)
============================================================ */
const mapApiSuspectListItem = (api) => ({
  id: api.id,
  caseId: api.case_id,
  name: api.person_name || 'Unknown',
  status: api.status || api.suspect_status,
  caseName: api.case_name || '-',
  investigator: api.investigator || '-',
  agency: api.agency || '-',
  createdAt: api.created_at || null,
  updatedAt: api.updated_at || null
})

/* ============================================================
   MAPPING: Suspect Detail
============================================================ */
const mapApiSuspectDetail = (resDetail) => {
  const d = resDetail?.data || resDetail

  const evidenceGroups = d?.evidence || []
  const evidences = evidenceGroups.flatMap((g) => g.list_evidence || [])

  return {
    id: d.id,
    name: d.person_name || 'Unknown',
    status: d.suspect_status || d.status,
    investigator: d.investigator || '-',
    caseName: d.case_name || '-',
    caseId: d.case_id || '-',
    createdAtCase: d.created_at_case || null,
    suspectNotes: d.suspect_notes || null,
    evidences: evidences.map((ev) => ({
      id: ev.id,
      evidenceNumber: ev.evidence_number || '-',
      summary: ev.evidence_summary || '',
      filePath: ev.file_path || '',
      fileName: ev.file_path ? ev.file_path.split('/').pop() : ev.evidence_number,
      createdAt: ev.created_at,
      updatedAt: ev.updated_at
    }))
  }
}

/* ============================================================
   STORE
============================================================ */

export const useSuspects = create((set, get) => ({
  suspects: [],
  summary: null,
  suspectDetail: null,

  loading: false,
  error: null,

  pagination: {
    total: 0,
    skip: 0,
    limit: 10
  },

  /* ============================================================
     LIST
  ============================================================ */
  async fetchSuspects(params = {}) {
    set({ loading: true, error: null })
    try {
      const res = await window.api.invoke('suspects:list', params)
      const list = unwrap(res) || []
      const mapped = list.map(mapApiSuspectListItem)

      set({
        suspects: mapped,
        pagination: {
          total: unwrapTotal(res, mapped.length),
          skip: params.skip ?? 0,
          limit: params.limit ?? mapped.length
        },
        loading: false
      })

      return mapped
    } catch (err) {
      console.error(err)
      set({
        loading: false,
        error: err?.message || 'Failed to fetch suspects'
      })
      throw err
    }
  },

  /* ============================================================
     SUMMARY
  ============================================================ */
  async fetchSuspectSummary() {
    set({ loading: true, error: null })
    try {
      const res = await window.api.invoke('suspects:summary')
      const sum = unwrap(res)

      set({ summary: sum, loading: false })
      return sum
    } catch (err) {
      console.error(err)
      set({
        loading: false,
        error: err?.message || 'Failed to fetch suspect summary'
      })
      throw err
    }
  },

  /* ============================================================
     DETAIL
  ============================================================ */
  async fetchSuspectDetail(id) {
    set({ loading: true, error: null })
    try {
      const res = await window.api.invoke('suspects:detail', id)
      const detailData = unwrap(res)
      const mapped = mapApiSuspectDetail({ data: detailData })

      set({ suspectDetail: mapped, loading: false })
      return mapped
    } catch (err) {
      console.error(err)
      set({
        loading: false,
        error: err?.message || 'Failed to fetch suspect detail'
      })
      throw err
    }
  },

  /* ============================================================
     CREATE
  ============================================================ */
  async createSuspectRemote(payload) {
    set({ loading: true, error: null })
    try {
      const res = await window.api.invoke('suspects:create', payload)
      const created = unwrap(res)

      set({ loading: false })
      return created
    } catch (err) {
      console.error(err)
      set({
        loading: false,
        error: err?.message || 'Failed to create suspect'
      })
      throw err
    }
  },

  /* ============================================================
     UPDATE
  ============================================================ */
  async updateSuspectRemote(id, payload) {
    set({ loading: true, error: null })
    try {
      const res = await window.api.invoke('suspects:update', { id, payload })
      const updated = unwrap(res)

      set({ loading: false })
      return updated
    } catch (err) {
      console.error(err)
      set({
        loading: false,
        error: err?.message || 'Failed to update suspect'
      })
      throw err
    }
  },

  /* ============================================================
     NOTES (contract baru via IPC yang sudah diarahkan ke /persons/...)
  ============================================================ */
  async saveSuspectNotesRemote(payload) {
    set({ loading: true, error: null })
    try {
      const res = await window.api.invoke('suspects:saveNotes', payload)
      const out = unwrap(res)

      // refresh detail kalau lagi kebuka
      const currentDetail = get().suspectDetail
      if (currentDetail?.id === payload?.suspect_id) {
        await get().fetchSuspectDetail(payload.suspect_id)
      }

      set({ loading: false })
      return out
    } catch (err) {
      set({ loading: false, error: err?.message || 'Failed to save notes' })
      throw err
    }
  },

  async editSuspectNotesRemote(payload) {
    set({ loading: true, error: null })
    try {
      const res = await window.api.invoke('suspects:editNotes', payload)
      const out = unwrap(res)

      // refresh detail kalau lagi kebuka
      const currentDetail = get().suspectDetail
      if (currentDetail?.id === payload?.suspect_id) {
        await get().fetchSuspectDetail(payload.suspect_id)
      }

      set({ loading: false })
      return out
    } catch (err) {
      set({ loading: false, error: err?.message || 'Failed to edit notes' })
      throw err
    }
  },

  // ✅ alias nama yang dipakai di SuspectDetailPage kamu sekarang
  saveNotesRemote(payload) {
    return get().saveSuspectNotesRemote(payload)
  },
  editNotesRemote(payload) {
    return get().editSuspectNotesRemote(payload)
  },

  /* ============================================================
     EXPORT PDF (contract baru)
     IPC: 'suspects:exportPdf'
     return: { ok:true, buffer:ArrayBuffer, filename?:string }
  ============================================================ */
  async exportSuspectPdfRemote(suspectId) {
    set({ loading: true, error: null })
    try {
      const res = await window.api.invoke('suspects:exportPdf', suspectId)
      if (res?.error) throw new Error(res.message || 'Failed to export PDF')
      set({ loading: false })
      return res
    } catch (err) {
      set({ loading: false, error: err?.message || 'Failed to export PDF' })
      throw err
    }
  },

  /* ============================================================
     DELETE
  ============================================================ */
  async deleteSuspectRemote(id) {
    set({ loading: true, error: null })
    try {
      const res = await window.api.invoke('suspects:delete', id)
      set({ loading: false })
      return unwrap(res)
    } catch (err) {
      set({ loading: false, error: err?.message || 'Failed to delete suspect' })
      throw err
    }
  }
}))

// src/renderer/src/store/evidences.js
import { create } from 'zustand'

/* ============================================================
   UTILS
============================================================ */
const unwrap = (res) => {
  if (!res) return null
  if (typeof res === 'object' && 'data' in res) return res.data
  return res
}

const unwrapTotal = (res, fallback = 0) => {
  if (!res || typeof res !== 'object') return fallback
  return res.total ?? res.meta?.total ?? res.pagination?.total ?? fallback
}

const extractList = (raw) => {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  if (Array.isArray(raw.items)) return raw.items
  if (Array.isArray(raw.data)) return raw.data
  if (Array.isArray(raw.list)) return raw.list
  return []
}

/* ============================================================
   MAPPING: Evidence List Item
============================================================ */
const mapApiEvidenceListItem = (api) => {
  const evidenceNumber = api.evidence_number ?? api.evidenceNumber ?? ''
  const isGenerated = typeof evidenceNumber === 'string' && evidenceNumber.startsWith('EVID-')

  return {
    id: api.id ?? api.evidence_id,
    caseId: api.case_id ?? api.caseId,
    evidenceNumber,
    caseName: api.title ?? api.case_title ?? api.caseName ?? '-', // from title
    investigator: api.investigator ?? api.main_investigator ?? '-',
    agency: api.agency ?? api.agency_name ?? '-',
    createdAt: api.created_at ?? api.created_date ?? api.date_created ?? null,
    source: isGenerated ? 'generated' : 'manual'
  }
}

/* ============================================================
   STORE
============================================================ */
export const useEvidences = create((set, get) => ({
  evidences: [],
  summary: null,
  loading: false,
  error: null,
  detail: null,

  pagination: { total: 0, skip: 0, limit: 10 },

  async fetchEvidenceSummary() {
    try {
      const res = await window.api.invoke('evidence:summary')
      set({ summary: unwrap(res) })
    } catch {
      set({ summary: null })
    }
  },

  /* ============================================================
     FINAL UPDATE (Contract Compliant)
  ============================================================ */
  updateEvidence: async (evidenceId, raw = {}) => {
    set({ loading: true, error: null })
    try {
      const payload = raw.payload || raw || {}
      const finalPayload = {}

      const putIfValid = (k, v) => {
        if (v === undefined || v === null) return
        if (typeof v === 'string' && v.trim() === '') return
        finalPayload[k] = v
      }

      // ====== FIELD LAIN (bebas) ======
      putIfValid('case_id', payload.case_id)
      putIfValid('evidence_number', payload.evidence_number)
      putIfValid('type', payload.type)
      putIfValid('source', payload.source)
      putIfValid('evidence_summary', payload.evidence_summary)
      putIfValid('investigator', payload.investigator)

      // ====== POI / SUSPECT LOGIC SESUAI KONTRAK ======
      if (payload.is_unknown_person === true) {
        // CASE: Unknown Person
        // - kirim hanya is_unknown_person = true
        // - JANGAN kirim suspect_id, person_name, suspect_status
        finalPayload.is_unknown_person = true
      } else if (payload.is_unknown_person === false) {
        // CASE: Known Person
        // - wajib kirim suspect_id (supaya BE update suspect yg sama)
        // - boleh kirim person_name & suspect_status
        finalPayload.is_unknown_person = false
        putIfValid('suspect_id', payload.suspect_id)
        putIfValid('person_name', payload.person_name)
        putIfValid('suspect_status', payload.suspect_status)
      } else {
        // CASE: tidak set is_unknown_person
        // - ikuti prioritas kontrak: suspect_id > person_name > suspect_status
        putIfValid('suspect_id', payload.suspect_id)
        putIfValid('person_name', payload.person_name)
        putIfValid('suspect_status', payload.suspect_status)
      }

      // ====== FILE (optional) ======
      if (payload.evidence_file) {
        const f = payload.evidence_file
        if (typeof File !== 'undefined' && f instanceof File) {
          const buf = await f.arrayBuffer()
          finalPayload.evidence_file = {
            name: f.name,
            type: f.type,
            size: f.size,
            buffer: Array.from(new Uint8Array(buf))
          }
        } else if (f?.buffer) {
          // sudah dalam bentuk { name, type, buffer, ... }
          finalPayload.evidence_file = f
        }
      }

      const res = await window.api.invoke('evidence:update', {
        evidenceId,
        payload: finalPayload
      })

      if (res?.error) {
        throw new Error(res.detail || res.message || 'Failed to update evidence')
      }

      // refresh detail supaya UI kebaru
      await get().fetchEvidenceDetail(evidenceId)

      set({ loading: false })
      return res
    } catch (err) {
      console.error('[updateEvidence ERROR]', err)
      set({ loading: false, error: err?.message || 'Failed to update evidence' })
      throw err
    }
  },

  async fetchEvidences(params = {}) {
    set({ loading: true, error: null })
    try {
      const res = await window.api.invoke('evidence:list', params)
      const raw = res
      const data = unwrap(res)
      const list = extractList(data)
      const mapped = list.map(mapApiEvidenceListItem)

      set({
        evidences: mapped,
        pagination: {
          total: unwrapTotal(raw, mapped.length),
          skip: params.skip ?? 0,
          limit: params.limit ?? mapped.length
        },
        loading: false
      })

      return mapped
    } catch (err) {
      set({ loading: false, error: err?.message || 'Failed to fetch evidences' })
      throw err
    }
  },

  async fetchEvidenceDetail(evidenceId) {
    set({ loading: true, error: null })
    try {
      const res = await window.api.invoke('evidence:detail', evidenceId)
      const detail = unwrap(res)
      set({ detail, loading: false })
      return detail
    } catch (err) {
      set({ loading: false, error: err?.message || 'Failed to fetch evidence detail' })
      throw err
    }
  }
}))

/* eslint-disable no-unused-vars */
// src/renderer/src/store/evidences.js
import { create } from 'zustand'

/* =======================
   UTILS
======================= */
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

/* =======================
   MAPPING: Evidence List Item
   Sesuaikan field jika response list kamu beda nama.
======================= */
const mapApiEvidenceListItem = (api) => ({
  id: api.id ?? api.evidence_id ?? api.evidence_number,
  evidenceNumber: api.evidence_number ?? api.evidenceNumber ?? api.id,
  caseId: api.case_id ?? api.caseId,
  caseName: api.case_name ?? api.caseName ?? '-',
  agency: api.agency ?? api.agency_name ?? '-',
  investigator: api.investigator ?? api.case_officer ?? '-',
  source: api.source ?? api.evidence_source ?? 'generated',
  createdAt: api.created_at ?? api.createdAt ?? null
})

/* =======================
   STORE
======================= */
export const useEvidences = create((set, get) => ({
  evidences: [],
  summary: null,
  loading: false,
  error: null,

  pagination: {
    total: 0,
    skip: 0,
    limit: 10
  },

  /* =======================
     LIST
     IPC: 'evidence:list'
  ======================= */
  async fetchEvidences(params = {}) {
    set({ loading: true, error: null })
    try {
      const res = await window.api.invoke('evidence:list', params)
      const list = unwrap(res) || []
      const mapped = list.map(mapApiEvidenceListItem)

      set({
        evidences: mapped,
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
      set({ loading: false, error: err?.message || 'Failed to fetch evidences' })
      throw err
    }
  },

  /* =======================
     SUMMARY (optional)
     IPC: 'evidence:summary'
  ======================= */
  async fetchEvidenceSummary() {
    set({ loading: true, error: null })
    try {
      const res = await window.api.invoke('evidence:summary')
      const sum = unwrap(res)
      set({ summary: sum, loading: false })
      return sum
    } catch (err) {
      console.warn('fetchEvidenceSummary skipped:', err?.message)
      set({ loading: false })
      return null
    }
  }
}))

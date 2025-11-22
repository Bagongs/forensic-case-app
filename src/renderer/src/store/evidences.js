/* eslint-disable no-unused-vars */
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
   Response contoh:
   {
     id, case_id, evidence_number, title,
     investigator, agency, created_at
   }
============================================================ */
const mapApiEvidenceListItem = (api) => {
  const evidenceNumber = api.evidence_number ?? api.evidenceNumber ?? ''
  const isGenerated = typeof evidenceNumber === 'string' && evidenceNumber.startsWith('EVID-')

  return {
    id: api.id ?? api.evidence_id,
    caseId: api.case_id ?? api.caseId,
    evidenceNumber,

    // ✅ FIX UTAMA: caseName dari title (sesuai contract)
    caseName: api.title ?? api.case_title ?? api.caseName ?? '-',

    investigator: api.investigator ?? api.main_investigator ?? '-',
    agency: api.agency ?? api.agency_name ?? '-',
    createdAt: api.created_at ?? api.created_date ?? api.date_created ?? null,

    // buat indikator warna di tabel
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

  pagination: {
    total: 0,
    skip: 0,
    limit: 10
  },

  /* ============================================================
     EVIDENCE SUMMARY (optional)
     kalau endpoint summary belum ada, tetap aman.
  ============================================================ */
  async fetchEvidenceSummary() {
    try {
      const res = await window.api.invoke('evidence:summary')
      set({ summary: unwrap(res) })
    } catch (err) {
      // silent fail (biar page tetap jalan)
      set({ summary: null })
    }
  },

  /* ============================================================
     EVIDENCE LIST
     GET /evidence/get-evidence-list
     params: { skip, limit, search }
  ============================================================ */
  async fetchEvidences(params = {}) {
    set({ loading: true, error: null })
    try {
      const res = await window.api.invoke('evidence:list', params)

      const raw = res // simpan buat total
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
  }
}))

// src/renderer/src/store/cases.js
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
  return res.total ?? res.meta?.total ?? fallback
}

/* Normalisasi status dari API */
const normalizeStatus = (s) => {
  if (!s) return 'Open'
  const v = String(s).toLowerCase()

  if (v.includes('reopen') || v.includes('re-open')) return 'Re-Open'
  if (v.includes('close')) return 'Closed'
  if (v.includes('open')) return 'Open'

  return 'Open'
}

/* ============================================================
   MAPPING: Case List Item
============================================================ */
const mapApiCaseListItem = (api) => ({
  id: api.id ?? api.case_id,
  caseNumber: api.case_number ?? '',
  name: api.title ?? api.case_name ?? api.name ?? '',
  description: api.description || '',
  status: normalizeStatus(api.status || api.case_status || 'Open'),

  agency: api.agency_name ?? api.agency ?? '',
  workUnit: api.work_unit_name ?? api.work_unit ?? '',
  investigator: api.main_investigator ?? api.case_officer ?? api.investigator ?? '',

  createdAt: api.created_at ?? api.created_date ?? new Date().toISOString(),
  updatedAt: api.updated_at ?? api.updated_date ?? null,

  persons: [],
  notes: '',
  logs: []
})

/* ============================================================
   MAPPING: Case Detail
============================================================ */
const mapApiCaseDetail = (detail, existing) => {
  const apiCase = detail.case || detail
  const persons = detail.persons_of_interest || detail.persons || []
  const caseNotes = detail.case_notes || detail.notes || ''

  const base = existing || mapApiCaseListItem(apiCase)

  const mappedPersons = persons.map((p) => ({
    id: p.suspect_id ?? p.id,
    name: p.name || p.person_name || 'Unknown',
    status: p.person_type || p.suspect_status || 'Person of Interest',
    notes: p.notes || '',
    evidences: (p.evidence || p.evidences || []).map((ev) => ({
      id: ev.id,
      evidenceNumber: ev.evidence_number ?? '',
      summary: ev.evidence_summary || ev.summary || '',
      fileName: ev.file_path ? ev.file_path.split('/').pop() : ev.file_name,
      previewUrl: ev.preview_image || ev.preview_url || null,
      source: ev.source || ev.evidence_source || '-',
      createdAt: ev.created_at || ev.created_date
    }))
  }))

  return {
    ...base,
    caseNumber: apiCase.case_number ?? base.caseNumber,
    name: apiCase.title ?? apiCase.case_name ?? base.name,
    description: apiCase.description ?? base.description,
    status: normalizeStatus(apiCase.status ?? apiCase.case_status ?? base.status),
    agency: apiCase.agency_name ?? apiCase.agency ?? base.agency,
    workUnit: apiCase.work_unit_name ?? apiCase.work_unit ?? base.workUnit,
    investigator:
      apiCase.main_investigator ??
      apiCase.case_officer ??
      apiCase.investigator ??
      base.investigator,
    createdAt: apiCase.created_at ?? apiCase.created_date ?? base.createdAt,

    persons: mappedPersons,
    notes: caseNotes
  }
}

/* ============================================================
   PAYLOAD NORMALIZER FOR CREATE / UPDATE
============================================================ */
const normalizeCasePayload = (input, { forUpdate = false } = {}) => {
  const out = {
    title: input.title ?? input.name,
    description: input.description ?? input.desc,

    main_investigator:
      input.main_investigator ??
      input.investigator ??
      input.case_officer ??
      input.investigator_name,

    agency_name: input.agency_name ?? input.agency ?? input.agencyName,

    work_unit_name: input.work_unit_name ?? input.work_unit ?? input.workUnit,

    case_number: input.case_number ?? input.id ?? null
  }

  Object.keys(out).forEach((k) => {
    if (out[k] === undefined || out[k] === null || out[k] === '' || (forUpdate && !(k in input))) {
      delete out[k]
    }
  })

  return out
}

/* ============================================================
   STORE
============================================================ */

export const useCases = create((set, get) => ({
  cases: [],
  summary: null,
  loading: false,
  error: null,

  pagination: {
    total: 0,
    skip: 0,
    limit: 10
  },

  caseLogs: {},

  /* ============================================================
     SUMMARY
  ============================================================ */
  async fetchSummary() {
    set({ loading: true, error: null })
    try {
      const res = await window.api.invoke('cases:summary')
      const raw = res

      set({
        summary: {
          ...unwrap(res),
          total_cases: raw.total_cases
        },
        loading: false
      })
    } catch (err) {
      set({ error: err?.message || 'Failed to fetch summary', loading: false })
    }
  },

  /* ============================================================
     CASE LIST
  ============================================================ */
  async fetchCases(params = {}) {
    set({ loading: true, error: null })
    try {
      const res = await window.api.invoke('cases:list', params)
      const list = unwrap(res) || []

      const mapped = list.map(mapApiCaseListItem)

      set({
        cases: mapped,
        pagination: {
          total: unwrapTotal(res, mapped.length),
          skip: params.skip ?? 0,
          limit: params.limit ?? mapped.length
        },
        loading: false
      })
    } catch (err) {
      console.error(err)
      set({ error: err?.message || 'Failed to fetch cases', loading: false })
    }
  },

  /* ============================================================
     CASE DETAIL
  ============================================================ */
  async fetchCaseDetail(caseId) {
    set({ loading: true, error: null })
    try {
      const res = await window.api.invoke('cases:detail', caseId)
      const detail = unwrap(res)

      const current = get().cases
      const existing = current.find((c) => c.id === (detail.case?.id ?? detail.id))

      const mapped = mapApiCaseDetail(detail, existing)

      const nextCases = existing
        ? current.map((c) => (c.id === mapped.id ? mapped : c))
        : [mapped, ...current]

      set({ cases: nextCases, loading: false })
      return mapped
    } catch (err) {
      console.error(err)
      set({ error: err?.message || 'Failed to fetch case detail', loading: false })
      throw err
    }
  },

  /* ============================================================
     CREATE CASE — Contract API Compliant
  ============================================================ */
  async createCaseRemote(payload) {
    set({ loading: true, error: null })
    try {
      const apiPayload = normalizeCasePayload(payload)

      console.log('[CreateCase → Final API Payload]:', apiPayload)

      const res = await window.api.invoke('cases:create', apiPayload)
      const apiCase = unwrap(res)
      const mapped = mapApiCaseListItem(apiCase)

      set({ cases: [mapped, ...get().cases], loading: false })
      return mapped
    } catch (err) {
      console.error('[CreateCase ERROR]', err)
      set({ error: err?.message || 'Failed to create case', loading: false })
      throw err
    }
  },

  /* ============================================================
     UPDATE CASE — Contract API Compliant
  ============================================================ */
  async updateCaseRemote(caseId, patch) {
    set({ loading: true, error: null })
    try {
      const apiPatch = normalizeCasePayload(patch, { forUpdate: true })

      console.log('[UpdateCase → Final API Payload]:', apiPatch)

      const res = await window.api.invoke('cases:update', {
        caseId,
        payload: apiPatch
      })

      const updated = unwrap(res)
      const current = get().cases
      const existing = current.find((c) => c.id === updated.id)

      const merged = mapApiCaseListItem(updated)

      const nextCases = existing
        ? current.map((c) => (c.id === merged.id ? merged : c))
        : [...current, merged]

      set({ cases: nextCases, loading: false })
      return merged
    } catch (err) {
      console.error('[UpdateCase ERROR]', err)
      set({ error: err?.message || 'Failed to update case', loading: false })
      throw err
    }
  },

  /* ============================================================
     CASE NOTES
  ============================================================ */
  async saveCaseNotesRemote(caseId, text) {
    set({ loading: true, error: null })
    try {
      await window.api.invoke('cases:saveNotes', { case_id: caseId, notes: text })

      set({
        cases: get().cases.map((c) => (c.id === caseId ? { ...c, notes: text } : c)),
        loading: false
      })
    } catch (err) {
      set({ error: err?.message || 'Failed to save notes', loading: false })
      throw err
    }
  },

  async editCaseNotesRemote(caseId, text) {
    set({ loading: true, error: null })
    try {
      await window.api.invoke('cases:editNotes', { case_id: caseId, notes: text })

      set({
        cases: get().cases.map((c) => (c.id === caseId ? { ...c, notes: text } : c)),
        loading: false
      })
    } catch (err) {
      set({ error: err?.message || 'Failed to edit notes', loading: false })
      throw err
    }
  },

  /* ============================================================
     CASE LOGS
  ============================================================ */
  async fetchCaseLogs(caseId, params = {}) {
    try {
      const res = await window.api.invoke('caseLogs:list', { caseId, params })
      const apiLogs = unwrap(res) || []

      const viewLogs = apiLogs.map((log) => ({
        id: log.id,
        status: log.action || log.status,
        by: log.performed_by || log.by || '',
        date: log.created_at || log.date,
        change: log.change_detail || log.change || undefined,
        hasNotes: !!log.notes,
        notes: log.notes
      }))

      set((state) => ({
        caseLogs: {
          ...(state.caseLogs || {}),
          [caseId]: viewLogs
        }
      }))

      return viewLogs
    } catch (err) {
      console.error('fetchCaseLogs error:', err)
      throw err
    }
  },

  async fetchCaseLogDetail(logId) {
    try {
      const res = await window.api.invoke('caseLogs:detail', logId)
      return unwrap(res)
    } catch (err) {
      console.error('fetchCaseLogDetail error:', err)
      throw err
    }
  },

  /* ============================================================
     Delete Person
  ============================================================ */
  async deletePersonRemote(caseId, personId) {
    set({ loading: true, error: null })
    try {
      await window.api.invoke('persons:delete', Number(personId))
      await get().fetchCaseDetail(Number(caseId))
      set({ loading: false })
    } catch (err) {
      set({ loading: false, error: err?.message || 'Failed to delete person' })
      throw err
    }
  },

  /* ============================================================
     Evidence Add To Person
  ============================================================ */
  async addEvidenceToPersonRemote(caseId, payload) {
    set({ loading: true, error: null })
    try {
      await window.api.invoke('evidence:create', payload)
      await get().fetchCaseDetail(Number(caseId))
      set({ loading: false })
    } catch (err) {
      set({ loading: false, error: err?.message || 'Failed to add evidence' })
      throw err
    }
  },

  /* ============================================================
     HELPER
  ============================================================ */
  getCaseById: (id) => (get().cases || []).find((c) => c.id === id)
}))

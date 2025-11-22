/* eslint-disable no-unused-vars */
// src/renderer/src/store/cases.js
import { create } from 'zustand'

/* ============================================================
   UTILS
============================================================ */
const fmtLocalDate = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('id-ID')
}

// unwrap response dari IPC/service (biar fleksibel)
const unwrap = (res) => {
  if (!res) return null
  if (typeof res === 'object' && 'data' in res) return res.data
  return res
}

const unwrapTotal = (res, fallback = 0) => {
  if (!res || typeof res !== 'object') return fallback
  return res.total ?? res.meta?.total ?? fallback
}

/* ============================================================
   MAPPING: Case List Item
============================================================ */
const mapApiCaseListItem = (api) => ({
  id: api.id ?? api.case_id,
  name: api.title ?? api.case_name ?? api.name ?? '',
  description: api.description || '',
  status: api.status || api.case_status || 'Open',
  agency: api.agency || api.agency_name || '',
  workUnit: api.work_unit || api.work_unit_name || '',
  investigator: api.case_officer || api.main_investigator || api.investigator || '',
  createdAt: api.created_date || api.created_at || api.date_created || new Date().toISOString(),

  persons: [],
  notes: '',
  logs: []
})

/* ============================================================
   MAPPING: Case Detail
============================================================ */
const mapApiCaseDetailToLocal = (detail, existing) => {
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
      summary: ev.evidence_summary || ev.summary || '',
      fileName: ev.file_path ? ev.file_path.split('/').pop() : ev.file_name,
      previewUrl: ev.preview_image || ev.preview_url || null,
      source: ev.source || ev.evidence_source || '-',
      createdAt: ev.created_at || ev.created_date
    }))
  }))

  return {
    ...base,
    name: apiCase.title ?? apiCase.case_name ?? base.name,
    description: apiCase.description || base.description,
    status: apiCase.status || apiCase.case_status || base.status,
    agency: apiCase.agency || apiCase.agency_name || base.agency,
    workUnit: apiCase.work_unit || apiCase.work_unit_name || base.workUnit,
    investigator: apiCase.case_officer || apiCase.main_investigator || base.investigator,
    createdAt: apiCase.created_date || apiCase.created_at || base.createdAt,

    persons: mappedPersons,
    notes: caseNotes
  }
}

/* ============================================================
   MAPPING: Logs
============================================================ */
const mapApiLogsToView = (apiLogs = []) =>
  apiLogs.map((log) => ({
    id: log.id,
    status: log.action || log.status,
    by: log.performed_by || log.by || '',
    date: log.created_at || log.date,
    change: log.change_detail || log.change || undefined,
    hasNotes: !!log.notes,
    notes: log.notes
  }))

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
      set({ summary: unwrap(res), loading: false })
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

      const mapped = mapApiCaseDetailToLocal(detail, existing)

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
     CREATE CASE
  ============================================================ */
  async createCaseRemote(payload) {
    set({ loading: true, error: null })
    try {
      const apiPayload = {
        title: payload.name,
        description: payload.description,
        case_officer: payload.investigator,
        agency: payload.agency,
        work_unit: payload.workUnit
      }

      if (payload.idMode === 'manual' && payload.id) {
        apiPayload.case_id = payload.id
      }

      const res = await window.api.invoke('cases:create', apiPayload)
      const apiCase = unwrap(res)
      const mapped = mapApiCaseListItem(apiCase)

      set({ cases: [mapped, ...get().cases], loading: false })
      return mapped
    } catch (err) {
      console.error(err)
      set({ error: err?.message || 'Failed to create case', loading: false })
      throw err
    }
  },

  /* ============================================================
     UPDATE CASE
  ============================================================ */
  async updateCaseRemote(caseId, patch) {
    set({ loading: true, error: null })
    try {
      const apiPatch = {
        ...(patch.name !== undefined ? { title: patch.name } : {}),
        ...(patch.description !== undefined ? { description: patch.description } : {}),
        ...(patch.investigator !== undefined ? { case_officer: patch.investigator } : {}),
        ...(patch.agency !== undefined ? { agency: patch.agency } : {}),
        ...(patch.workUnit !== undefined ? { work_unit: patch.workUnit } : {})
      }

      const res = await window.api.invoke('cases:update', { caseId, payload: apiPatch })
      const updated = unwrap(res)

      const current = get().cases
      const existing = current.find((c) => c.id === updated.id)
      const base = existing || mapApiCaseListItem(updated)

      const merged = {
        ...base,
        name: updated.title ?? updated.case_name ?? base.name,
        description: updated.description ?? base.description,
        status: updated.status ?? updated.case_status ?? base.status,
        agency: updated.agency ?? updated.agency_name ?? base.agency,
        workUnit: updated.work_unit ?? updated.work_unit_name ?? base.workUnit,
        investigator: updated.case_officer ?? updated.main_investigator ?? base.investigator,
        createdAt: updated.created_at ?? updated.created_date ?? base.createdAt
      }

      const nextCases = current.map((c) => (c.id === merged.id ? merged : c))

      set({ cases: nextCases, loading: false })
      return merged
    } catch (err) {
      console.error(err)
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
      const viewLogs = mapApiLogsToView(apiLogs)

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

  async changeCaseStatusRemote(caseId, { status, notes }) {
    set({ loading: true, error: null })
    try {
      const res = await window.api.invoke('caseLogs:changeStatus', {
        caseId,
        payload: { status, notes }
      })
      const log = unwrap(res)

      set({
        cases: get().cases.map((c) =>
          c.id === caseId ? { ...c, status: log?.status || status } : c
        ),
        loading: false
      })

      await get().fetchCaseLogs(caseId, { skip: 0, limit: 50 })
      return log
    } catch (err) {
      set({ error: err?.message || 'Failed to change status', loading: false })
      throw err
    }
  },

  /* ============================================================
     PERSON DELETE (POI)
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
     EVIDENCE ADD TO PERSON
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
     HELPERS
  ============================================================ */
  getCaseById: (id) => (get().cases || []).find((c) => c.id === id)
}))

// src/main/services/cases.service.js
import api from './apiClient.js'
import { Buffer } from 'node:buffer'

/* ============================================================
   1. Case Summary
   GET /cases/statistics/summary
============================================================ */
export async function getCaseStatisticsSummary() {
  const { data } = await api.get('/cases/statistics/summary')
  return data
}

/* ============================================================
   2. Get All Cases
   GET /cases/get-all-cases
   params: { skip, limit, search, status, sort_by, sort_order }
============================================================ */
export async function getAllCases(params = {}) {
  const { data } = await api.get('/cases/get-all-cases', { params })
  return data
}

/* ============================================================
   3. Case Detail Comprehensive
   GET /cases/get-case-detail-comprehensive/{case_id}
============================================================ */
export async function getCaseDetailComprehensive(caseId) {
  const { data } = await api.get(`/cases/get-case-detail-comprehensive/${caseId}`)
  return data
}

/* ============================================================
   4. Create Case
   POST /cases/create-case
   Contract API expects:
   {
     title,
     description,
     main_investigator,
     agency_name,
     work_unit_name,
     case_number? (optional)
   }
============================================================ */
export async function createCaseApi(payload) {
  // Defensive remapping — handle page lama yang masih pakai field lama
  const fixedPayload = {
    title: payload.title,
    description: payload.description,

    // Contract API fields
    main_investigator:
      payload.main_investigator ?? payload.case_officer ?? payload.officerName ?? null,

    agency_name: payload.agency_name ?? payload.agency ?? payload.agencyName ?? null,

    work_unit_name: payload.work_unit_name ?? payload.work_unit ?? payload.workUnit ?? null,

    // Optional manual case number
    case_number: payload.case_number ?? null
  }

  // Hapus key yang null agar payload bersih
  Object.keys(fixedPayload).forEach((k) => {
    if (fixedPayload[k] === null || fixedPayload[k] === undefined) {
      delete fixedPayload[k]
    }
  })

  console.log('[Create Case Payload] =>', fixedPayload)

  const { data } = await api.post('/cases/create-case', fixedPayload, {
    headers: { 'Content-Type': 'application/json' }
  })

  return data
}

/* ============================================================
   5. Update Case
   PUT /cases/update-case/{case_id}
============================================================ */
export async function updateCaseApi(caseId, payload) {
  const { data } = await api.put(`/cases/update-case/${caseId}`, payload, {
    headers: { 'Content-Type': 'application/json' }
  })
  return data
}

/* ============================================================
   6. Export Case Detail PDF
   GET /cases/export-case-details-pdf/{case_id}
   return: { buffer, filename }
============================================================ */
export async function exportCaseDetailPdf(caseId) {
  const response = await api.get(`/cases/export-case-details-pdf/${caseId}`, {
    responseType: 'arraybuffer'
  })

  const contentDisposition = response.headers['content-disposition'] || ''
  let filename = 'case_detail.pdf'

  const match = contentDisposition.match(/filename="?([^"]+)"?/)
  if (match && match[1]) filename = match[1]

  return {
    buffer: Buffer.from(response.data),
    filename
  }
}

/* ============================================================
   7. Save Case Notes
   POST /cases/save-notes
============================================================ */
export async function saveCaseNotes(payload) {
  const { data } = await api.post('/cases/save-notes', payload, {
    headers: { 'Content-Type': 'application/json' }
  })
  return data
}

/* ============================================================
   8. Edit Case Notes
   PUT /cases/edit-notes
============================================================ */
export async function editCaseNotes(payload) {
  const { data } = await api.put('/cases/edit-notes', payload, {
    headers: { 'Content-Type': 'application/json' }
  })
  return data
}

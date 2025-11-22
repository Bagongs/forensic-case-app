// src/main/services/cases.service.js
import api from './apiClient.js'
import { Buffer } from 'node:buffer'

/**
 * 1. Get Case Statistics Summary
 * GET /cases/statistics/summary
 */
export async function getCaseStatisticsSummary() {
  const { data } = await api.get('/cases/statistics/summary')
  return data
}

/**
 * 2. Get All Cases (list + filter + pagination)
 * GET /cases/get-all-cases
 * params: { skip, limit, search, status, sort_by, sort_order }
 */
export async function getAllCases(params = {}) {
  const { data } = await api.get('/cases/get-all-cases', { params })
  return data
}

/**
 * 3. Get Case Detail Comprehensive
 * GET /cases/get-case-detail-comprehensive/{case_id}
 */
export async function getCaseDetailComprehensive(caseId) {
  const { data } = await api.get(`/cases/get-case-detail-comprehensive/${caseId}`)
  return data
}

/**
 * 4. Create Case
 * POST /cases/create-case
 * body: json
 */
export async function createCaseApi(payload) {
  const { data } = await api.post('/cases/create-case', payload, {
    headers: { 'Content-Type': 'application/json' }
  })
  return data
}

/**
 * 5. Update Case
 * PUT /cases/update-case/{case_id}
 * body: json
 */
export async function updateCaseApi(caseId, payload) {
  const { data } = await api.put(`/cases/update-case/${caseId}`, payload, {
    headers: { 'Content-Type': 'application/json' }
  })
  return data
}

/**
 * 6. Export Case Detail PDF
 * GET /cases/export-case-details-pdf/{case_id}
 * return: { buffer, filename }
 */
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

/**
 * 7. Save Case Notes
 * POST /cases/save-notes
 * body: { case_id, notes }
 */
export async function saveCaseNotes(payload) {
  const { data } = await api.post('/cases/save-notes', payload, {
    headers: { 'Content-Type': 'application/json' }
  })
  return data
}

/**
 * 8. Edit Case Notes
 * PUT /cases/edit-notes
 * body: { case_id, notes }
 */
export async function editCaseNotes(payload) {
  const { data } = await api.put('/cases/edit-notes', payload, {
    headers: { 'Content-Type': 'application/json' }
  })
  return data
}

// src/main/services/caseLogs.service.js
import api from './apiClient.js'

// GET /case-logs/case/logs/{case_id}
export async function getCaseLogs({ caseId, skip = 0, limit = 10 }) {
  const { data } = await api.get(`/case-logs/case/logs/${caseId}`, {
    params: { skip, limit }
  })
  // data = { status, message, data: [...], ... }
  return data
}

// GET /case-logs/log/{log_id}
export async function getCaseLogDetail(logId) {
  const { data } = await api.get(`/case-logs/log/${logId}`)
  return data
}

// PUT /case-logs/change-log/{case_id}
export async function changeCaseStatus({ caseId, status, notes }) {
  const { data } = await api.put(`/case-logs/change-log/${caseId}`, {
    status,
    notes
  })
  // data = { status, message, data: { id, case_id, action, notes, status, created_at } }
  return data
}

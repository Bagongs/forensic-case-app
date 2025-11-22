// src/main/services/reports.service.js
import api from './apiClient.js'
import { Buffer } from 'node:buffer'

function extractFilename(headers, fallback) {
  const cd = headers?.['content-disposition'] || ''
  const match = cd.match(/filename="?([^"]+)"?/)
  return match?.[1] || fallback
}

/**
 * GET /reports/case-summary/{case_id}
 * Contract: Reports Management endpoint :contentReference[oaicite:2]{index=2}
 *
 * options:
 * - asPdf: boolean (default false)
 */
export async function getCaseSummaryReport(caseId, options = {}) {
  const { asPdf = false } = options

  if (!asPdf) {
    const { data } = await api.get(`/reports/case-summary/${caseId}`)
    return data
  }

  const res = await api.get(`/reports/case-summary/${caseId}`, {
    responseType: 'arraybuffer'
  })

  return {
    buffer: Buffer.from(res.data),
    filename: extractFilename(res.headers, `case-summary-${caseId}.pdf`)
  }
}

/**
 * GET /reports/evidence-chain/{evidence_id}
 * Contract: Reports Management endpoint :contentReference[oaicite:3]{index=3}
 *
 * options:
 * - asPdf: boolean (default false)
 */
export async function getEvidenceChainReport(evidenceId, options = {}) {
  const { asPdf = false } = options

  if (!asPdf) {
    const { data } = await api.get(`/reports/evidence-chain/${evidenceId}`)
    return data
  }

  const res = await api.get(`/reports/evidence-chain/${evidenceId}`, {
    responseType: 'arraybuffer'
  })

  return {
    buffer: Buffer.from(res.data),
    filename: extractFilename(res.headers, `evidence-chain-${evidenceId}.pdf`)
  }
}

// src/main/services/evidence.service.js
import api from './apiClient.js'
import FormData from 'form-data'
import fs from 'fs'
import { Buffer } from 'node:buffer'

/** Helper tambah field ke FormData */
function appendField(form, key, value) {
  if (value === undefined || value === null) return
  if (typeof value === 'string' && value.trim() === '') return // ✅ skip empty string
  if (typeof value === 'boolean') {
    form.append(key, value ? 'true' : 'false')
  } else {
    form.append(key, String(value))
  }
}

/**
 * Helper untuk append file dari base64 string
 * fileArg boleh:
 * - string dataURL "data:image/png;base64,...."
 * - string base64 "AAAA..."
 * - object { base64, name?, mime?/type? }
 */
function appendBase64File(form, fieldName, fileArg, fallbackName = 'file.bin') {
  if (!fileArg) return

  let base64 = ''
  let name = fallbackName
  let mime = 'application/octet-stream'

  if (typeof fileArg === 'string') {
    // bisa jadi dataURL atau raw base64
    if (fileArg.startsWith('data:')) {
      const [meta, data] = fileArg.split(',')
      base64 = data || ''
      const m = meta.match(/^data:(.+);base64$/)
      if (m) mime = m[1]
    } else {
      base64 = fileArg
    }
  } else if (typeof fileArg === 'object') {
    if (fileArg.base64) {
      if (fileArg.base64.startsWith('data:')) {
        const [meta, data] = fileArg.base64.split(',')
        base64 = data || ''
        const m = meta.match(/^data:(.+);base64$/)
        if (m) mime = m[1]
      } else {
        base64 = fileArg.base64
      }
    }
    if (fileArg.mime) mime = fileArg.mime
    if (fileArg.type) mime = fileArg.type
    if (fileArg.name) name = fileArg.name
  }

  if (!base64) return
  const buf = Buffer.from(base64, 'base64')
  form.append(fieldName, buf, { filename: name, contentType: mime })
}

/** =======================
 *  LIST Evidence
 *  GET /evidence/get-evidence-list
 * ======================= */
export async function getEvidenceList(params = {}) {
  const res = await api.get('/evidence/get-evidence-list', { params })
  return res.data
}

/** Summary */
export async function getEvidenceSummary() {
  const res = await api.get('/evidence/get-evidence-summary')
  return res.data
}

/** CREATE Evidence */
export async function createEvidence(payload) {
  const form = new FormData()

  if (payload.evidence_file) {
    const file = payload.evidence_file
    if (typeof file === 'string') {
      if (fs.existsSync(file)) {
        form.append('evidence_file', fs.createReadStream(file))
      }
    } else if (file.buffer) {
      const buf = Buffer.from(file.buffer)
      form.append('evidence_file', buf, {
        filename: file.name || 'evidence_file',
        contentType: file.type || 'application/octet-stream'
      })
    }
  }

  appendField(form, 'case_id', payload.case_id)
  appendField(form, 'evidence_number', payload.evidence_number)
  appendField(form, 'type', payload.type)
  appendField(form, 'source', payload.source)
  appendField(form, 'evidence_summary', payload.evidence_summary)
  appendField(form, 'investigator', payload.investigator)
  appendField(form, 'person_name', payload.person_name)
  appendField(form, 'suspect_status', payload.suspect_status)
  appendField(form, 'is_unknown_person', payload.is_unknown_person)
  appendField(form, 'suspect_id', payload.suspect_id)

  const res = await api.post('/evidence/create-evidence', form, {
    headers: form.getHeaders()
  })

  return res.data
}

/** =======================
 *  UPDATE Evidence (FINAL)
 *  PUT /api/v1/evidence/update-evidence/{evidence_id}
 *  all fields optional (partial update)
 * ======================= */
export async function updateEvidence(evidenceId, payload) {
  const form = new FormData()

  // FILE optional
  if (payload.evidence_file) {
    const file = payload.evidence_file
    if (typeof file === 'string') {
      if (fs.existsSync(file)) {
        form.append('evidence_file', fs.createReadStream(file))
      }
    } else if (file.buffer) {
      const buf = Buffer.from(file.buffer)
      form.append('evidence_file', buf, {
        filename: file.name || 'evidence_file',
        contentType: file.type || 'application/octet-stream'
      })
    }
  }

  // FIELD optional
  appendField(form, 'case_id', payload.case_id)

  // ✅ evidence_number only if non-empty
  if (payload.evidence_number !== undefined && payload.evidence_number !== null) {
    const evNum = String(payload.evidence_number).trim()
    if (evNum) form.append('evidence_number', evNum)
  }

  appendField(form, 'type', payload.type)
  appendField(form, 'source', payload.source)
  appendField(form, 'evidence_summary', payload.evidence_summary)
  appendField(form, 'investigator', payload.investigator)

  appendField(form, 'person_name', payload.person_name)
  appendField(form, 'suspect_status', payload.suspect_status)
  appendField(form, 'is_unknown_person', payload.is_unknown_person)
  appendField(form, 'suspect_id', payload.suspect_id)

  const res = await api.put(`/evidence/update-evidence/${evidenceId}`, form, {
    headers: form.getHeaders()
  })

  return res.data
}

/** =======================
 *  DETAIL Evidence
 *  GET /evidence/{id}/detail
 * ======================= */
export async function getEvidenceDetail(evidenceId) {
  const res = await api.get(`/evidence/${evidenceId}/detail`)
  return res.data
}

/** =======================
 *  CUSTODY: ACQUISITION
 *  POST /evidence/{id}/custody/acquisition
 * ======================= */
export async function createCustodyAcquisition(evidenceId, payload) {
  const form = new FormData()

  appendField(form, 'investigator', payload.investigator)
  appendField(form, 'location', payload.location)
  appendField(form, 'evidence_source', payload.evidence_source ?? payload.source)
  appendField(form, 'evidence_type', payload.evidence_type ?? payload.type)
  appendField(form, 'evidence_detail', payload.evidence_detail ?? payload.detail)
  appendField(form, 'notes', payload.notes)

  const steps = payload.steps || []
  steps.forEach((s) => {
    if (!s) return
    const val = typeof s === 'string' ? s : (s.desc ?? s.steps ?? s.step ?? '')
    if (val) form.append('steps', val)
  })

  let photos = payload.photos
  if (!photos || !photos.length) {
    photos = steps
      .map((s) => (typeof s === 'object' ? s.previewDataUrl || s.photo || null : null))
      .filter(Boolean)
  }

  ;(photos || []).forEach((ph, idx) => {
    appendBase64File(form, 'photos', ph, `photo-${idx + 1}.jpg`)
  })

  const res = await api.post(`/evidence/${evidenceId}/custody/acquisition`, form, {
    headers: form.getHeaders()
  })

  return res.data
}

/** =======================
 *  CUSTODY: PREPARATION
 *  POST /evidence/{id}/custody/preparation
 * ======================= */
export async function createCustodyPreparation(evidenceId, payload) {
  const form = new FormData()

  appendField(form, 'investigator', payload.investigator)
  appendField(form, 'location', payload.location)
  appendField(form, 'evidence_source', payload.evidence_source ?? payload.source)
  appendField(form, 'evidence_type', payload.evidence_type ?? payload.type)
  appendField(form, 'evidence_detail', payload.evidence_detail ?? payload.detail)
  appendField(form, 'notes', payload.notes)

  const pairs = payload.pairs || []
  const hypothesisArr =
    payload.hypothesis || pairs.map((p) => p.investigation || p.hypothesis || '').filter(Boolean)
  const toolsArr = payload.tools || pairs.map((p) => p.tools || '').filter(Boolean)

  hypothesisArr.forEach((h) => form.append('hypothesis', h))
  toolsArr.forEach((t) => form.append('tools', t))

  const res = await api.post(`/evidence/${evidenceId}/custody/preparation`, form, {
    headers: form.getHeaders()
  })

  return res.data
}

/** =======================
 *  CUSTODY: EXTRACTION
 *  POST /evidence/{id}/custody/extraction
 * ======================= */
export async function createCustodyExtraction(evidenceId, payload) {
  const form = new FormData()

  appendField(form, 'investigator', payload.investigator)
  appendField(form, 'location', payload.location)
  appendField(form, 'evidence_source', payload.evidence_source ?? payload.source)
  appendField(form, 'evidence_type', payload.evidence_type ?? payload.type)
  appendField(form, 'evidence_detail', payload.evidence_detail ?? payload.detail)
  appendField(form, 'notes', payload.notes)

  const file = (payload.files && payload.files[0]) || payload.file || null
  if (file) {
    if (file.base64) {
      appendBase64File(form, 'extraction_file', file, file.name || 'extraction.bin')
    } else if (file.buffer) {
      const buf = Buffer.from(file.buffer)
      form.append('extraction_file', buf, {
        filename: file.name || 'extraction.bin',
        contentType: file.type || 'application/octet-stream'
      })
    } else if (typeof file === 'string' && fs.existsSync(file)) {
      form.append('extraction_file', fs.createReadStream(file))
    }
  }

  const res = await api.post(`/evidence/${evidenceId}/custody/extraction`, form, {
    headers: form.getHeaders()
  })

  return res.data
}

/** =======================
 *  CUSTODY: ANALYSIS
 *  POST /evidence/{id}/custody/analysis
 * ======================= */
export async function createCustodyAnalysis(evidenceId, payload) {
  const form = new FormData()

  appendField(form, 'investigator', payload.investigator)
  appendField(form, 'location', payload.location)
  appendField(form, 'evidence_source', payload.source)
  appendField(form, 'evidence_type', payload.type)
  appendField(form, 'evidence_detail', payload.detail)
  appendField(form, 'notes', payload.notes)

  if (Array.isArray(payload.analysisPairs)) {
    payload.analysisPairs.forEach((p) => {
      form.append('hypothesis', p.investigation || '')
      form.append('tools', p.tools || '')
      form.append('result', p.result || '')
    })
  }

  if (Array.isArray(payload.files)) {
    payload.files.forEach((f, idx) => {
      appendBase64File(form, 'files', f, f.name || `report-${idx + 1}.pdf`)
    })
  }

  const res = await api.post(`/evidence/${evidenceId}/custody/analysis`, form, {
    headers: form.getHeaders()
  })
  return res.data
}

export async function updateCustodyNotes(evidenceId, reportId, notes) {
  const form = new FormData()
  form.append('notes', notes)
  const res = await api.put(`/evidence/${evidenceId}/custody/${reportId}/notes`, form)
  return res.data
}

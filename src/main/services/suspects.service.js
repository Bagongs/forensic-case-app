// src/main/services/suspects.service.js
import api from './apiClient.js'
import FormData from 'form-data'
import fs from 'fs'
import { Buffer } from 'node:buffer'
import { deletePerson as deletePersonLegacy } from './persons.service.js'

export async function getSuspectList(params = {}) {
  const res = await api.get('/suspects/', { params })
  return res.data
}

export async function getSuspectSummary() {
  const res = await api.get('/suspects/get-suspect-summary')
  return res.data
}

export async function getSuspectDetail(id) {
  const res = await api.get(`/suspects/get-suspect-detail/${id}`)
  return res.data
}

// helper kecil untuk append field biasa
function appendField(form, key, value) {
  if (value === undefined || value === null) return
  if (typeof value === 'boolean') {
    form.append(key, value ? 'true' : 'false')
  } else {
    form.append(key, String(value))
  }
}

export async function createSuspect(payload) {
  const form = new FormData()

  // === FILE HANDLING: evidence_file & suspect_image (kalau dipakai) ===
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

  if (payload.suspect_image) {
    const img = payload.suspect_image
    if (typeof img === 'string') {
      if (fs.existsSync(img)) {
        form.append('suspect_image', fs.createReadStream(img))
      }
    } else if (img.buffer) {
      const buf = Buffer.from(img.buffer)
      form.append('suspect_image', buf, {
        filename: img.name || 'suspect_image',
        contentType: img.type || 'image/jpeg'
      })
    }
  }

  // === FIELD BIASA ===
  appendField(form, 'case_id', payload.case_id)
  appendField(form, 'is_unknown_person', payload.is_unknown_person)
  appendField(form, 'person_name', payload.person_name)
  appendField(form, 'suspect_status', payload.suspect_status)
  appendField(form, 'evidence_number', payload.evidence_number)
  appendField(form, 'evidence_source', payload.evidence_source)
  appendField(form, 'evidence_summary', payload.evidence_summary)

  const res = await api.post('/suspects/create-suspect', form, {
    headers: form.getHeaders()
  })

  return res.data
}

export async function updateSuspect(id, payload) {
  const form = new FormData()

  if (payload.suspect_image) {
    const img = payload.suspect_image
    if (typeof img === 'string') {
      if (fs.existsSync(img)) {
        form.append('suspect_image', fs.createReadStream(img))
      }
    } else if (img.buffer) {
      const buf = Buffer.from(img.buffer)
      form.append('suspect_image', buf, {
        filename: img.name || 'suspect_image',
        contentType: img.type || 'image/jpeg'
      })
    }
  }

  appendField(form, 'is_unknown_person', payload.is_unknown_person)
  appendField(form, 'person_name', payload.person_name)
  appendField(form, 'suspect_status', payload.suspect_status)

  const res = await api.put(`/suspects/update-suspect/${id}`, form, {
    headers: form.getHeaders()
  })

  return res.data
}

/**
 * Save notes baru:
 * POST /api/v1/persons/save-suspect-notes/{suspect_id}
 */
export async function saveSuspectNotes({ suspect_id, notes }) {
  const res = await api.post(`/persons/save-suspect-notes/${suspect_id}`, { notes })
  return res.data
}

/**
 * Edit notes existing:
 * PUT /api/v1/persons/edit-suspect-notes/{suspect_id}
 */
export async function editSuspectNotes({ suspect_id, notes }) {
  const res = await api.put(`/persons/edit-suspect-notes/${suspect_id}`, { notes })
  return res.data
}

/**
 * Export suspect detail PDF:
 * GET /api/v1/suspects/export-suspect-detail-pdf/{suspect_id}
 * Return buffer + filename (kalau ada di header).
 */
export async function exportSuspectDetailPdf(suspect_id) {
  const res = await api.get(`/suspects/export-suspect-detail-pdf/${suspect_id}`, {
    responseType: 'arraybuffer'
  })

  // coba ambil filename dari content-disposition
  const dispo = res.headers?.['content-disposition'] || res.headers?.['Content-Disposition']
  let filename = null
  if (dispo) {
    const m = /filename="?([^"]+)"?/i.exec(dispo)
    if (m) filename = m[1]
  }

  return {
    buffer: res.data,
    filename
  }
}

export async function deleteSuspect(id) {
  return await deletePersonLegacy(id)
}

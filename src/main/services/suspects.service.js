// src/main/services/suspects.service.js
import api from './apiClient.js'
import FormData from 'form-data'
import fs from 'fs'
import { Buffer } from 'node:buffer'
import { deletePerson as deletePersonLegacy } from './persons.service.js'

// 🔧 Append field helper
function appendField(form, key, value) {
  if (value === undefined || value === null) return
  if (typeof value === 'boolean') {
    form.append(key, value ? 'true' : 'false')
  } else {
    form.append(key, String(value))
  }
}

/* ============================================================
   1. GET LIST
============================================================ */
export async function getSuspectList(params = {}) {
  const res = await api.get('/suspects/', { params })
  return res.data
}

/* ============================================================
   2. SUMMARY
============================================================ */
export async function getSuspectSummary() {
  const res = await api.get('/suspects/get-suspect-summary')
  return res.data
}

/* ============================================================
   3. DETAIL
============================================================ */
export async function getSuspectDetail(id) {
  const res = await api.get(`/suspects/get-suspect-detail/${id}`)
  return res.data
}

/* ============================================================
   4. CREATE SUSPECT
============================================================ */
export async function createSuspect(payload) {
  const form = new FormData()

  // ---- evidence_file ----
  if (payload.evidence_file) {
    const f = payload.evidence_file

    if (typeof f === 'string') {
      if (fs.existsSync(f)) {
        form.append('evidence_file', fs.createReadStream(f))
      }
    } else if (f.buffer) {
      const buf = Buffer.from(f.buffer)
      form.append('evidence_file', buf, {
        filename: f.name || 'evidence_file',
        contentType: f.type || 'application/octet-stream'
      })
    }
  }

  // ---- suspect image (optional future usage) ----
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

  // ---- inject form fields ----
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

/* ============================================================
   5. UPDATE SUSPECT  (NO EVIDENCE UPDATE)
============================================================ */
export async function updateSuspect(id, payload) {
  const form = new FormData()

  // optional image
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
  appendField(form, 'notes', payload.notes)
  appendField(form, 'case_id', payload.case_id)

  const res = await api.put(`/persons/update-person/${id}`, form, {
    headers: form.getHeaders()
  })
  return res.data
}

/* ============================================================
   6. SAVE NOTES (NEW)
============================================================ */
export async function saveSuspectNotes({ suspect_id, notes }) {
  const res = await api.post(`/persons/save-suspect-notes/${suspect_id}`, { notes })
  return res.data
}

/* ============================================================
   7. EDIT NOTES (NEW)
============================================================ */
export async function editSuspectNotes({ suspect_id, notes }) {
  const res = await api.put(`/persons/edit-suspect-notes/${suspect_id}`, { notes })
  return res.data
}

/* ============================================================
   8. EXPORT SUSPECT PDF
============================================================ */
export async function exportSuspectDetailPdf(suspectId) {
  const response = await api.get(`/suspects/export-suspect-detail-pdf/${suspectId}`, {
    responseType: 'arraybuffer',
    headers: { Accept: 'application/pdf' }
  })

  return {
    base64: Buffer.from(response.data).toString('base64'),
    filename: response.headers['content-disposition']
  }
}

/* ============================================================
   9. DELETE SUSPECT (Delete Person)
============================================================ */
export async function deleteSuspect(id) {
  // IPC already routed to persons/delete-person/{id}
  return await deletePersonLegacy(id)
}

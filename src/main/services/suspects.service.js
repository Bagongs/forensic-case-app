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
  // evidence_file bisa dikirim sebagai:
  // - string path (lama)
  // - object { name, type, size, buffer: number[] } (baru dari renderer)
  if (payload.evidence_file) {
    const file = payload.evidence_file
    if (typeof file === 'string') {
      // mode lama: path di disk
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
  // kita append manual supaya lebih eksplisit & hindari double append file
  appendField(form, 'case_id', payload.case_id)
  appendField(form, 'is_unknown_person', payload.is_unknown_person)
  appendField(form, 'person_name', payload.person_name)
  appendField(form, 'suspect_status', payload.suspect_status)
  appendField(form, 'evidence_number', payload.evidence_number)
  appendField(form, 'evidence_source', payload.evidence_source)
  appendField(form, 'evidence_summary', payload.evidence_summary)
  // kalau ada field lain, bisa ditambah di sini

  const res = await api.post('/suspects/create-suspect', form, {
    headers: form.getHeaders()
  })

  return res.data
}

export async function updateSuspect(id, payload) {
  const form = new FormData()

  // FILE (optional): suspect_image, kalau nanti kamu pakai di Edit Suspect
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

  // FIELD biasa:
  appendField(form, 'is_unknown_person', payload.is_unknown_person)
  appendField(form, 'person_name', payload.person_name)
  appendField(form, 'suspect_status', payload.suspect_status)
  // kalau ada field lain (misal extra metadata) tambahkan di sini

  const res = await api.put(`/suspects/update-suspect/${id}`, form, {
    headers: form.getHeaders()
  })

  return res.data
}

// Notes
export async function saveSuspectNotes(payload) {
  const res = await api.post('/suspects/save-suspect-notes', payload)
  return res.data
}

export async function editSuspectNotes(payload) {
  const res = await api.put('/suspects/edit-suspect-notes', payload)
  return res.data
}

export async function deleteSuspect(id) {
  return await deletePersonLegacy(id)
}

// src/main/services/persons.service.js
import api from './apiClient.js'
import FormData from 'form-data'
import fs from 'fs'
import { Buffer } from 'node:buffer'

function appendField(form, key, value) {
  if (value === undefined || value === null) return
  if (typeof value === 'boolean') {
    form.append(key, value ? 'true' : 'false')
  } else {
    form.append(key, String(value))
  }
}

function appendMaybeFile(form, fieldName, fileLike) {
  if (!fileLike) return

  // mode lama: string path
  if (typeof fileLike === 'string') {
    if (fs.existsSync(fileLike)) {
      form.append(fieldName, fs.createReadStream(fileLike))
    }
    return
  }

  // mode baru: { name, type, buffer }
  if (fileLike.buffer) {
    const buf = Buffer.from(fileLike.buffer)
    form.append(fieldName, buf, {
      filename: fileLike.name || fieldName,
      contentType: fileLike.type || 'application/octet-stream'
    })
  }
}

/**
 * POST /api/v1/persons/create-person
 * Contract: create person + evidence (legacy POI)
 */
export async function createPerson(payload) {
  const form = new FormData()

  // optional file
  appendMaybeFile(form, 'evidence_file', payload.evidence_file)

  // fields
  appendField(form, 'case_id', payload.case_id)
  appendField(form, 'person_name', payload.person_name)
  appendField(form, 'suspect_status', payload.suspect_status)
  appendField(form, 'is_unknown_person', payload.is_unknown_person)
  appendField(form, 'evidence_number', payload.evidence_number)
  appendField(form, 'evidence_source', payload.evidence_source)
  appendField(form, 'evidence_summary', payload.evidence_summary)

  const { data } = await api.post('/persons/create-person', form, {
    headers: form.getHeaders()
  })

  return data
}

/**
 * PUT /api/v1/persons/update-person/{person_id}
 * Contract: partial update POI
 */
export async function updatePerson(personId, payload) {
  const form = new FormData()

  appendMaybeFile(form, 'evidence_file', payload.evidence_file)

  appendField(form, 'person_name', payload.person_name)
  appendField(form, 'suspect_status', payload.suspect_status)
  appendField(form, 'is_unknown_person', payload.is_unknown_person)
  appendField(form, 'evidence_number', payload.evidence_number)
  appendField(form, 'evidence_source', payload.evidence_source)
  appendField(form, 'evidence_summary', payload.evidence_summary)

  const { data } = await api.put(`/persons/update-person/${personId}`, form, {
    headers: form.getHeaders()
  })

  return data
}

/**
 * DELETE /api/v1/persons/delete-person/{person_id}
 * Contract: delete POI (evidence jadi orphan/Unknown)
 */
export async function deletePerson(personId) {
  const { data } = await api.delete(`/persons/delete-person/${personId}`)
  return data
}

/**
 * POST /api/v1/persons/save-suspect-notes/{suspect_id}
 * Contract: save notes baru
 */
export async function saveSuspectNotes({ suspect_id, notes }) {
  const { data } = await api.post(`/persons/save-suspect-notes/${suspect_id}`, { notes })
  return data
}

/**
 * PUT /api/v1/persons/edit-suspect-notes/{suspect_id}
 * Contract: edit notes existing
 */
export async function editSuspectNotes({ suspect_id, notes }) {
  const { data } = await api.put(`/persons/edit-suspect-notes/${suspect_id}`, { notes })
  return data
}

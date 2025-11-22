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
 * POST /persons/create-person
 * Legacy Person Management :contentReference[oaicite:5]{index=5}
 *
 * payload (form-data):
 * - case_id (required)
 * - person_name (conditional)
 * - suspect_status (optional)
 * - is_unknown_person (optional)
 * - evidence_number / evidence_source / evidence_summary (optional)
 * - evidence_file (optional file)
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
 * PUT /persons/update-person/{person_id}
 * Legacy Person Management :contentReference[oaicite:6]{index=6}
 *
 * payload (form-data, all optional / partial update):
 * - person_name?
 * - suspect_status?
 * - is_unknown_person?
 * - evidence_number?
 * - evidence_source?
 * - evidence_summary?
 * - evidence_file? (optional file)
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
 * DELETE /persons/delete-person/{person_id}
 * Legacy Person Management :contentReference[oaicite:7]{index=7}
 */
export async function deletePerson(personId) {
  const { data } = await api.delete(`/persons/delete-person/${personId}`)
  return data
}

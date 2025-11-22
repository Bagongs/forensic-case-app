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

  if (typeof fileLike === 'string') {
    if (fs.existsSync(fileLike)) {
      form.append(fieldName, fs.createReadStream(fileLike))
    }
    return
  }

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
 * ✅ sanitize: kirim HANYA field contract (drop evidence_id dll)
 */
export async function createPerson(payload = {}) {
  const form = new FormData()

  const {
    case_id,
    person_name,
    suspect_status,
    is_unknown_person,
    evidence_number,
    evidence_source,
    evidence_summary,
    evidence_file
  } = payload

  appendMaybeFile(form, 'evidence_file', evidence_file)

  appendField(form, 'case_id', case_id)
  appendField(form, 'person_name', person_name)
  appendField(form, 'suspect_status', suspect_status)
  appendField(form, 'is_unknown_person', is_unknown_person)
  appendField(form, 'evidence_number', evidence_number)
  appendField(form, 'evidence_source', evidence_source)
  appendField(form, 'evidence_summary', evidence_summary)

  const { data } = await api.post('/persons/create-person', form, {
    headers: form.getHeaders()
  })

  return data
}

/**
 * PUT /api/v1/persons/update-person/{person_id}
 * ✅ sanitize juga
 */
export async function updatePerson(personId, payload = {}) {
  const form = new FormData()

  const {
    person_name,
    suspect_status,
    is_unknown_person,
    evidence_number,
    evidence_source,
    evidence_summary,
    evidence_file
  } = payload

  appendMaybeFile(form, 'evidence_file', evidence_file)

  appendField(form, 'person_name', person_name)
  appendField(form, 'suspect_status', suspect_status)
  appendField(form, 'is_unknown_person', is_unknown_person)
  appendField(form, 'evidence_number', evidence_number)
  appendField(form, 'evidence_source', evidence_source)
  appendField(form, 'evidence_summary', evidence_summary)

  const { data } = await api.put(`/persons/update-person/${personId}`, form, {
    headers: form.getHeaders()
  })

  return data
}

/**
 * DELETE /api/v1/persons/delete-person/{person_id}
 */
export async function deletePerson(personId) {
  const { data } = await api.delete(`/persons/delete-person/${personId}`)
  return data
}

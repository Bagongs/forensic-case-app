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

/* ============================================================
   CREATE PERSON
   POST /persons/create-person
============================================================ */
export async function createPerson(payload) {
  const form = new FormData()

  appendMaybeFile(form, 'evidence_file', payload.evidence_file)

  appendField(form, 'case_id', payload.case_id)
  appendField(form, 'person_name', payload.person_name)
  appendField(form, 'suspect_status', payload.suspect_status)
  appendField(form, 'is_unknown_person', payload.is_unknown_person)
  appendField(form, 'evidence_number', payload.evidence_number)
  appendField(form, 'evidence_source', payload.evidence_source)
  appendField(form, 'evidence_summary', payload.evidence_summary)

  const res = await api.post('/persons/create-person', form, {
    headers: form.getHeaders()
  })

  return res.data
}

/* ============================================================
   UPDATE PERSON
   PUT /persons/update-person/{person_id}
   NOTE: Tidak boleh kirim evidence!
============================================================ */
export async function updatePerson(personId, payload) {
  const form = new FormData()

  appendField(form, 'person_name', payload.person_name)
  appendField(form, 'suspect_status', payload.suspect_status)
  appendField(form, 'is_unknown_person', payload.is_unknown_person)

  const res = await api.put(`/persons/update-person/${personId}`, form, {
    headers: form.getHeaders()
  })

  return res.data
}

/* ============================================================
   DELETE PERSON
============================================================ */
export async function deletePerson(personId) {
  const res = await api.delete(`/persons/delete-person/${personId}`)
  return res.data
}

/* ============================================================
   SAVE NOTES
============================================================ */
export async function saveSuspectNotes({ suspect_id, notes }) {
  const res = await api.post(`/persons/save-suspect-notes/${suspect_id}`, { notes })
  return res.data
}

/* ============================================================
   EDIT NOTES
============================================================ */
export async function editSuspectNotes({ suspect_id, notes }) {
  const res = await api.put(`/persons/edit-suspect-notes/${suspect_id}`, { notes })
  return res.data
}

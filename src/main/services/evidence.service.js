// src/main/services/evidence.service.js
import api from './apiClient.js'
import FormData from 'form-data'
import fs from 'fs'
import { Buffer } from 'node:buffer'

/** List Evidence */
export async function getEvidenceList(params = {}) {
  const res = await api.get('/evidence/get-evidence-list', { params })
  return res.data
}

/** Summary */
export async function getEvidenceSummary() {
  const res = await api.get('/evidence/get-evidence-summary')
  return res.data
}

function appendField(form, key, value) {
  if (value === undefined || value === null) return
  if (typeof value === 'boolean') {
    form.append(key, value ? 'true' : 'false')
  } else {
    form.append(key, String(value))
  }
}

/** CREATE Evidence */
export async function createEvidence(payload) {
  const form = new FormData()

  // FILE: evidence_file bisa string path atau object buffer
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

  // FIELD BIASA
  appendField(form, 'case_id', payload.case_id)
  appendField(form, 'evidence_number', payload.evidence_number)
  appendField(form, 'type', payload.type)
  appendField(form, 'source', payload.source)
  appendField(form, 'evidence_summary', payload.evidence_summary)
  appendField(form, 'investigator', payload.investigator)
  appendField(form, 'person_name', payload.person_name)
  appendField(form, 'suspect_status', payload.suspect_status)
  appendField(form, 'is_unknown_person', payload.is_unknown_person)

  const res = await api.post('/evidence/create-evidence', form, {
    headers: form.getHeaders()
  })

  return res.data
}

/** UPDATE Evidence */
export async function updateEvidence(evidenceId, payload) {
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

  appendField(form, 'evidence_number', payload.evidence_number)
  appendField(form, 'type', payload.type)
  appendField(form, 'source', payload.source)
  appendField(form, 'evidence_summary', payload.evidence_summary)
  appendField(form, 'investigator', payload.investigator)
  appendField(form, 'person_name', payload.person_name)
  appendField(form, 'suspect_status', payload.suspect_status)
  appendField(form, 'is_unknown_person', payload.is_unknown_person)

  const res = await api.put(`/evidence/update-evidence/${evidenceId}`, form, {
    headers: form.getHeaders()
  })

  return res.data
}

import fs from 'fs'
import path from 'path'
import { app } from 'electron'
import api from './apiClient'

function buildPdfName(type, id) {
  const p = (n) => String(n).padStart(2, '0')
  const now = new Date()

  const filename = `${type}_${now.getFullYear()}${p(now.getMonth() + 1)}${p(now.getDate())}_${p(now.getHours())}${p(now.getMinutes())}${p(now.getSeconds())}.pdf`

  return filename
}

async function fetchPdf(url) {
  const response = await api.get(url, { responseType: 'arraybuffer' })
  return Buffer.from(response.data)
}

export async function saveCasePdf(caseId) {
  const buffer = await fetchPdf(`/cases/export-case-details-pdf/${caseId}`)
  const downloads = app.getPath('downloads')
  const fileName = buildPdfName('case_report', caseId)
  const fullPath = path.join(downloads, fileName)

  fs.writeFileSync(fullPath, buffer)
  return { ok: true, path: fullPath, filename: fileName }
}

export async function saveEvidencePdf(evidenceId) {
  const buffer = await fetchPdf(`/evidence/export-evidence-detail-pdf/${evidenceId}`)
  const downloads = app.getPath('downloads')
  const fileName = buildPdfName('evidence_report', evidenceId)
  const fullPath = path.join(downloads, fileName)

  fs.writeFileSync(fullPath, buffer)
  return { ok: true, path: fullPath, filename: fileName }
}

export async function saveSuspectPdf(suspectId) {
  const buffer = await fetchPdf(`/suspects/export-suspect-detail-pdf/${suspectId}`)
  const downloads = app.getPath('downloads')
  const fileName = buildPdfName('suspect_report', suspectId)
  const fullPath = path.join(downloads, fileName)

  fs.writeFileSync(fullPath, buffer)
  return { ok: true, path: fullPath, filename: fileName }
}

export async function saveEvidenceCustodyFile(filePath) {
  // 1. NORMALISASI PATH
  const cleanPath = filePath
    .replace(/^data\/custody\//, '')
    .replace(/^\/?data\/custody\//, '')
    .replace(/^\/+/, '')

  // 2. DOWNLOAD BINARY DARI BACKEND
  const buffer = await fetchPdf(`/evidence/custody/download-file?path=${cleanPath}`)

  // 3. TARGET FOLDER: DOWNLOADS
  const downloads = app.getPath('downloads')

  // 4. BIKIN FILE NAME AUTO
  const extension = cleanPath.split('.').pop()
  const fileName = buildPdfName('evidence_file', '').replace('.pdf', `.${extension}`)

  const fullPath = path.join(downloads, fileName)

  // 5. SIMPAN FILE
  fs.writeFileSync(fullPath, buffer)

  return { ok: true, path: fullPath, filename: fileName }
}

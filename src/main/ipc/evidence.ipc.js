// src/main/ipc/evidence.ipc.js
import { ipcMain } from 'electron'
import {
  getEvidenceList,
  getEvidenceSummary,
  createEvidence,
  updateEvidence,
  getEvidenceDetail,
  createCustodyAcquisition,
  createCustodyPreparation,
  createCustodyExtraction,
  createCustodyAnalysis,
  updateCustodyNotes
} from '../services/evidence.service.js'

export function registerEvidenceIpc() {
  ipcMain.handle('evidence:list', async (_event, params) => {
    try {
      return await getEvidenceList(params)
    } catch (err) {
      return {
        error: true,
        status: err?.response?.status,
        detail: err?.response?.data?.detail,
        message: err?.response?.data?.message || err.message
      }
    }
  })

  ipcMain.handle('evidence:summary', async () => {
    try {
      return await getEvidenceSummary()
    } catch (err) {
      return {
        error: true,
        status: err?.response?.status,
        detail: err?.response?.data?.detail,
        message: err?.response?.data?.message || err.message
      }
    }
  })

  ipcMain.handle('evidence:create', async (_event, payload) => {
    try {
      return await createEvidence(payload)
    } catch (err) {
      return {
        error: true,
        status: err?.response?.status,
        detail: err?.response?.data?.detail,
        message: err?.response?.data?.message || err.message
      }
    }
  })

  // ✅ FINAL UPDATE
  ipcMain.handle('evidence:update', async (_event, { evidenceId, payload }) => {
    try {
      return await updateEvidence(evidenceId, payload)
    } catch (err) {
      return {
        error: true,
        status: err?.response?.status,
        detail: err?.response?.data?.detail,
        message: err?.response?.data?.message || err.message
      }
    }
  })

  ipcMain.handle('evidence:detail', async (_event, evidenceId) => {
    try {
      return await getEvidenceDetail(evidenceId)
    } catch (err) {
      return {
        error: true,
        status: err?.response?.status,
        detail: err?.response?.data?.detail,
        message: err?.response?.data?.message || err.message
      }
    }
  })

  ipcMain.handle('evidence:custody:acquisition', async (_event, { evidenceId, payload }) => {
    try {
      return await createCustodyAcquisition(evidenceId, payload)
    } catch (err) {
      return { error: true, message: err?.response?.data?.message || err.message }
    }
  })

  ipcMain.handle('evidence:custody:preparation', async (_event, { evidenceId, payload }) => {
    try {
      return await createCustodyPreparation(evidenceId, payload)
    } catch (err) {
      return { error: true, message: err?.response?.data?.message || err.message }
    }
  })

  ipcMain.handle('evidence:custody:extraction', async (_event, { evidenceId, payload }) => {
    try {
      return await createCustodyExtraction(evidenceId, payload)
    } catch (err) {
      return { error: true, message: err?.response?.data?.message || err.message }
    }
  })

  ipcMain.handle('evidence:custody:analysis', async (_event, { evidenceId, payload }) => {
    try {
      return await createCustodyAnalysis(evidenceId, payload)
    } catch (err) {
      return { error: true, message: err?.response?.data?.message || err.message }
    }
  })

  ipcMain.handle(
    'evidence:custody:update-notes',
    async (_event, { evidenceId, reportId, notes }) => {
      try {
        return await updateCustodyNotes(evidenceId, reportId, notes)
      } catch (err) {
        return { error: true, message: err?.response?.data?.message || err.message }
      }
    }
  )
}

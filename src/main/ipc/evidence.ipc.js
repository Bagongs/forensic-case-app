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
  createCustodyAnalysis
} from '../services/evidence.service.js'

export function registerEvidenceIpc() {
  ipcMain.handle('evidence:list', async (_event, params) => {
    try {
      return await getEvidenceList(params)
    } catch (err) {
      return { error: true, message: err?.response?.data?.message || err.message }
    }
  })

  ipcMain.handle('evidence:summary', async () => {
    try {
      return await getEvidenceSummary()
    } catch (err) {
      return { error: true, message: err?.response?.data?.message || err.message }
    }
  })

  ipcMain.handle('evidence:create', async (_event, payload) => {
    try {
      return await createEvidence(payload)
    } catch (err) {
      return { error: true, message: err?.response?.data?.message || err.message }
    }
  })

  ipcMain.handle('evidence:update', async (_event, { evidenceId, payload }) => {
    try {
      return await updateEvidence(evidenceId, payload)
    } catch (err) {
      return { error: true, message: err?.response?.data?.message || err.message }
    }
  })

  /* =======================
      DETAIL
  ======================= */
  ipcMain.handle('evidence:detail', async (_event, evidenceId) => {
    try {
      return await getEvidenceDetail(evidenceId)
    } catch (err) {
      return { error: true, message: err?.response?.data?.message || err.message }
    }
  })

  /* =======================
      CUSTODY: ACQUISITION
  ======================= */
  ipcMain.handle('evidence:custody:acquisition', async (_event, { evidenceId, payload }) => {
    try {
      return await createCustodyAcquisition(evidenceId, payload)
    } catch (err) {
      return { error: true, message: err?.response?.data?.message || err.message }
    }
  })

  /* =======================
      CUSTODY: PREPARATION
  ======================= */
  ipcMain.handle('evidence:custody:preparation', async (_event, { evidenceId, payload }) => {
    try {
      return await createCustodyPreparation(evidenceId, payload)
    } catch (err) {
      return { error: true, message: err?.response?.data?.message || err.message }
    }
  })

  /* =======================
      CUSTODY: EXTRACTION
  ======================= */
  ipcMain.handle('evidence:custody:extraction', async (_event, { evidenceId, payload }) => {
    try {
      return await createCustodyExtraction(evidenceId, payload)
    } catch (err) {
      return { error: true, message: err?.response?.data?.message || err.message }
    }
  })

  /* =======================
      CUSTODY: ANALYSIS
  ======================= */
  ipcMain.handle('evidence:custody:analysis', async (_event, { evidenceId, payload }) => {
    try {
      return await createCustodyAnalysis(evidenceId, payload)
    } catch (err) {
      return { error: true, message: err?.response?.data?.message || err.message }
    }
  })
    /* =======================
      CUSTODY: UPDATE NOTES
  ======================= */
  ipcMain.handle('evidence:custody:update-notes', async (_event, { evidenceId, reportId, notes }) => {
    try {
      const { updateCustodyNotes } = await import('../services/evidence.service.js')
      return await updateCustodyNotes(evidenceId, reportId, notes)
    } catch (err) {
      return { error: true, message: err?.response?.data?.message || err.message }
    }
  })

}

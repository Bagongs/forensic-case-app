// src/main/ipc/evidence.ipc.js
import { ipcMain } from 'electron'
import {
  getEvidenceList,
  getEvidenceSummary,
  createEvidence,
  updateEvidence
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
}

// src/main/ipc/cases.ipc.js
import { ipcMain } from 'electron'
import {
  getCaseStatisticsSummary,
  getAllCases,
  getCaseDetailComprehensive,
  createCaseApi,
  updateCaseApi,
  saveCaseNotes,
  editCaseNotes,
  exportCaseDetailPdf
} from '../services/cases.service.js'

export function registerCasesIpc() {
  ipcMain.handle('cases:summary', async () => {
    try {
      return await getCaseStatisticsSummary()
    } catch (err) {
      return { error: true, message: err?.response?.data?.message || err.message }
    }
  })

  ipcMain.handle('cases:list', async (_event, params) => {
    try {
      return await getAllCases(params)
    } catch (err) {
      return { error: true, message: err?.response?.data?.message || err.message }
    }
  })

  ipcMain.handle('cases:detail', async (_event, caseId) => {
    try {
      return await getCaseDetailComprehensive(caseId)
    } catch (err) {
      return { error: true, message: err?.response?.data?.message || err.message }
    }
  })

  ipcMain.handle('cases:create', async (_event, payload) => {
    try {
      return await createCaseApi(payload)
    } catch (err) {
      return { error: true, message: err?.response?.data?.message || err.message }
    }
  })

  ipcMain.handle('cases:update', async (_event, { caseId, payload }) => {
    try {
      return await updateCaseApi(caseId, payload)
    } catch (err) {
      return { error: true, message: err?.response?.data?.message || err.message }
    }
  })

  ipcMain.handle('cases:saveNotes', async (_event, payload) => {
    try {
      return await saveCaseNotes(payload)
    } catch (err) {
      return { error: true, message: err?.response?.data?.message || err.message }
    }
  })

  ipcMain.handle('cases:editNotes', async (_event, payload) => {
    try {
      return await editCaseNotes(payload)
    } catch (err) {
      return { error: true, message: err?.response?.data?.message || err.message }
    }
  })

  ipcMain.handle('cases:exportPdf', async (_event, caseId) => {
    try {
      return await exportCaseDetailPdf(caseId)
    } catch (err) {
      return { error: true, message: err?.response?.data?.message || err.message }
    }
  })
}

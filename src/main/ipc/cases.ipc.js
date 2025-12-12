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
  getSelectCases
} from '../services/cases.service.js'
import { saveCasePdf } from '../services/export.service.js'

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

  ipcMain.handle('cases:list:select', async (_event, params) => {
    try {
      return await getSelectCases(params)
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
    console.log('[IPC Receive - create case]:', payload)
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

  ipcMain.handle('cases:exportPdf', async (_e, id) => {
    try {
      return await saveCasePdf(id)
    } catch (err) {
      return { error: true, message: err.message }
    }
  })
}

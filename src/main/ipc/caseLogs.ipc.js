// src/main/ipc/caseLogs.ipc.js
import { ipcMain } from 'electron'
import { getCaseLogs, getCaseLogDetail, changeCaseStatus } from '../services/caseLogs.service.js'

export function registerCaseLogsIpc() {
  ipcMain.handle('caseLogs:list', async (_event, { caseId, params }) => {
    try {
      return await getCaseLogs({
        caseId,
        skip: params?.skip ?? 0,
        limit: params?.limit ?? 10
      })
    } catch (err) {
      return {
        error: true,
        message: err?.response?.data?.message || err.message
      }
    }
  })

  ipcMain.handle('caseLogs:detail', async (_event, logId) => {
    try {
      return await getCaseLogDetail(logId)
    } catch (err) {
      return { error: true, message: err?.response?.data?.message || err.message }
    }
  })

  ipcMain.handle('caseLogs:changeStatus', async (_event, { caseId, payload }) => {
    try {
      return await changeCaseStatus({
        caseId,
        status: payload.status,
        notes: payload.notes
      })
    } catch (err) {
      return { error: true, message: err?.response?.data?.message || err.message }
    }
  })
}

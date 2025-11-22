// src/main/ipc/reports.ipc.js
import { ipcMain } from 'electron'
import { getCaseSummaryReport, getEvidenceChainReport } from '../services/reports.service.js'

export function registerReportsIpc() {
  ipcMain.handle('reports:caseSummary', async (_event, { caseId, asPdf }) => {
    try {
      return await getCaseSummaryReport(caseId, { asPdf })
    } catch (err) {
      return {
        error: true,
        message: err?.response?.data?.message || err.message
      }
    }
  })

  ipcMain.handle('reports:evidenceChain', async (_event, { evidenceId, asPdf }) => {
    try {
      return await getEvidenceChainReport(evidenceId, { asPdf })
    } catch (err) {
      return {
        error: true,
        message: err?.response?.data?.message || err.message
      }
    }
  })
}

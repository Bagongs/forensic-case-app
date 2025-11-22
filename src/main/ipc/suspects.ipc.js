// src/main/ipc/suspects.ipc.js
import { ipcMain } from 'electron'
import {
  getSuspectList,
  getSuspectSummary,
  getSuspectDetail,
  createSuspect,
  updateSuspect,
  saveSuspectNotes,
  editSuspectNotes,
  deleteSuspect
} from '../services/suspects.service.js'

export function registerSuspectsIpc() {
  ipcMain.handle('suspects:list', async (_event, params) => {
    try {
      return await getSuspectList(params)
    } catch (err) {
      return { error: true, message: err?.response?.data?.message || err.message }
    }
  })

  ipcMain.handle('suspects:summary', async () => {
    try {
      return await getSuspectSummary()
    } catch (err) {
      return { error: true, message: err?.response?.data?.message || err.message }
    }
  })

  ipcMain.handle('suspects:detail', async (_event, id) => {
    try {
      return await getSuspectDetail(id)
    } catch (err) {
      return { error: true, message: err?.response?.data?.message || err.message }
    }
  })

  ipcMain.handle('suspects:create', async (_event, payload) => {
    try {
      return await createSuspect(payload)
    } catch (err) {
      return { error: true, message: err?.response?.data?.message || err.message }
    }
  })

  ipcMain.handle('suspects:update', async (_event, { id, payload }) => {
    try {
      return await updateSuspect(id, payload)
    } catch (err) {
      return { error: true, message: err?.response?.data?.message || err.message }
    }
  })

  ipcMain.handle('suspects:saveNotes', async (_event, payload) => {
    try {
      return await saveSuspectNotes(payload)
    } catch (err) {
      return { error: true, message: err?.response?.data?.message || err.message }
    }
  })

  ipcMain.handle('suspects:editNotes', async (_event, payload) => {
    try {
      return await editSuspectNotes(payload)
    } catch (err) {
      return { error: true, message: err?.response?.data?.message || err.message }
    }
  })

  ipcMain.handle('suspects:delete', async (_event, id) => {
    try {
      return await deleteSuspect(id)
    } catch (err) {
      return { error: true, message: err?.response?.data?.message || err.message }
    }
  })
}

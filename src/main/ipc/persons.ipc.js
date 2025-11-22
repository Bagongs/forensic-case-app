// src/main/ipc/persons.ipc.js
import { ipcMain } from 'electron'
import {
  createPerson,
  updatePerson,
  deletePerson,
  saveSuspectNotes,
  editSuspectNotes
} from '../services/persons.service.js'

export function registerPersonsIpc() {
  ipcMain.handle('persons:create', async (_event, payload) => {
    try {
      return await createPerson(payload)
    } catch (err) {
      return {
        error: true,
        message: err?.response?.data?.detail || err?.response?.data?.message || err.message
      }
    }
  })

  ipcMain.handle('persons:update', async (_event, { id, payload }) => {
    try {
      return await updatePerson(id, payload)
    } catch (err) {
      return {
        error: true,
        message: err?.response?.data?.detail || err?.response?.data?.message || err.message
      }
    }
  })

  ipcMain.handle('persons:delete', async (_event, id) => {
    try {
      return await deletePerson(id)
    } catch (err) {
      return {
        error: true,
        message: err?.response?.data?.detail || err?.response?.data?.message || err.message
      }
    }
  })

  ipcMain.handle('persons:saveNotes', async (_event, payload) => {
    try {
      return await saveSuspectNotes(payload)
    } catch (err) {
      return {
        error: true,
        message: err?.response?.data?.detail || err?.response?.data?.message || err.message
      }
    }
  })

  ipcMain.handle('persons:editNotes', async (_event, payload) => {
    try {
      return await editSuspectNotes(payload)
    } catch (err) {
      return {
        error: true,
        message: err?.response?.data?.detail || err?.response?.data?.message || err.message
      }
    }
  })
}

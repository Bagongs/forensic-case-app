// src/main/ipc/persons.ipc.js
import { ipcMain } from 'electron'
import {
  createPerson,
  updatePerson,
  deletePerson,
  saveSuspectNotes,
  editSuspectNotes
} from '../services/persons.service.js'

const errMsg = (err) =>
  err?.response?.data?.detail || err?.response?.data?.message || err?.message || 'Unknown error'

export function registerPersonsIpc() {
  ipcMain.handle('persons:create', async (_event, payload) => {
    console.log('[IPC Receive - create case]:', payload)
    try {
      return await createPerson(payload)
    } catch (err) {
      return { error: true, message: errMsg(err) }
    }
  })

  ipcMain.handle('persons:update', async (_event, { personId, payload }) => {
    try {
      return await updatePerson(personId, payload)
    } catch (err) {
      return { error: true, message: errMsg(err) }
    }
  })

  ipcMain.handle('persons:delete', async (_event, personId) => {
    try {
      return await deletePerson(personId)
    } catch (err) {
      return { error: true, message: errMsg(err) }
    }
  })

  // notes save
  ipcMain.handle('persons:saveNotes', async (_event, payload) => {
    try {
      return await saveSuspectNotes(payload)
    } catch (err) {
      return { error: true, message: errMsg(err) }
    }
  })

  // notes edit
  ipcMain.handle('persons:editNotes', async (_event, payload) => {
    try {
      return await editSuspectNotes(payload)
    } catch (err) {
      return { error: true, message: errMsg(err) }
    }
  })
}

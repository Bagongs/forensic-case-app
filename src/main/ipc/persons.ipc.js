// src/main/ipc/persons.ipc.js
import { ipcMain } from 'electron'
import { createPerson, updatePerson, deletePerson } from '../services/persons.service.js'

export function registerPersonsIpc() {
  ipcMain.handle('persons:create', async (_event, payload) => {
    try {
      return await createPerson(payload)
    } catch (err) {
      return {
        error: true,
        message: err?.response?.data?.message || err.message
      }
    }
  })

  ipcMain.handle('persons:update', async (_event, { personId, payload }) => {
    try {
      return await updatePerson(personId, payload)
    } catch (err) {
      return {
        error: true,
        message: err?.response?.data?.message || err.message
      }
    }
  })

  ipcMain.handle('persons:delete', async (_event, personId) => {
    try {
      return await deletePerson(personId)
    } catch (err) {
      return {
        error: true,
        message: err?.response?.data?.message || err.message
      }
    }
  })
}

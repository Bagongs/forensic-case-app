// src/main/ipc/user.ipc.js
import { ipcMain } from 'electron'
import { getAllUsers, createUser, updateUser, deleteUser } from '../services/user.service.js'

export function registerUserIpc() {
  ipcMain.handle('users:list', async (_event, params) => {
    try {
      return await getAllUsers(params)
    } catch (err) {
      return {
        error: true,
        message: err?.response?.data?.message || err.message
      }
    }
  })

  ipcMain.handle('users:create', async (_event, payload) => {
    try {
      return await createUser(payload)
    } catch (err) {
      return {
        error: true,
        message: err?.response?.data?.message || err.message
      }
    }
  })

  ipcMain.handle('users:update', async (_event, { userId, payload }) => {
    try {
      return await updateUser(userId, payload)
    } catch (err) {
      return {
        error: true,
        message: err?.response?.data?.message || err.message
      }
    }
  })

  ipcMain.handle('users:delete', async (_event, userId) => {
    try {
      return await deleteUser(userId)
    } catch (err) {
      return {
        error: true,
        message: err?.response?.data?.message || err.message
      }
    }
  })
}

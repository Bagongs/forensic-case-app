// src/main/ipc/auth.ipc.js
import { ipcMain } from 'electron'
import { loginRequest, logoutRequest, getCurrentUserProfile } from '../services/auth.service.js'
import { setSession, clearSession, getSession } from '../session.js'

export function registerAuthIpc() {
  ipcMain.handle('auth:login', async (_, { email, password }) => {
    try {
      // loginRequest return { user, access_token, refresh_token }
      const res = await loginRequest(email, password)

      const payload = {
        user: res.user ?? null,
        accessToken: res.access_token ?? null,
        refreshToken: res.refresh_token ?? null
      }

      setSession(payload)
      return getSession()
    } catch (err) {
      return {
        error: true,
        message: err?.response?.data?.message || err.message
      }
    }
  })

  ipcMain.handle('auth:getSession', () => getSession())

  ipcMain.handle('auth:getProfile', async () => {
    try {
      // getCurrentUserProfile sudah return user object
      const user = await getCurrentUserProfile()
      return user
    } catch (err) {
      return {
        error: true,
        message: err?.response?.data?.message || err.message
      }
    }
  })

  ipcMain.handle('auth:logout', async () => {
    try {
      await logoutRequest()
    } finally {
      clearSession()
    }
    return { authed: false, user: null }
  })
}

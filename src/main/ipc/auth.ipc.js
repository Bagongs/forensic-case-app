// src/main/ipc/auth.ipc.js
import { ipcMain } from 'electron'
import { loginRequest, logoutRequest, getCurrentUserProfile } from '../services/auth.service.js'
import { setSession, clearSession, getSession } from '../session.js'

export function registerAuthIpc() {
  ipcMain.handle('auth:login', async (_, { email, password }) => {
    try {
      const res = await loginRequest(email, password)

      // res mengikuti Contract API:
      // { status, message, data: { user, access_token, refresh_token } }
      const payload = {
        user: res?.data?.user ?? res?.data ?? null,
        accessToken: res?.data?.access_token ?? res?.access_token ?? null,
        refreshToken: res?.data?.refresh_token ?? res?.refresh_token ?? null
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
      return await getCurrentUserProfile()
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

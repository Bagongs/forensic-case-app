// src/main/services/auth.service.js
import api from './apiClient.js'
import { setSession, clearSession, getTokens, updateTokens } from '../session.js'

// ======================= AUTH BASIC =======================

// Login → POST /api/v1/auth/login
export async function loginRequest(email, password) {
  const { data } = await api.post('/auth/login', { email, password })
  // Contract: { status, message, data: { user, access_token, refresh_token } }
  return data.data
}

// Refresh token → POST /api/v1/auth/refresh
// Contract: refresh token ROTATE → refresh lama revoke, wajib simpan yang baru
export async function refreshTokenRequest(refreshToken) {
  const { data } = await api.post('/auth/refresh', {
    refresh_token: refreshToken
  })

  const tokens = data.data // { access_token, refresh_token }

  // WAJIB update karena rotation
  updateTokens({
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token
  })

  return tokens
}

// Simpan sesi awal saat login
export function saveSession(tokensWithUser) {
  setSession({
    user: tokensWithUser.user,
    accessToken: tokensWithUser.access_token,
    refreshToken: tokensWithUser.refresh_token
  })
}

// Logout → POST /api/v1/auth/logout
export async function logoutRequest() {
  const { accessToken } = getTokens()
  try {
    await api.post('/auth/logout', null, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
  } catch {
    // kalau gagal logout ke server, tetap bersihkan session lokal
  }
  clearSession()
}

// ======================= USER PROFILE =======================

// GET /api/v1/auth/me
export async function getCurrentUserProfile() {
  const { data } = await api.get('/auth/me')
  // Contract: { status, message, data: { ...user } }
  return data.data
}

// Optional helper utk RequireAuth / store.check()
export async function checkSessionOnServer() {
  try {
    const user = await getCurrentUserProfile()
    return user || null
  } catch (err) {
    if (err.response?.status === 401) {
      clearSession()
    }
    return null
  }
}

// ======================= USER MANAGEMENT (ADMIN) =======================

export async function getAllUsers(params = {}) {
  const { data } = await api.get('/auth/get-all-users', { params })
  return data
}

export async function createUser(payload) {
  const { data } = await api.post('/auth/create-user', payload)
  return data
}

export async function updateUser(userId, payload) {
  const { data } = await api.put(`/auth/update-user/${userId}`, payload)
  return data
}

export async function deleteUser(userId) {
  const { data } = await api.delete(`/auth/delete-user/${userId}`)
  return data
}

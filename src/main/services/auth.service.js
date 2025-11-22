// src/main/services/auth.service.js
import api from './apiClient.js'
import { setSession, clearSession, getTokens /*, updateTokens */ } from '../session.js'

// ======================= AUTH BASIC =======================

// Login → POST /api/v1/auth/login
export async function loginRequest(email, password) {
  const { data } = await api.post('/auth/login', { email, password })
  // Contract: response = { status, message, data: { user, access_token, refresh_token } }
  return data.data
}

// Refresh token → POST /api/v1/auth/refresh
export async function refreshTokenRequest(refreshToken) {
  const { data } = await api.post('/auth/refresh', {
    refresh_token: refreshToken
  })

  // data.data = { access_token, refresh_token }
  // Idealnya di sini kamu juga update refresh token (token rotation)
  // kalau di session.js kamu buat helper updateTokens, boleh aktifkan:
  //
  // updateTokens({
  //   accessToken: data.data.access_token,
  //   refreshToken: data.data.refresh_token
  // })

  return data.data
}

// Simpan sesi awal saat login
export function saveSession(data) {
  setSession({
    user: data.user,
    accessToken: data.access_token,
    refreshToken: data.refresh_token
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
// Untuk cek current user (biasanya dipakai di RequireAuth / boot app)
export async function getCurrentUserProfile() {
  const { data } = await api.get('/auth/me')
  // data = { status, message, data: { id, email, fullname, tag, role, password } }
  return data
}

// Helper optional: untuk store.check(), bisa bikin:
export async function checkSessionOnServer() {
  try {
    const res = await getCurrentUserProfile()
    if (res.status === 200 && res.data) {
      return res.data // objek user
    }
    return null
  } catch (err) {
    // kalau 401, session invalid → clear
    if (err.response?.status === 401) {
      clearSession()
    }
    return null
  }
}

// ======================= USER MANAGEMENT (ADMIN) =======================

// GET /api/v1/auth/get-all-users
export async function getAllUsers(params = {}) {
  const { data } = await api.get('/auth/get-all-users', { params })
  // data = { status, message, data: [ { id, fullname, email, tag, role, created_at } ] }
  return data
}

// POST /api/v1/auth/create-user
export async function createUser(payload) {
  // payload: { fullname, email, password, confirm_password, tag }
  const { data } = await api.post('/auth/create-user', payload)
  return data
}

// PUT /api/v1/auth/update-user/{user_id}
export async function updateUser(userId, payload) {
  // payload: { fullname, email, password, confirm_password, tag }
  const { data } = await api.put(`/auth/update-user/${userId}`, payload)
  return data
}

// DELETE /api/v1/auth/delete-user/{user_id}
export async function deleteUser(userId) {
  const { data } = await api.delete(`/auth/delete-user/${userId}`)
  return data
}

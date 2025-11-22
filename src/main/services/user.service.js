// src/main/services/user.service.js
import api from './apiClient.js'

/**
 * GET /auth/get-all-users
 * params opsional: { search, skip, limit, sort_by, sort_order }
 */
export async function getAllUsers(params = {}) {
  const { data } = await api.get('/auth/get-all-users', { params })
  return data
}

/**
 * POST /auth/create-user
 * body: {
 *   fullname,
 *   email,
 *   password,
 *   confirm_password,
 *   tag
 * }
 */
export async function createUser(payload) {
  const { data } = await api.post('/auth/create-user', payload, {
    headers: { 'Content-Type': 'application/json' }
  })
  return data
}

/**
 * PUT /auth/update-user/{user_id}
 * body: { fullname, email, password?, confirm_password?, tag? }
 */
export async function updateUser(userId, payload) {
  const { data } = await api.put(`/auth/update-user/${userId}`, payload, {
    headers: { 'Content-Type': 'application/json' }
  })
  return data
}

/**
 * DELETE /auth/delete-user/{user_id}
 */
export async function deleteUser(userId) {
  const { data } = await api.delete(`/auth/delete-user/${userId}`)
  return data
}

/**
 * GET /auth/me
 * Untuk mengambil profile user login saat ini
 */
export async function getCurrentUserProfile() {
  const { data } = await api.get('/auth/me')
  return data
}

/**
 * Helper optional untuk store auth (misalnya di RequireAuth)
 * Mengembalikan: user object atau null
 */
export async function checkSessionOnServer() {
  try {
    const res = await getCurrentUserProfile()
    if (res?.data) return res.data
    return null
  } catch (err) {
    if (err.response?.status === 401) return null
    return null
  }
}

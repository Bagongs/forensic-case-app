// src/main/services/apiClient.js
import axios from 'axios'
import { getTokens, updateTokens, clearSession } from '../session.js'
import { refreshTokenRequest } from './auth.service.js'

const api = axios.create({
  baseURL: process.env.BACKEND_URL || 'http://172.15.2.105:8000/api/v1'
})

// ============================
// LOGGER HELPERS
// ============================
function logRequest(config) {
  const fullUrl = config.baseURL + config.url
  const method = (config.method || 'GET').toUpperCase()
  const params = config.params ? ` params=${JSON.stringify(config.params)}` : ''
  const body = config.data ? ` body=${JSON.stringify(config.data)}` : ''

  console.log(`[API →] ${method} ${fullUrl}${params}${body}`)
}

function logResponse(response) {
  const path = response.config.url
  console.log(`[API ←] ${response.status} ${path}`)
}

function logError(error) {
  if (error.response) {
    console.log(`[API ERROR] ${error.response.status} ${error.response.config.url}`)
  } else {
    console.log(`[API ERROR] ${error.message}`)
  }
}

// === REQUEST INTERCEPTOR ===
api.interceptors.request.use(
  (config) => {
    const { accessToken } = getTokens()
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    logRequest(config)
    return config
  },
  (error) => {
    logError(error)
    return Promise.reject(error)
  }
)

// FLAG untuk mencegah infinite loop refresh
let isRefreshing = false
let failedQueue = []

function processQueue(error, token = null) {
  failedQueue.forEach((p) => {
    if (error) p.reject(error)
    else p.resolve(token)
  })
  failedQueue = []
}

// === RESPONSE INTERCEPTOR ===
api.interceptors.response.use(
  (response) => {
    // ✅ log sukses
    logResponse(response)
    return response
  },

  async (error) => {
    // ✅ log error dulu biar kelihatan di terminal
    logError(error)

    const original = error.config || {}

    // Kalau error bukan 401 → lempar ke renderer
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }

    // Mulai refresh token
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((newToken) => {
          original.headers = original.headers || {}
          original.headers.Authorization = 'Bearer ' + newToken
          return api(original) // request interceptor akan log ulang [API →]
        })
        .catch((err) => Promise.reject(err))
    }

    original._retry = true
    isRefreshing = true

    const { refreshToken } = getTokens()

    if (!refreshToken) {
      clearSession()
      return Promise.reject(error)
    }

    try {
      const newTokens = await refreshTokenRequest(refreshToken)

      updateTokens({
        accessToken: newTokens.access_token,
        refreshToken: newTokens.refresh_token
      })

      processQueue(null, newTokens.access_token)

      original.headers = original.headers || {}
      original.headers.Authorization = `Bearer ${newTokens.access_token}`

      return api(original) // request interceptor log ulang, response interceptor log [API ←]
    } catch (err) {
      processQueue(err, null)
      clearSession()
      return Promise.reject(err)
    } finally {
      isRefreshing = false
    }
  }
)

export default api

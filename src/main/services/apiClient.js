// src/main/services/apiClient.js
import axios from 'axios'
import { getTokens, clearSession } from '../session.js'
import { refreshTokenRequest } from './auth.service.js'

const api = axios.create({
  baseURL: import.meta.env?.VITE_BACKEND_URL + '/api/v1'
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

    // ⛔ JANGAN kirim Authorization untuk refresh endpoint
    const isRefreshEndpoint = typeof config.url === 'string' && config.url.includes('/auth/refresh')

    if (!isRefreshEndpoint && accessToken) {
      config.headers = config.headers || {}
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

// ============================
// REFRESH QUEUE (ANTI DOBEL)
// ============================
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
    logResponse(response)
    return response
  },
  async (error) => {
    logError(error)

    const original = error.config || {}

    // kalau bukan 401 atau sudah retry → stop
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }

    // jangan refresh kalau 401 dari refresh endpoint sendiri
    if (typeof original.url === 'string' && original.url.includes('/auth/refresh')) {
      clearSession()
      return Promise.reject(error)
    }

    // kalau lagi refresh, antri
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((newToken) => {
          original.headers = original.headers || {}
          original.headers.Authorization = 'Bearer ' + newToken
          return api(original)
        })
        .catch((err) => Promise.reject(err))
    }

    original._retry = true
    isRefreshing = true

    const { refreshToken } = getTokens()
    if (!refreshToken) {
      clearSession()
      isRefreshing = false
      return Promise.reject(error)
    }

    try {
      // refreshTokenRequest SUDAH updateTokens() di service
      const newTokens = await refreshTokenRequest(refreshToken)

      processQueue(null, newTokens.access_token)

      original.headers = original.headers || {}
      original.headers.Authorization = `Bearer ${newTokens.access_token}`

      return api(original)
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

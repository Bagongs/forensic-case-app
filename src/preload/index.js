// src/preload/index.js
import { contextBridge, ipcRenderer } from 'electron'

/**
 * WHITELIST channel IPC yang boleh diakses renderer.
 * Ini best practice security untuk production Electron.
 */
const VALID_CHANNELS = new Set([
  // auth
  'auth:login',
  'auth:getSession',
  'auth:getProfile',
  'auth:logout',

  // cases
  'cases:summary',
  'cases:list',
  'cases:detail',
  'cases:create',
  'cases:update',
  'cases:saveNotes',
  'cases:editNotes',
  'cases:exportPdf',

  // case logs
  'caseLogs:list',
  'caseLogs:detail',
  'caseLogs:changeStatus',

  // evidence
  'evidence:list',
  'evidence:summary',
  'evidence:create',
  'evidence:update',

  // suspects
  'suspects:list',
  'suspects:summary',
  'suspects:detail',
  'suspects:create',
  'suspects:update',
  'suspects:saveNotes',
  'suspects:editNotes',

  // reports
  'reports:caseSummary',
  'reports:evidenceChain',

  // persons legacy
  'persons:create',
  'persons:update',
  'persons:delete',

  // users management
  'users:list',
  'users:create',
  'users:update',
  'users:delete'
])

/**
 * 1) API utama: invoke(channel, args)
 * Dipakai semua hooks baru kita.
 */
contextBridge.exposeInMainWorld('api', {
  invoke: (channel, args) => {
    if (!VALID_CHANNELS.has(channel)) {
      throw new Error(`Blocked IPC channel: ${channel}`)
    }
    return ipcRenderer.invoke(channel, args)
  }
})

/**
 * 2) BACKWARD COMPAT (opsional)
 * Kalau masih ada page lama pakai window.authApi / window.api.cases.*, ini menjaga agar tidak rusak.
 * Wrapper ini SUDAH DISINKRONKAN dengan IPC baru (tanpa token).
 */
contextBridge.exposeInMainWorld('authApi', {
  login: (email, password) => ipcRenderer.invoke('auth:login', { email, password }),
  logout: () => ipcRenderer.invoke('auth:logout'),
  getSession: () => ipcRenderer.invoke('auth:getSession'),
  getProfile: () => ipcRenderer.invoke('auth:getProfile')
})

contextBridge.exposeInMainWorld('apiLegacy', {
  cases: {
    summary: () => ipcRenderer.invoke('cases:summary'),
    list: (params) => ipcRenderer.invoke('cases:list', params),
    detail: (caseId) => ipcRenderer.invoke('cases:detail', caseId),
    create: (payload) => ipcRenderer.invoke('cases:create', payload),
    update: (caseId, payload) => ipcRenderer.invoke('cases:update', { caseId, payload }),
    saveNotes: (payload) => ipcRenderer.invoke('cases:saveNotes', payload),
    editNotes: (payload) => ipcRenderer.invoke('cases:editNotes', payload),
    exportPdf: (caseId) => ipcRenderer.invoke('cases:exportPdf', caseId)
  },

  caseLogs: {
    list: (caseId, params) => ipcRenderer.invoke('caseLogs:list', { caseId, params }),
    detail: (logId) => ipcRenderer.invoke('caseLogs:detail', logId),
    changeStatus: (caseId, payload) =>
      ipcRenderer.invoke('caseLogs:changeStatus', { caseId, payload })
  },

  evidence: {
    list: (params) => ipcRenderer.invoke('evidence:list', params),
    summary: () => ipcRenderer.invoke('evidence:summary'),
    create: (payload) => ipcRenderer.invoke('evidence:create', payload),
    update: (evidenceId, payload) => ipcRenderer.invoke('evidence:update', { evidenceId, payload })
  },

  suspects: {
    list: (params) => ipcRenderer.invoke('suspects:list', params),
    summary: () => ipcRenderer.invoke('suspects:summary'),
    detail: (id) => ipcRenderer.invoke('suspects:detail', id),
    create: (payload) => ipcRenderer.invoke('suspects:create', payload),
    update: (id, payload) => ipcRenderer.invoke('suspects:update', { id, payload }),
    saveNotes: (payload) => ipcRenderer.invoke('suspects:saveNotes', payload),
    editNotes: (payload) => ipcRenderer.invoke('suspects:editNotes', payload)
  },

  reports: {
    caseSummary: (caseId, asPdf = false) =>
      ipcRenderer.invoke('reports:caseSummary', { caseId, asPdf }),
    evidenceChain: (evidenceId, asPdf = false) =>
      ipcRenderer.invoke('reports:evidenceChain', { evidenceId, asPdf })
  },

  persons: {
    create: (payload) => ipcRenderer.invoke('persons:create', payload),
    update: (personId, payload) => ipcRenderer.invoke('persons:update', { personId, payload }),
    delete: (personId) => ipcRenderer.invoke('persons:delete', personId)
  },

  users: {
    list: (params) => ipcRenderer.invoke('users:list', params),
    create: (payload) => ipcRenderer.invoke('users:create', payload),
    update: (userId, payload) => ipcRenderer.invoke('users:update', { userId, payload }),
    delete: (userId) => ipcRenderer.invoke('users:delete', userId)
  }
})

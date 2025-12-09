// src/main/index.js
import { app, shell, BrowserWindow, session } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

// Import IPC registrars
import { registerAuthIpc } from './ipc/auth.ipc.js'
import { registerCasesIpc } from './ipc/cases.ipc.js'
import { registerCaseLogsIpc } from './ipc/caselogs.ipc.js'
import { registerEvidenceIpc } from './ipc/evidence.ipc.js'
import { registerSuspectsIpc } from './ipc/suspects.ipc.js'
import { registerReportsIpc } from './ipc/reports.ipc.js'
import { registerPersonsIpc } from './ipc/persons.ipc.js'
import { registerUserIpc } from './ipc/user.ipc.js'

process.on('uncaughtException', (err) => console.error('[uncaughtException]', err))
process.on('unhandledRejection', (reason) => console.error('[unhandledRejection]', reason))

const BACKEND_BASE = import.meta.env?.VITE_BACKEND_URL

const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) app.quit()

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 960,
    show: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => mainWindow.show())

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('case-analytics-platform')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const isDev = !app.isPackaged

    const cspDev = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: http://localhost:5173",
      "style-src 'self' 'unsafe-inline'",
      `img-src 'self' data: blob: https: http://localhost:5173 http://localhost:8000 ${BACKEND_BASE}`,
      "font-src 'self' data:",
      `connect-src 'self' http://localhost:8000 ${BACKEND_BASE} ws://localhost:5173 http://localhost:5173`,
      "worker-src 'self' blob:"
    ].join('; ')

    const cspProd = [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      `img-src 'self' data: blob: https: http://localhost:5173 http://localhost:8000 ${BACKEND_BASE}`,
      "font-src 'self' data:",
      "connect-src 'self' http://localhost:8000",
      "worker-src 'self' blob:"
    ].join('; ')

    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [isDev ? cspDev : cspProd]
      }
    })
  })

  registerAuthIpc()
  registerCasesIpc()
  registerCaseLogsIpc()
  registerEvidenceIpc()
  registerSuspectsIpc()
  registerReportsIpc()
  registerPersonsIpc()
  registerUserIpc()

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

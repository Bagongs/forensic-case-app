// src/main/index.js
import { app, shell, BrowserWindow } from 'electron'
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

/* ====== Unhandled errors safeguard ====== */
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err)
})
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason)
})

/* ====== Single Instance Lock (hindari multi-window app start) ====== */
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    fullscreen: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

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
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Registrasi semua IPC
  registerAuthIpc()
  registerCasesIpc()
  registerCaseLogsIpc()
  registerEvidenceIpc()
  registerSuspectsIpc()
  registerReportsIpc()
  registerPersonsIpc()
  registerUserIpc()

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

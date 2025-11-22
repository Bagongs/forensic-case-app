// src/main/ipc/suspects.ipc.js
import { ipcMain } from 'electron'
import {
  getSuspectList,
  getSuspectSummary,
  getSuspectDetail,
  createSuspect,
  updateSuspect,
  saveSuspectNotes,
  editSuspectNotes,
  exportSuspectDetailPdf,
  deleteSuspect
} from '../services/suspects.service.js'

// helper: ambil pesan error terbaik dari axios / node error
function toIpcError(err, fallback = 'Unexpected error') {
  const msg =
    err?.response?.data?.message || err?.response?.data?.detail || err?.message || fallback
  return { error: true, message: msg }
}

export function registerSuspectsIpc() {
  /* ============================================================
     LIST
  ============================================================ */
  ipcMain.handle('suspects:list', async (_event, params = {}) => {
    try {
      return await getSuspectList(params)
    } catch (err) {
      return toIpcError(err, 'Failed to fetch suspects')
    }
  })

  /* ============================================================
     SUMMARY
  ============================================================ */
  ipcMain.handle('suspects:summary', async () => {
    try {
      return await getSuspectSummary()
    } catch (err) {
      return toIpcError(err, 'Failed to fetch suspect summary')
    }
  })

  /* ============================================================
     DETAIL
  ============================================================ */
  ipcMain.handle('suspects:detail', async (_event, id) => {
    try {
      return await getSuspectDetail(id)
    } catch (err) {
      return toIpcError(err, 'Failed to fetch suspect detail')
    }
  })

  /* ============================================================
     CREATE
  ============================================================ */
  ipcMain.handle('suspects:create', async (_event, payload) => {
    try {
      // optional debug log (mirip cases)
      console.log('[IPC Receive - create suspect]:', payload)

      const res = await createSuspect(payload)

      console.log('[IPC Response - create suspect]:', res)
      return res
    } catch (err) {
      return toIpcError(err, 'Failed to create suspect')
    }
  })

  /* ============================================================
     UPDATE
  ============================================================ */
  ipcMain.handle('suspects:update', async (_event, { id, payload }) => {
    try {
      console.log('[IPC Receive - update suspect]:', { id, payload })

      const res = await updateSuspect(id, payload)

      console.log('[IPC Response - update suspect]:', res)
      return res
    } catch (err) {
      return toIpcError(err, 'Failed to update suspect')
    }
  })

  /* ============================================================
     NOTES - SAVE (POST persons/save-suspect-notes/{id})
  ============================================================ */
  ipcMain.handle('suspects:saveNotes', async (_event, payload) => {
    try {
      console.log('[IPC Receive - save suspect notes]:', payload)

      const res = await saveSuspectNotes(payload)

      console.log('[IPC Response - save suspect notes]:', res)
      return res
    } catch (err) {
      return toIpcError(err, 'Failed to save suspect notes')
    }
  })

  /* ============================================================
     NOTES - EDIT (PUT persons/edit-suspect-notes/{id})
  ============================================================ */
  ipcMain.handle('suspects:editNotes', async (_event, payload) => {
    try {
      console.log('[IPC Receive - edit suspect notes]:', payload)

      const res = await editSuspectNotes(payload)

      console.log('[IPC Response - edit suspect notes]:', res)
      return res
    } catch (err) {
      return toIpcError(err, 'Failed to edit suspect notes')
    }
  })

  /* ============================================================
     EXPORT PDF
     Return: { ok:true, buffer:ArrayBuffer, filename?:string }
  ============================================================ */
  ipcMain.handle('suspects:exportPdf', async (_event, suspect_id) => {
    try {
      console.log('[IPC Receive - export suspect pdf]:', suspect_id)

      const out = await exportSuspectDetailPdf(suspect_id)
      return { ok: true, ...out }
    } catch (err) {
      return toIpcError(err, 'Failed to export suspect PDF')
    }
  })

  /* ============================================================
     DELETE PERSON (contract: DELETE /persons/delete-person/{id})
     Service deleteSuspect sudah mengarah ke persons.service.js legacy.
  ============================================================ */
  ipcMain.handle('suspects:delete', async (_event, id) => {
    try {
      console.log('[IPC Receive - delete suspect/person]:', id)

      return await deleteSuspect(id)
    } catch (err) {
      return toIpcError(err, 'Failed to delete person')
    }
  })
}

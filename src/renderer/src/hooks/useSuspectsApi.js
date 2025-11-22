// src/renderer/src/hooks/useSuspectsApi.js
import { useIpc } from './useIpc'

export function useSuspectsApi() {
  const { invoke } = useIpc()

  return {
    listSuspects: (params) => invoke('suspects:list', params),

    getSummary: () => invoke('suspects:summary'),

    getDetail: (id) => invoke('suspects:detail', id),

    createSuspect: (payload) => invoke('suspects:create', payload),

    updateSuspect: (id, payload) => invoke('suspects:update', { id, payload }),

    saveNotes: (payload) => invoke('suspects:saveNotes', payload),

    editNotes: (payload) => invoke('suspects:editNotes', payload),

    exportPdf: (suspectId) => invoke('suspects:exportPdf', suspectId),

    deleteSuspect: (id) => invoke('suspects:delete', id)
  }
}

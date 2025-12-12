// src/renderer/src/hooks/useCasesApi.js
import { useIpc } from './useIpc'

export function useCasesApi() {
  const { invoke } = useIpc()

  return {
    getSummary: () => invoke('cases:summary'),

    listCases: (params) => invoke('cases:list', params),

    selectCases: () => invoke('cases:list:select'),

    getDetail: (caseId) => invoke('cases:detail', caseId),

    createCase: (payload) => invoke('cases:create', payload),

    updateCase: (caseId, payload) => invoke('cases:update', { caseId, payload }),

    saveNotes: (payload) => invoke('cases:saveNotes', payload),

    editNotes: (payload) => invoke('cases:editNotes', payload),

    exportPdf: (caseId) => invoke('cases:exportPdf', caseId)
  }
}

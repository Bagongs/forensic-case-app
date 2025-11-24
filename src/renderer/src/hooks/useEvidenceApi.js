// src/renderer/src/hooks/useEvidenceApi.js
import { useIpc } from './useIpc'

export function useEvidenceApi() {
  const { invoke } = useIpc()

  return {
    listEvidence: (params) => invoke('evidence:list', params),

    getSummary: () => invoke('evidence:summary'),

    createEvidence: (payload) => invoke('evidence:create', payload),
    updateEvidence: (evidenceId, payload) => invoke('evidence:update', { evidenceId, payload }),

    /* DETAIL */
    getEvidenceDetail: (evidenceId) => invoke('evidence:detail', evidenceId),

    /* =======================
        CUSTODY ENDPOINTS
       ======================= */

    /** POST /evidence/{id}/custody/acquisition */
    createCustodyAcquisition: (evidenceId, payload) =>
      invoke('evidence:custody:acquisition', { evidenceId, payload }),

    /** POST /evidence/{id}/custody/preparation */
    createCustodyPreparation: (evidenceId, payload) =>
      invoke('evidence:custody:preparation', { evidenceId, payload }),

    /** POST /evidence/{id}/custody/extraction */
    createCustodyExtraction: (evidenceId, payload) =>
      invoke('evidence:custody:extraction', { evidenceId, payload }),

    /** POST /evidence/{id}/custody/analysis */
    createCustodyAnalysis: (evidenceId, payload) =>
      invoke('evidence:custody:analysis', { evidenceId, payload }),

    updateCustodyNotes: (evidenceId, reportId, notes) =>
      invoke('evidence:custody:update-notes', { evidenceId, reportId, notes })
  }
}

// src/renderer/src/hooks/useEvidenceApi.js
import { useIpc } from './useIpc'

export function useEvidenceApi() {
  const { invoke } = useIpc()

  return {
    listEvidence: (params) => invoke('evidence:list', params),

    getSummary: () => invoke('evidence:summary'),

    createEvidence: (payload) => invoke('evidence:create', payload),

    updateEvidence: (evidenceId, payload) => invoke('evidence:update', { evidenceId, payload })
  }
}

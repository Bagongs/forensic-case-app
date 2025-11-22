// src/renderer/src/hooks/useReportsApi.js
import { useIpc } from './useIpc'

export function useReportsApi() {
  const { invoke } = useIpc()

  return {
    caseSummary: (caseId, asPdf = false) => invoke('reports:caseSummary', { caseId, asPdf }),

    evidenceChain: (evidenceId, asPdf = false) =>
      invoke('reports:evidenceChain', { evidenceId, asPdf })
  }
}
